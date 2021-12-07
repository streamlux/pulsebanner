import { AxiosInstance } from "axios";
import { AccessToken, ClientCredentialsAuthProvider, accessTokenIsExpired } from "@twurple/auth";

export class TwitchClientAuthService {
    private static authProvider: ClientCredentialsAuthProvider | undefined;

    private static _getAuthProvider(): ClientCredentialsAuthProvider {
        this.authProvider ||= new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
        return this.authProvider;
    }

    public static async getAccessToken(): Promise<AccessToken> {
        const token: AccessToken = await this._getAuthProvider().getAccessToken();

        if (accessTokenIsExpired(token)) {
            return this._getAuthProvider().refresh();
        };

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
