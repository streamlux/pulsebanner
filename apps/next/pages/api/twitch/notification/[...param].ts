import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import { FeaturesService } from '@app/services/FeaturesService';
import prisma from '@app/util/ssr/prisma';
import { getLiveUserInfo, LiveUserInfo, liveUserOffline, liveUserOnline } from '@app/util/twitch/liveStreamHelpers';
import { logger } from '@app/util/logger';
import { executeStreamDown, executeStreamUp } from '@app/features/executeFeatures';
import { TwitchClientAuthService } from '@app/services/TwitchClientAuthService';
import { twitchAxios } from '@app/util/axios';
import { AxiosResponse } from 'axios';
import { GetStreamsData, TwitchGetResponse } from '@app/types/twitch';

type VerificationBody = {
    challenge: string;
    subscription: unknown;
};

enum MessageType {
    Notification = 'notification',
    Verification = 'webhook_callback_verification',
}

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run the cors middleware
    // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
    await NextCors(req, res, {
        // Options
        // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        methods: ['POST'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    await runMiddleware(
        req,
        res,
        bodyParser.json({
            verify: (req, res, buf) => {
                // Small modification to the JSON bodyParser to expose the raw body in the request object
                // The raw body is required at signature verification
                req['rawBody'] = buf;
            },
        })
    );

    const param = req.query.param as string[];

    const messageSignature = req.headers['Twitch-Eventsub-Message-Signature'.toLowerCase()] as string;
    const messageId = req.headers['Twitch-Eventsub-Message-Id'.toLowerCase()] as string;
    const messageTimestamp = req.headers['Twitch-Eventsub-Message-Timestamp'.toLowerCase()] as string;
    const messageType: MessageType = req.headers['Twitch-Eventsub-Message-Type'.toLowerCase()] as MessageType;

    const userId: string = param[1];

    logger.info(`Recieved webhook ${messageType === MessageType.Notification ? 'notification' : 'verification request'} from Twitch`, {
        messageId,
        messageSignature,
        messageTimestamp,
        messageType,
        body: req.body,
        userId,
    });

    if (!verifySignature(messageSignature, messageId, messageTimestamp, req['rawBody'])) {
        logger.error('Request verification failed.', { userId });
        res.status(403).send('Forbidden'); // Reject requests with invalid signatures
        res.end();
        return;
    }
    logger.verbose('Signature verified.', { userId });

    if (messageType === MessageType.Verification) {
        const challenge: string = (req.body as VerificationBody).challenge;
        res.send(challenge);
        res.end();
        return;
    }

    if (messageType === MessageType.Notification) {
        const streamStatus = req.body.subscription.type;

        const userId = param[1];

        // get enabled features
        const features = await FeaturesService.listEnabled(userId);

        logger.info(`Received ${streamStatus} notification for user ${userId}`, { status: streamStatus, userId, enabledFeatures: features });

        if (features.length !== 0) {
            const userInfo: LiveUserInfo = await getLiveUserInfo(userId);

            const liveUser = await prisma.liveStreams.findUnique({
                where: {
                    userId: userId,
                },
            });

            if (liveUser && userInfo && streamStatus === 'stream.online') {
                // we need to verify that the liveUser in the table is from the same stream, otherwise they should be removed
                const currentStreamId = userInfo.streamId;
                const storedStreamId = liveUser.twitchStreamId;
                // remove from liveUser table if the stored live user does not have the same streamId
                if (currentStreamId !== storedStreamId) {
                    logger.error('User stored in liveUser table is invalid. Erasing from table because it is a new stream. ', {
                        userId,
                        streamLink: userInfo.streamLink,
                        twitterLink: userInfo.twitterLink,
                    });
                    await prisma.liveStreams.deleteMany({
                        where: {
                            userId: userId,
                        },
                    });
                }
            }

            if (streamStatus === 'stream.online') {

                // Sometimes twitch sends more than one streamup notification, this causes issues for us
                // to mitigate this, we only process the notification if the stream started within the last 10 minutes
                const minutesSinceStreamStart: number = (Date.now() - new Date(req.body.event.started_at).getTime()) / (60 * 1000);
                if (minutesSinceStreamStart > 10) {
                    logger.warn('Recieved streamup notification for stream that started more than 10 minutes ago. Will not process notification.', {
                        minutesSinceStreamStart,
                        userId,
                    });

                    return res.status(200).end();
                }

                // Check if we have an entry for this livestream in the table. Return and end request if true.
                if (liveUser) {
                    logger.warn('Recieved streamup notification for stream that is already stored in DB. Will not process notification.', {
                        userId,
                        liveUserTableId: liveUser.id,
                        minutesSinceStreamStart
                    });

                    return res.status(200).end();
                }
            }

            if (userInfo !== undefined) {
                if (streamStatus === 'stream.online') {
                    await liveUserOnline(userId, userInfo);
                    await executeStreamUp(userId);
                }
                if (streamStatus === 'stream.offline') {

                    try {

                        const authedTwitchAxios = await TwitchClientAuthService.authAxios(twitchAxios);
                        // get twitch stream info for user
                        // https://dev.twitch.tv/docs/api/reference#get-streams
                        const streamResponse: AxiosResponse<TwitchGetResponse<GetStreamsData>> = await authedTwitchAxios.get(`/helix/streams?user_id=${userInfo.twitchUserId}`);

                        const stream: GetStreamsData | undefined = streamResponse.data.data[0];
                        if (stream) {
                            logger.error('Twitch API does not stream.offline notification, live stream was found.', { userId });
                        } else {
                            logger.info('Twitch API matches stream.offline notification, no stream was found.', { userId });
                        }
                    } catch (e) {
                        logger.error('Error getting Twitch stream from API on a stream.offline notification', { error: e, userId });
                    }

                    await liveUserOffline(userId, userInfo);
                    await executeStreamDown(userId);
                }
            }
        }

        return res.status(200).end();
    }
}

function verifySignature(messageSignature: string, id: string, timestamp: string, body: unknown): boolean {
    logger.info('Verifying signature...');
    const message = id + timestamp + body;
    const signature = crypto.createHmac('sha256', process.env.EVENTSUB_SECRET).update(message);
    const expectedSignatureHeader = 'sha256=' + signature.digest('hex');
    return expectedSignatureHeader === messageSignature;
}

function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }

            return resolve(result);
        });
    });
}
