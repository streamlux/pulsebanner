import { AxiosInstance } from "axios";
import { AccessToken, ClientCredentialsAuthProvider } from "twitch-auth";

export class TwitchClientAuthService {
    private static authProvider: ClientCredentialsAuthProvider | undefined;

    public static _getAuthProvider(): ClientCredentialsAuthProvider {
        this.authProvider ||= new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
        return this.authProvider;
    }

    public static async getAccessToken(): Promise<AccessToken> {
        const token = await this._getAuthProvider().getAccessToken();

        if (token.isExpired) {
            return this._getAuthProvider().refresh();
        };

        return token;
    }

    public static async authAxios(axios: AxiosInstance): Promise<AxiosInstance> {
        const accessToken = (await this.getAccessToken()).accessToken;

        axios.defaults.headers = {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            Authorization: `Bearer ${accessToken}`,
        }

        return axios;
    }
}
