import axios, { AxiosInstance } from "axios";
import { AccessToken, ClientCredentialsAuthProvider, accessTokenIsExpired } from "@twurple/auth";

export class TwitchClientAuthService {
    private static authProvider: ClientCredentialsAuthProvider | undefined;

    private static _getAuthProvider(): ClientCredentialsAuthProvider {
        this.authProvider ||= new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
        return this.authProvider;
    }

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
            console.log('TwitchClientAuthService: Twitch client app access token is expired. Refreshing...');
            return await this._getAuthProvider().refresh();
        };

        if (!(await this.isTokenValid(token))) {
            console.log('TwitchClientAuthService: token is invalid. Getting new token...');
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
