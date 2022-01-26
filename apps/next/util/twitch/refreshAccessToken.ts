import { Account } from "@prisma/client";
import { getSecondsSinceEpoch } from "../common";
import { logger } from "../logger";

export async function refreshAccessToken(refreshToken: string): Promise<Pick<Account, 'access_token' | 'expires_at' | 'scope' | 'token_type' | 'refresh_token'>> {
    try {
        const url =
            'https://id.twitch.tv/oauth2/token?' +
            new URLSearchParams({
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            });

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            token_type: refreshedTokens.token_type,
            access_token: refreshedTokens.access_token,
            scope: refreshedTokens.scope.join(' '),
            expires_at: getSecondsSinceEpoch() + refreshedTokens.expires_in,
            refresh_token: refreshedTokens.refresh_token ?? refreshToken, // Fall back to old refresh token
        };
    } catch (error) {
        logger.error('Error refreshing twitch access token', error);
    }
}
