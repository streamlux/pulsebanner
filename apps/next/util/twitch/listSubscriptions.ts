import { TwitchClientAuthService } from "@app/services/TwitchClientAuthService";
import { GetSubscriptionsResponse, Subscription } from "@app/types/twitch";
import { AxiosResponse } from "axios";
import { twitchAxios } from "../axios";

export async function listSubscriptions(twitchUserId?: string): Promise<Subscription[]> {

    const accessToken = (await TwitchClientAuthService.getAuthProvider().getAccessToken()).accessToken;

    const subscriptions: Subscription[] = [];
    const firstResponse = await getSubscriptionsRequest(accessToken);
    subscriptions.push(...getSubscriptionsFromResponse(firstResponse, twitchUserId));

    let cursor: string | undefined = firstResponse.data.pagination.cursor;

    // if it has a cursor, that means there are more pages of subcriptions
    // see: https://dev.twitch.tv/docs/eventsub/manage-subscriptions#getting-the-list-of-events-you-subscribe-to
    while (cursor !== undefined) {
        const response = await getSubscriptionsRequest(accessToken);
        subscriptions.push(...getSubscriptionsFromResponse(response, twitchUserId));
        cursor = response.data.pagination.cursor;
    }

    return subscriptions;
}

async function getSubscriptionsRequest(accessToken: string): Promise<AxiosResponse<GetSubscriptionsResponse>> {
    return await twitchAxios.get<GetSubscriptionsResponse>('helix/eventsub/subscriptions', {
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

function getSubscriptionsFromResponse(response: AxiosResponse<GetSubscriptionsResponse>, twitchUserId: string): Subscription[] {
    const filterByUserId = (twitchUserId: string) => (subscription: Subscription) => subscription.condition.broadcaster_user_id === twitchUserId;
    return twitchUserId ? response.data.data.filter(filterByUserId(twitchUserId)) : response.data.data;
}

