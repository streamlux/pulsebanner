import { Subscription } from '@app/types/twitch';
import { twitchAxios } from '@app/util/axios';
import { TwitchClientAuthService } from './TwitchClientAuthService';
import { execa } from 'execa';

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
        await twitchAxios.delete(`/helix/eventsub/subscriptions?id=${subscriptionId}`, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${await this.getAccessToken()}`,
            },
        });
    }

    public async deleteMany(subscriptions: Subscription[]): Promise<void> {
        const deleteRequests = subscriptions.map((subscription) => this.deleteOne(subscription.id));
        await Promise.all(deleteRequests);
    }
}
