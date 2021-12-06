import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { AccessToken, ClientCredentialsAuthProvider } from "twitch-auth";

@Injectable()
export class TwitchAuthService {

    constructor(private config: ConfigService) { }

    private authProvider: ClientCredentialsAuthProvider | undefined;

    private _getAuthProvider(): ClientCredentialsAuthProvider {
        this.authProvider ||= new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
        return this.authProvider;
    }

    public async getAccessToken(): Promise<AccessToken> {
        const token = await this._getAuthProvider().getAccessToken();

        if (token.isExpired) {
            return this._getAuthProvider().refresh();
        };

        return token;
    }

    public async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        const accessToken = (await this.getAccessToken()).accessToken;

        config.headers = {
            ...config.headers,
            'Client-ID': this.config.get('TWITCH_CLIENT_ID'),
            Authorization: `Bearer ${accessToken}`
        }

        config = {
            baseURL: 'https://api.twitch.tv',
            ...config
        }

        return axios.request<T>(config);
    }
}
