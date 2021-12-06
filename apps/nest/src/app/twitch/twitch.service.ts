import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto, { BinaryLike } from 'crypto';
import { TwitchAuthService } from './twitch-auth.service';

@Injectable()
export class TwitchService {

    constructor(private twitchAuth: TwitchAuthService, private configService: ConfigService) { }

    public verifySignature(messageSignature: string, id: string, timestamp: string, body: unknown): boolean {
        console.log('Verifying signature...');
        const message = id + timestamp + body;
        const signature = crypto.createHmac('sha256', this.configService.get<string>('EVENTSUB_SECRET') as BinaryLike).update(message);
        const expectedSignatureHeader = 'sha256=' + signature.digest('hex');
        const verified = expectedSignatureHeader === messageSignature;
        if (verified) {
            console.log('Signature verified.');
        } else {
            console.warn('Failed to verify signature.');
        }
        return verified;
    }

    public async getUser(userId: string): Promise<Record<string, any>> {
        const response = await this.twitchAuth.request<any>({
            method: 'GET',
            url: `/helix/users?id=${userId}`
        });

        return response.data.data[0];
    }

    public async getStream(userId: string): Promise<Record<string, any>> {
        const response = await this.twitchAuth.request<any>({
            method: 'GET',
            url: `/helix/streams?user_id=${userId}`
        });

        return response.data.data[0];
    }
}
