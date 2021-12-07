import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { AccessToken, accessTokenIsExpired, ClientCredentialsAuthProvider } from "@twurple/auth";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

/**
 * Get Twitch API app access tokens (client credentials flow).
 *
 * Handles refreshing automatically.
 */
@Injectable()
export class TwitchAuthService {

    public readonly http: HttpService;
    private authProvider: ClientCredentialsAuthProvider | undefined;

    constructor(private config: ConfigService) {
        const axiosInstance: AxiosInstance = axios.create({
            baseURL: 'https://api.twitch.tv'
        });

        axiosInstance.interceptors.request.use(async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
            const accessToken: string = (await this.getAccessToken()).accessToken;
            config.headers = {
                ...config.headers,
                'Client-ID': this.config.get('TWITCH_CLIENT_ID'),
                Authorization: `Bearer ${accessToken as string}`
            }
            return config;
        });

        this.http = new HttpService(axiosInstance);
    }

    private _getAuthProvider(): ClientCredentialsAuthProvider {
        this.authProvider ||= new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
        return this.authProvider;
    }

    public async getAccessToken(): Promise<AccessToken> {
        const token = await this._getAuthProvider().getAccessToken();

        // if token is expired
        if (accessTokenIsExpired(token)) {
            // get a new app access token
            return this._getAuthProvider().refresh();
        };

        return token;
    }

    public async request<T>(config: AxiosRequestConfig<T>): Promise<AxiosResponse<T>> {
        return firstValueFrom(this.http.request(config));
    }
}
