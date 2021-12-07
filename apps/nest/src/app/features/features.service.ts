import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';
import { TwitchSubscriptionStatus } from '@pulsebanner/util/twitch';
import { PrismaService } from '../prisma/prisma.service';
import { TwitchApiService } from '../twitch/api/twitch-api.service';

export type Features = keyof Pick<Prisma.UserInclude, 'banner' | 'tweet'>;
const features: Features[] = ['banner', 'tweet'];


const streamUpAndDown = ['stream.online', 'stream.offline'];

// map each feature to a list of what subscription types it depends on
const featureSubscriptionTypes: Record<Features, string[]> = {
    banner: streamUpAndDown,
    tweet: streamUpAndDown
}

@Injectable()
export class FeaturesService {

    constructor(private prisma: PrismaService, private twitchApi: TwitchApiService) { }

    /**
     * @param userId
     * @returns A list containing the features the user has enabled.
     */
    public async listEnabled(userId: string): Promise<Features[]> {

        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                banner: true,
                tweet: true
            },
            rejectOnNotFound: true
        });

        const enabledFeatures: Features[] = [];

        features.forEach((feature) => {
            if (user[feature]?.enabled) {
                enabledFeatures.push(feature);
            }
        });

        return enabledFeatures;
    }

    /**
     * Create/deletes Twitch EventSub subscriptions based on what features the user has enabled
    * @param userId
    */
    async updateTwitchSubscriptions(userId: string): Promise<void> {

        const accounts = await this.prisma.getAccountsById(userId);
        const twitchAccount: Account = accounts['twitch'];

        // get a list of what EventSub subscription types are needed to have based on what features user has enabled
        const neededSubscriptionTypes = await this.getSubscriptionTypes(userId);

        // get a list of all currently created Twitch EventSub subcriptions
        const userSubscriptions = await this.twitchApi.listSubscriptions(twitchAccount.providerAccountId);

        const subscriptionTypesToCreate: string[] = [];
        const subscriptionIdsToKeep: string[] = [];

        // for each type of subscription we must have for the user
        neededSubscriptionTypes.forEach((type) => {
            // get any pre-existing subscriptions for that type
            const enabledSubscriptionsOfType = userSubscriptions.filter(sub => sub.type === type && sub.status === TwitchSubscriptionStatus.Enabled);

            // if there is a pre-existing subscription and it's enabled, then keep the subscription
            if (enabledSubscriptionsOfType.length > 0) {
                subscriptionIdsToKeep.push(enabledSubscriptionsOfType[0].id);
            } else {
                // If there isn't a pre-existing subscription for this type, then we need to create a subscription for this type
                subscriptionTypesToCreate.push(type);
            }
        });

        // get a list of subscriptions we need to delete by taking all existing subscriptions and excluding the ones we want to keep
        const subsToDelete = userSubscriptions.filter(sub => !subscriptionIdsToKeep.includes(sub.id));

        // console.log({ neededSubscriptionTypes, subscriptionIdsToKeep, subscriptionTypesToCreate, userSubscriptions, subsToDelete });

        await this.twitchApi.deleteManySubscriptions(subsToDelete); // delete the ones we don't need anymore

        // create the new ones we need
        const createRequests = subscriptionTypesToCreate.map((type) => this.twitchApi.createSubscription(userId, type, twitchAccount.providerAccountId));
        await Promise.all(createRequests);
    }

    /**
    * @param userId
    * @returns Array of Twitch EventSub subcription types that are needed for the users enabled features
    */
    private async getSubscriptionTypes(userId: string): Promise<string[]> {
        const subscriptionTypes: Record<string, boolean> = {};
        const enabledFeatures: string[] = await this.listEnabled(userId);
        enabledFeatures.forEach((feature) => {
            featureSubscriptionTypes[feature].forEach((type) => subscriptionTypes[type] = true);
        });

        return Object.keys(subscriptionTypes);
    }
}
