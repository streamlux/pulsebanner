import { AccountsService } from '@app/services/AccountsService';
import { Context } from '@app/services/Context';
import { TwitchClientAuthService } from '@app/services/twitch/TwitchClientAuthService';
import { twitchAxios } from '@app/util/axios';
import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run the cors middleware
    // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
    await NextCors(req, res, {
        // Options
        // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    const context = new Context(req.query.userId as string, {
        action: 'Get Twitch username'
    });
    const { userId } = context;

    const accounts = await AccountsService.getAccountsById(userId);
    if (accounts['twitch'] === undefined) {
        return res.status(401).send('Unauthenticated');
    }

    const twitchUserId = accounts['twitch'].providerAccountId;
    if (twitchUserId === undefined) {
        return res.status(401).send('Unauthenticated');
    }

    const authedTwitchAxios = await TwitchClientAuthService.authAxios(context, twitchAxios);

    const userResponse = await authedTwitchAxios.get(`/helix/users?id=${twitchUserId}`);

    const displayName = userResponse.data?.data[0]?.display_name;

    return displayName === undefined ? res.status(400).send('No name') : res.status(200).send({ displayName });
}
