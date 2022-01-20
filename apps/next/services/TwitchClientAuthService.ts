import axios, { AxiosInstance } from "axios";
import { AccessToken, ClientCredentialsAuthProvider, accessTokenIsExpired } from "@twurple/auth";
import { logger } from "@app/util/logger";

export class TwitchClientAuthService {
    private static authProvider: ClientCredentialsAuthProvider | undefined;

    private static _getAuthProvider(): ClientCredentialsAuthProvider {
        this.authProvider ||= new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
        return this.authProvider;
    }

    /**
     * Validates an access token as described here:
     * https://dev.twitch.tv/docs/authentication#validating-requests
     * @param accessToken
     * @returns True if valid, false if invalid
     */
    private static async isTokenValid(accessToken: AccessToken): Promise<boolean> {
        try {
            const response = await axios.get('https://id.twitch.tv/oauth2/validate', {
                headers: {
                    Authorization: `Bearer ${accessToken.accessToken}`
                }
            });
            if (response.status === 200) {
                return true;
            }
        } catch (e) {
            return false;
        }
    }

    public static async getAccessToken(): Promise<AccessToken> {
        const token: AccessToken = await this._getAuthProvider().getAccessToken();

        if (accessTokenIsExpired(token)) {
            logger.info('TwitchClientAuthService: Twitch client app access token is expired. Refreshing...');
            return await this._getAuthProvider().refresh();
        };

        if (!(await this.isTokenValid(token))) {
            logger.info('TwitchClientAuthService: token is invalid. Getting new token...');
            return await this._getAuthProvider().refresh();
        }

        return token;
    }

    public static async authAxios(axios: AxiosInstance): Promise<AxiosInstance> {
        const accessToken = (await this.getAccessToken()).accessToken;

        axios.defaults.headers.common = {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            Authorization: `Bearer ${accessToken}`,
        }

        return axios;
    }
}
