import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import { Features, FeaturesService } from '@app/services/FeaturesService';
import { localAxios, twitchAxios } from '@app/util/axios';
import { getTwitterInfo } from '@app/util/database/postgresHelpers';
import { getTwitterUserLink } from '@app/util/twitter/twitterHelpers';
import prisma from '@app/util/ssr/prisma';
import { TwitchClientAuthService } from '@app/services/TwitchClientAuthService';
import { getAccountsById } from '@app/util/getAccountsById';

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

    // print headers
    console.log('Message headers:');
    console.log(
        JSON.stringify(
            {
                messageId,
                messageSignature,
                messageTimestamp,
                messageType,
            },
            null,
            2
        )
    );
    console.log('Message body: \n', JSON.stringify(req.body, null, 2));

    if (!verifySignature(messageSignature, messageId, messageTimestamp, req['rawBody'])) {
        console.log('Request verification failed.');
        res.status(403).send('Forbidden'); // Reject requests with invalid signatures
        res.end();
        return;
    }
    console.log('Signature verified.');

    if (messageType === MessageType.Verification) {
        const challenge: string = (req.body as VerificationBody).challenge;
        res.send(challenge);
        res.end();
        return;
    }

    if (messageType === MessageType.Notification) {
        const streamStatus = req.body.subscription.type;

        const userId = param[1];

        console.log(`Received ${streamStatus} notification for user ${userId}`);

        // get enabled features
        const features = await FeaturesService.listEnabled(userId);
        console.log('features enabled: ', features);

        if (features.length !== 0) {
            // first call twitter and try and get their twitter username. Handle all error codes gracefully and return null if any come
            const twitterInfo = await getTwitterInfo(userId);
            let twitterLink = null;
            if (twitterInfo) {
                twitterLink = await getTwitterUserLink(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
            }
            // get the twitch username/stream link
            const accounts = await getAccountsById(userId);
            const twitchUserId = accounts['twitch'].providerAccountId;

            let streamId = null;
            let streamLink = null;
            try {
                const authedTwitchAxios = await TwitchClientAuthService.authAxios(twitchAxios);
                const streamResponse = await authedTwitchAxios.get(`/helix/streams?id=${twitchUserId}`);

                console.log('streamResponse data: ', streamResponse.data);

                streamId = streamResponse.data?.data?.[0]?.id;
                streamLink = streamResponse.data?.data?.[0].user_login ? `https://www.twitch.tv/${streamResponse.data?.data?.[0].user_login}` : undefined;
            } catch (e) {
                console.log('error: ', e);
            }
            if (streamStatus === 'stream.online') {
                await prisma.liveUsers.upsert({
                    where: {
                        userId: userId,
                    },
                    create: {
                        userId: userId,
                        twitchUserId: twitchUserId,
                        twitchStreamId: streamId,
                        twitterLink: twitterLink,
                        streamLink: streamLink,
                        startTime: new Date(),
                    },
                    update: {},
                });
            }

            if (streamStatus === 'stream.offline') {
                // read the start time from the liveUsers table
                const liveUser = await prisma.liveUsers.findFirst({
                    where: {
                        userId: userId,
                    },
                    select: {
                        startTime: true,
                    },
                });

                const startTime = liveUser !== null ? liveUser.startTime : null;

                // create a new entry for past live streams to reference
                await prisma.pastLiveUsers.create({
                    data: {
                        userId: userId,
                        twitchStreamId: streamId,
                        twitchUserId: twitchUserId,
                        startTime: startTime,
                        endTime: new Date(),
                    },
                });

                // delete the user on stream.offline from the liveUsers table
                await prisma.liveUsers.deleteMany({
                    where: {
                        userId: userId,
                    },
                });
            }
        }

        features.forEach(async (feature: Features) => {
            if (streamStatus === 'stream.online') {
                const liveUser = await prisma.liveUsers.findFirst({
                    where: {
                        userId: userId,
                    },
                });

                // Sometimes twitch sends more than one streamup notification, this causes issues for us
                // to mitigate this, we only process the notification if the stream started within the last 10 minutes
                const minutesSinceStreamStart: number = (Date.now() - new Date(req.body.event.started_at).getTime()) / (60 * 1000);
                if (minutesSinceStreamStart > 10 || liveUser !== null) {
                    console.log('Recieved streamup notification for stream that started more than 10 minutes ago. Will not process notification.');

                    res.status(200);
                    res.end();
                    return;
                }

                const requestUrl = `/api/features/${feature}/streamup/${userId}`;
                console.log(`Making request to ${requestUrl}`);
                await localAxios.post(requestUrl);
            }
            if (streamStatus === 'stream.offline') {
                await localAxios.post(`/api/features/${feature}/streamdown/${userId}`);
            }
        });

        res.status(200);
        res.end();
        return;
    }
}

function verifySignature(messageSignature: string, id: string, timestamp: string, body: unknown): boolean {
    console.log('Verifying signature...');
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
