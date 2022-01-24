import { TwitchSubscriptionStatus } from '@app/types/twitch';
import { getAccountsById } from '@app/util/getAccountsById';
import { listSubscriptions } from '@app/util/twitch/listSubscriptions';
import { Account } from '@prisma/client';
import { Features, FeaturesService } from './FeaturesService';
import { TwitchSubscriptionService } from './TwitchSubscriptionService';

const streamUpAndDown = ['stream.online', 'stream.offline'];

// map each feature to a list of what subscription types it depends on
const featureSubscriptionTypes: Record<Features, string[]> = {
    banner: streamUpAndDown,
    tweet: streamUpAndDown,
    twitterName: streamUpAndDown,
    profileImage: streamUpAndDown,
};

/**
 * Create/deletes Twitch EventSub subscriptions based on what features the user has enabled
 * @param userId
 */
export async function updateTwitchSubscriptions(userId: string): Promise<void> {
    const accounts = await getAccountsById(userId);
    const twitchAccount: Account = accounts['twitch'];

    // get a list of what EventSub subscription types are needed to have based on what features user has enabled
    const neededSubscriptionTypes = await getSubscriptionTypes(userId);

    // get a list of all currently created Twitch EventSub subcriptions
    const userSubscriptions = await listSubscriptions(twitchAccount.providerAccountId);

    const subscriptionTypesToCreate: string[] = [];
    const subscriptionIdsToKeep: string[] = [];

    // for each type of subscription we must have for the user
    neededSubscriptionTypes.forEach((type) => {
        // get any pre-existing subscriptions for that type
        const enabledSubscriptionsOfType = userSubscriptions.filter((sub) => sub.type === type && sub.status === TwitchSubscriptionStatus.Enabled);

        // if there is a pre-existing subscription and it's enabled, then keep the subscription
        if (enabledSubscriptionsOfType.length > 0) {
            subscriptionIdsToKeep.push(enabledSubscriptionsOfType[0].id);
        } else {
            // If there isn't a pre-existing subscription for this type, then we need to create a subscription for this type
            subscriptionTypesToCreate.push(type);
        }
    });

    // get a list of subscriptions we need to delete by taking all existing subscriptions and excluding the ones we want to keep
    const subsToDelete = userSubscriptions.filter((sub) => !subscriptionIdsToKeep.includes(sub.id));

    const subscriptionService = new TwitchSubscriptionService();
    await subscriptionService.deleteMany(subsToDelete); // delete the ones we don't need anymore

    // create the new ones we need
    const createRequests = subscriptionTypesToCreate.map((type) => subscriptionService.createOne(userId, type, twitchAccount.providerAccountId));
    await Promise.all(createRequests);
}

/**
 * @param userId
 * @returns Array of Twitch EventSub subcription types that are needed for the users enabled features
 */
async function getSubscriptionTypes(userId: string): Promise<string[]> {
    const subscriptionTypes: Record<string, boolean> = {};
    const enabledFeatures: string[] = await FeaturesService.listEnabled(userId);
    enabledFeatures.forEach((feature) => {
        featureSubscriptionTypes[feature].forEach((type) => (subscriptionTypes[type] = true));
    });

    return Object.keys(subscriptionTypes);
}
