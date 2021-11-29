import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import { Features, FeaturesService } from '@app/services/FeaturesService';
import { localAxios } from '@app/util/axios';

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

    if (!verifySignature(messageSignature, messageId, messageTimestamp, req['rawBody'])) {
        console.log('Request verification failed.');
        res.status(403).send('Forbidden'); // Reject requests with invalid signatures
        res.end();
        return;
    }

    const messageType: MessageType = req.headers['Twitch-Eventsub-Message-Type'.toLowerCase()] as MessageType;

    if (messageType === MessageType.Verification) {
        const challenge: string = (req.body as VerificationBody).challenge;
        res.send(challenge);
        res.end();
        return;
    }

    if (messageType === MessageType.Notification) {
        console.log(req.body.event);
        const streamStatus = req.body.subscription.type;

        const userId = param[0];

        // get enabled features
        const features = await FeaturesService.listEnabled(userId);
        features.forEach(async (feature: Features) => {
            if (streamStatus === 'stream.online') {
                await localAxios.post(`/api/features/${feature}/streamup/${userId}`);
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
    console.log('Verifying signature', messageSignature, id, timestamp);
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
