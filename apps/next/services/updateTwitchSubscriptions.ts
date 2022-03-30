import { TwitchSubscriptionStatus } from '@app/types/twitch';
import { Account } from '@prisma/client';
import { AccountsService } from './AccountsService';
import { Context } from './Context';
import { Features, FeaturesService } from './FeaturesService';
import { TwitchSubscriptionService } from './twitch/TwitchSubscriptionService';

/**
 * Create/deletes Twitch EventSub subscriptions based on what features the user has enabled
 * @param context
 */
export async function updateTwitchSubscriptions(context: Context): Promise<void> {

    const { userId } = context;
    const accounts = await AccountsService.getAccountsById(userId);
    const twitchAccount: Account = accounts['twitch'];

    // get a list of what EventSub subscription types are needed to have based on what features user has enabled
    const neededSubscriptionTypes = await getSubscriptionTypes(context);

    const subscriptionService = new TwitchSubscriptionService(context);

    // get a list of all currently created Twitch EventSub subcriptions
    const userSubscriptions = await subscriptionService.getSubscriptions(twitchAccount.providerAccountId);

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

    await subscriptionService.deleteMany(subsToDelete); // delete the ones we don't need anymore

    // create the new ones we need
    const createRequests = subscriptionTypesToCreate.map((type) => subscriptionService.createOne(type, twitchAccount.providerAccountId));
    await Promise.all(createRequests);
}

const streamUpAndDown = ['stream.online', 'stream.offline'];

// map each feature to a list of what subscription types it depends on
const featureSubscriptionTypes: Record<Features, string[]> = {
    banner: streamUpAndDown,
    tweet: streamUpAndDown,
    twitterName: streamUpAndDown,
    profileImage: streamUpAndDown,
};

/**
 * @param userId
 * @returns Array of Twitch EventSub subcription types that are needed for the users enabled features
 */
async function getSubscriptionTypes(context: Context): Promise<string[]> {
    const subscriptionTypes: Record<string, boolean> = {};
    const enabledFeatures: string[] = await FeaturesService.listEnabled(context);
    enabledFeatures.forEach((feature) => {
        featureSubscriptionTypes[feature as keyof typeof featureSubscriptionTypes].forEach((type) => (subscriptionTypes[type] = true));
    });

    return Object.keys(subscriptionTypes);
}
