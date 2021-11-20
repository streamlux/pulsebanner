import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { Account } from '@prisma/client';
import { getAccountsById } from '@app/util/getAccountsById';
import { TwitchSubscriptionService } from '@app/services/TwitchSubscriptionService';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    // Run the cors middleware
    // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
    await NextCors(req, res, {
        // Options
        // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        // origin: '*',
        origin: '*',
        methods: ['POST', 'DELETE'],
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    // POST request to create webhooks
    if (req.method === 'POST') {
        try {
            const userId: string = req.query.userId as string;
            // Twitch EventSub subscription type see: https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types
            const type: string = req.query.type as string;
            const accounts = await getAccountsById(userId);
            const twitchAccount: Account = accounts['twitch'];
            const twitchUserId = twitchAccount.providerAccountId;

            const twitchSubscriptionService = new TwitchSubscriptionService();
            await twitchSubscriptionService.createOne(userId, type, twitchUserId);

            res.status(201).send(`Success for type: ${type}`);
        } catch (e) {
            res.status(400).send(`Error creating webhook: ${e}`);
        }

    } else if (req.method === 'DELETE') {
        // DELETE request for deleting all webhooks of specified type for specified user
    }
}
