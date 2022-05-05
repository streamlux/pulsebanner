import { GetSubscriptionsResponse, Subscription } from '@app/types/twitch';
import { twitchAxios } from '@app/util/axios';
import { TwitchClientAuthService } from './TwitchClientAuthService';
import { execa } from 'execa';
import { AxiosResponse } from 'axios';

export class TwitchSubscriptionService {
    public async getAccessToken(): Promise<string> {
        return (await TwitchClientAuthService.getAccessToken()).accessToken;
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

        if (process.env.NODE_ENV === 'development' && process.env.ENABLE_WEBHOOK_LOCAL_TESTING === 'true') {
            try {
                console.log('Sending Webhook challenge request via twitch-cli...\n');
                const args = `event verify-subscription streamup -F ${process.env.NEXTAUTH_URL}/api/twitch/notification/${userId} -s ${process.env.EVENTSUB_SECRET}`;
                const { stdout } = await execa('twitch', args.split(' '));
                if (stdout.includes('Invalid')) {
                    console.error('Error handling challenge request made my twitch-cli');
                    console.error(stdout);
                    console.log();
                }
                console.log(stdout);
            } catch (e) {
                console.error('Error running twitch-cli', e);
            }
        }
    }

    /**
     * Delete a subscription
     * @param subscriptionId Subscription to delete
     */
    public async deleteOne(subscriptionId: string): Promise<void> {
        await twitchAxios.delete(`helix/eventsub/subscriptions?id=${subscriptionId}`, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${await this.getAccessToken()}`,
            },
        });
    }

    public async deleteMany(subscriptions: Subscription[]): Promise<void> {
        const deleteRequests: Promise<void>[] = subscriptions.map((subscription) => this.deleteOne(subscription.id));
        await Promise.all(deleteRequests);
    }

    public async getSubscriptions(twitchUserId?: string): Promise<Subscription[]> {
        const accessToken: string = await this.getAccessToken();

        const subscriptions: Subscription[] = [];
        const firstResponse: AxiosResponse<GetSubscriptionsResponse> = await this.getSubscriptionsRequest(accessToken);
        subscriptions.push(...this.getSubscriptionsFromResponse(firstResponse, twitchUserId));

        let cursor: string | undefined = firstResponse.data.pagination.cursor;

        // if it has a cursor, that means there are more pages of subcriptions
        // see: https://dev.twitch.tv/docs/eventsub/manage-subscriptions#getting-the-list-of-events-you-subscribe-to
        while (cursor !== undefined) {
            const response: AxiosResponse<GetSubscriptionsResponse> = await this.getSubscriptionsRequest(accessToken, cursor);
            subscriptions.push(...this.getSubscriptionsFromResponse(response, twitchUserId));
            cursor = response.data.pagination.cursor;
        }

        return subscriptions;
    }

    private async getSubscriptionsRequest(accessToken: string, cursor?: string): Promise<AxiosResponse<GetSubscriptionsResponse>> {
        const url: string = cursor ? `helix/eventsub/subscriptions?after=${cursor}` : 'helix/eventsub/subscriptions';
        return await twitchAxios.get<GetSubscriptionsResponse>(url, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }


    private getSubscriptionsFromResponse(response: AxiosResponse<GetSubscriptionsResponse>, twitchUserId?: string): Subscription[] {
        const filterByUserId = (twitchUserId: string) => (subscription: Subscription) => subscription.condition.broadcaster_user_id === twitchUserId;
        return twitchUserId ? response.data.data.filter(filterByUserId(twitchUserId)) : response.data.data;
    }
}
