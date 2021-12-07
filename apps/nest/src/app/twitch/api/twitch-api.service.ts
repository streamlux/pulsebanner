import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetSubscriptionsResponse, Subscription } from '@pulsebanner/util/twitch';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { TwitchAuthService } from '../auth/twitch-auth.service';

/**
 * Any calls to the Twitch API go in here.
 */
@Injectable()
export class TwitchApiService {

    constructor(private twitchAuth: TwitchAuthService, private config: ConfigService) { }

    public async getUser(userId: string): Promise<Record<string, any>> {
        const response = await firstValueFrom(this.twitchAuth.http.get(`/helix/users?id=${userId}`));
        return response.data.data[0];
    }

    public async getStream(userId: string): Promise<Record<string, any>> {
        const response = await this.twitchAuth.request<any>({
            method: 'GET',
            url: `/helix/streams?user_id=${userId}`
        });

        return response.data.data[0];
    }

    async listSubscriptions(twitchUserId?: string): Promise<Subscription[]> {

        const subscriptions: Subscription[] = [];
        const firstResponse = await this.getSubscriptionsRequest();
        subscriptions.push(...this.getSubscriptionsFromResponse(firstResponse, twitchUserId));

        let cursor: string | undefined = firstResponse.data.pagination.cursor;

        // if it has a cursor, that means there are more pages of subcriptions
        // see: https://dev.twitch.tv/docs/eventsub/manage-subscriptions#getting-the-list-of-events-you-subscribe-to
        while (cursor !== undefined) {
            const response = await this.getSubscriptionsRequest();
            subscriptions.push(...this.getSubscriptionsFromResponse(response, twitchUserId));
            cursor = response.data.pagination.cursor;
        }

        return subscriptions;
    }

    private async getSubscriptionsRequest(): Promise<AxiosResponse<GetSubscriptionsResponse>> {
        return this.twitchAuth.request({
            method: 'GET',
            url: 'helix/eventsub/subscriptions'
        });
    }

    private getSubscriptionsFromResponse(response: AxiosResponse<GetSubscriptionsResponse>, twitchUserId: string): Subscription[] {
        const filterByUserId = (twitchUserId: string) => (subscription: Subscription) => subscription.condition.broadcaster_user_id === twitchUserId;
        return twitchUserId ? response.data.data.filter(filterByUserId(twitchUserId)) : response.data.data;
    }

    /**
     * Create a Twitch EventSub subscription
     *
     * @param userId PulseBanner user userId
     * @param type EventSub subscription type
     * @param twitchUserId Twitch userId`Account.providerId`
     */
    public async createSubscription(userId: string, type: string, twitchUserId: string) {
        const reqBody = {
            type,
            version: '1',
            condition: {
                broadcaster_user_id: twitchUserId,
            },
            transport: {
                method: 'webhook',
                callback: `https://${this.config.get('APP_DOMAIN') as string}/api/pulse/twitch/notification/${type}/${userId}`,
                secret: this.config.get('EVENTSUB_SECRET')
            },
        };

        await this.twitchAuth.request({
            method: 'POST',
            data: reqBody,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    /**
     * Delete a subscription
     * @param subscriptionId Subscription to delete
     */
    public deleteOneSubscription(subscriptionId: string): Promise<AxiosResponse<any>> {
        return this.twitchAuth.request({
            method: 'DELETE',
            url: `/helix/eventsub/subscriptions?id=${subscriptionId}`
        });
    }

    public async deleteManySubscriptions(subscriptions: Subscription[]): Promise<void> {
        const deleteRequests =
            subscriptions.map((subscription: Subscription): Promise<AxiosResponse<any>> => this.deleteOneSubscription(subscription.id));
        await Promise.all(deleteRequests);
    }
}
