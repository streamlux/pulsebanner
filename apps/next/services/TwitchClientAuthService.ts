import { ClientCredentialsAuthProvider } from "twitch-auth";

export class TwitchClientAuthService {
    private static authProvider: ClientCredentialsAuthProvider | undefined;

    public static getAuthProvider(): ClientCredentialsAuthProvider {
        this.authProvider ||= new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
        return this.authProvider;
    }
}
