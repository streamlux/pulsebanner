import { TwitchSubscriptionStatus } from "@app/types/twitch";
import { localAxios } from "@app/util/axios";
import { getAccountsById } from "@app/util/getAccountsById";
import { listSubscriptions } from "@app/util/twitch/listSubscriptions";
import { Account } from "@prisma/client";
import { Features } from "./FeaturesService";
import { TwitchSubscriptionService } from "./TwitchSubscriptionService";

const streamUpAndDown = ['stream.online', 'stream.offline'];
const featureSubscriptionTypes: Record<Features, string[]> = {
    banner: streamUpAndDown,
    tweet: streamUpAndDown
}

/**
 * Create/deletes Twitch EventSub subscriptions based on what features the user has enabled
 * @param userId
 */
export async function updateTwitchSubscriptions(userId: string): Promise<void> {

    const accounts = await getAccountsById(userId);
    const twitchAccount: Account = accounts['twitch'];

    const neededSubscriptionTypes = await getSubscriptionTypes(userId);
    const userSubscriptions = await listSubscriptions(twitchAccount.providerAccountId);

    const subscriptionTypesToCreate: string[] = [];
    const subscriptionIdsToKeep: string[] = [];

    neededSubscriptionTypes.forEach((type) => {
        const enabledSubscriptionsOfType = userSubscriptions.filter(sub => sub.type === type && sub.status === TwitchSubscriptionStatus.Enabled);

        // if a subscription already exists and is enabled for this type, keep it
        if (enabledSubscriptionsOfType.length > 0) {
            subscriptionIdsToKeep.push(enabledSubscriptionsOfType[0].id);
        } else {
            // else, we need to create a subscription for this type
            subscriptionTypesToCreate.push(type);
        }
    });

    const subsToDelete = userSubscriptions.filter(sub => !subscriptionIdsToKeep.includes(sub.id));

    // console.log({ neededSubscriptionTypes, subscriptionIdsToKeep, subscriptionTypesToCreate, userSubscriptions, subsToDelete });

    const subscriptionService = new TwitchSubscriptionService();
    await subscriptionService.deleteMany(subsToDelete);

    const createRequests = subscriptionTypesToCreate.map((type) => subscriptionService.createOne(userId, type, twitchAccount.providerAccountId));
    await Promise.all(createRequests);
}

/**
 * @param userId
 * @returns Array of Twitch EventSub subcription types that are needed for the users enabled features
 */
async function getSubscriptionTypes(userId: string): Promise<string[]> {
    const subscriptionTypes: Record<string, boolean> = {};
    const response = await localAxios.get<{ enabled: Features[] }>(`/api/features/${userId}`);
    const features = response.data;
    features.enabled.forEach((feature) => {
        featureSubscriptionTypes[feature].forEach((type) => subscriptionTypes[type] = true);
    });

    return Object.keys(subscriptionTypes);
}
