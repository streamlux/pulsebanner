import { BadRequestException, Controller, Logger, Param, Post, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { TwitchService } from './twitch.service';
import { Request } from 'express';
import type { Subscription } from '@pulsebanner/util/twitch';
import { firstValueFrom } from 'rxjs';
import { Features, FeaturesService } from '../features/features.service';

interface VerificationBody {
    challenge: string;
    subscription: unknown;
};

interface NotificationBody {
    subscription: Subscription;
    event: any;
}

@Controller('twitch')
export class TwitchController {
    constructor(private twitchService: TwitchService, private featuresService: FeaturesService, private httpService: HttpService) { }

    @Post('notification/:type/:userId')
    async notification(@Req() req: Request, @Param('userId') userId: string) {

        // https://dev.twitch.tv/docs/eventsub/handling-webhook-events

        enum MessageType {
            Notification = 'notification',
            Verification = 'webhook_callback_verification',
        }

        const messageSignature = req.headers['Twitch-Eventsub-Message-Signature'.toLowerCase()] as string;
        const messageId = req.headers['Twitch-Eventsub-Message-Id'.toLowerCase()] as string;
        const messageTimestamp = req.headers['Twitch-Eventsub-Message-Timestamp'.toLowerCase()] as string;
        const messageType: MessageType = req.headers['Twitch-Eventsub-Message-Type'.toLowerCase()] as MessageType;

        // print headers
        Logger.verbose('Message headers:');
        Logger.verbose(JSON.stringify({
            messageId,
            messageSignature,
            messageTimestamp,
            messageType
        }, null, 2));
        // print body
        Logger.verbose('Message body: \n', JSON.stringify(req.body, null, 2));


        // Step 1: Verify signature

        if (!this.twitchService.verifySignature(messageSignature, messageId, messageTimestamp, req.body)) {
            throw new BadRequestException('Failed to validate request signature.');
        }

        // If message is a verification message, response with challenge

        if (messageType === MessageType.Verification) {
            return (req.body as VerificationBody).challenge;
        }
        if (messageType === MessageType.Notification) {
            const { subscription } = (req.body as NotificationBody);

            // get enabled features
            const features = await this.featuresService.listEnabled(userId);
            features.forEach(async (feature: Features) => {

                if (subscription.type === 'stream.online') {
                    // Sometimes twitch sends more than one streamup notification, this causes issues for us
                    // to mitigate this, we only process the notification if the stream started within the last 10 minutes
                    const minutesSinceStreamStart: number = ((Date.now() - new Date(req.body.event.started_at).getTime()) / (60 * 1000));
                    if (minutesSinceStreamStart > 10) {
                        Logger.log('Recieved streamup notification for stream that started more than 10 minutes ago. Will not process notification.');
                        return;
                    }

                    const requestUrl = `/api/features/${feature}/streamup/${userId}`;
                    Logger.verbose(`Making request to ${requestUrl}`);
                    // https://stackoverflow.com/a/34190965
                    await firstValueFrom(this.httpService.post(requestUrl));
                }

                if (subscription.type === 'stream.offline') {
                    const requestUrl = `/api/features/${feature}/streamdown/${userId}`;
                    Logger.verbose(`Making request to ${requestUrl}`);
                    await firstValueFrom(this.httpService.post(requestUrl));
                }
            });
            return;
        }

        throw new BadRequestException('Unrecognized message type: ' + messageType);
    }
}
