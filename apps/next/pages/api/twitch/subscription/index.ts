import { getAccounts } from '../../../../util/getAccounts';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import NextCors from 'nextjs-cors';
import { Account } from '@prisma/client';
import { twitchAxios } from '@app/util/axios';
import { TwitchClientAuthService } from '@app/services/TwitchClientAuthService';
import { listSubscriptions } from '@app/util/twitch/listSubscriptions';
import { logger } from '@app/util/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run the cors middleware
    // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
    await NextCors(req, res, {
        // Options
        // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        methods: ['GET', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    const session = await getSession({ req });

    if (session) {
        const accounts = await getAccounts(session);
        const twitchAccount: Account = accounts['twitch'];

        const token = await TwitchClientAuthService.getAccessToken();

        const allSubscriptions = await listSubscriptions();
        if (req.method === 'GET') {
            if (session.user['role'] === 'admin') {
                res.status(200).json({ subscriptions: allSubscriptions });
            } else {
                const userSubscriptions = allSubscriptions.filter((subscription) => subscription.condition.broadcaster_user_id === twitchAccount.providerAccountId);
                res.status(200).json({ subscriptions: userSubscriptions });
            }
            // this is only for deleting webhooks i.e. when user terminates account
        } else if (req.method === 'DELETE') {
            if (!twitchAccount) {
                res.status(200).send('No twitch account. Nothing deleted.');
                return;
            }
            const userSubscriptions = allSubscriptions.filter((subscription) => subscription.condition.broadcaster_user_id === twitchAccount.providerAccountId);
            userSubscriptions.forEach(async (webhook) => {
                await twitchAxios.delete(`/helix/eventsub/subscriptions?id=${webhook.id}`, {
                    headers: {
                        'Client-ID': process.env.TWITCH_CLIENT_ID,
                        Authorization: `Bearer ${token.accessToken}`,
                    },
                });
            });
            res.send(200);
        }
    } else {
        logger.error('this failed. Unable to get session for twitch subscriptions.');
        res.send(401);
    }
}
