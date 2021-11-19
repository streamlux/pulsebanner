import { Subscription } from "@app/types/twitch";
import { twitchAxios } from "@app/util/axios";
import { TwitchClientAuthService } from "./TwitchClientAuthService";

export class TwitchSubscriptionService {

    public async getAccessToken(): Promise<string> {
        return (await TwitchClientAuthService.getAuthProvider().getAccessToken()).accessToken;
    }

    /**
     * Create a Twitch EventSub subscription
     *
     * @param userId PulseBanner user userId
     * @param type EventSub subscription type
     * @param twitchUserId Twitch userId`Account.providerId`
     */
    public async createOne(userId: string, type: string, twitchUserId: string) {
        const reqBody = {
            type,
            version: '1',
            condition: {
                broadcaster_user_id: twitchUserId,
            },
            transport: {
                method: 'webhook',
                callback: `https://${process.env.APP_DOMAIN}/api/twitch/notification/${type}/${userId}`,
                secret: process.env.EVENTSUB_SECRET,
            },
        };

        await twitchAxios.post('https://api.twitch.tv/helix/eventsub/subscriptions', reqBody, {
            headers: {
                'Content-Type': 'application/json',
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${await this.getAccessToken()}`,
            },
        });
    }

    /**
     * Delete a subscription
     * @param subscriptionId Subscription to delete
     */
    public async deleteOne(subscriptionId: string): Promise<void> {
        await twitchAxios.delete(`/helix/eventsub/subscriptions?id=${subscriptionId}`, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${await this.getAccessToken()}`,
            },
        });
    }

    public async deleteMany(subscriptions: Subscription[]): Promise<void> {
        const deleteRequests = subscriptions.map(subscription => this.deleteOne(subscription.id));
        await Promise.all(deleteRequests);
    }
}
