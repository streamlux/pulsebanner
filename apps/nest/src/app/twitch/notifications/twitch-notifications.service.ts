import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto, { BinaryLike } from 'crypto';

@Injectable()
export class TwitchNotificationsService {

    constructor(private configService: ConfigService) { }

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
}
