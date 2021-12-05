import { TwitchClientAuthService } from '@app/services/TwitchClientAuthService';
import { twitchAxios } from '@app/util/axios';
import { getAccountsById } from '@app/util/getAccountsById';
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

    const userId: string = req.query.userId as string;

    const accounts = await getAccountsById(userId);
    if (accounts['twitch'] === undefined) {
        return res.status(401).send('Unauthenticated');
    }

    const twitchUserId = accounts['twitch'].providerAccountId;
    if (twitchUserId === undefined) {
        return res.status(401).send('Unauthenticated');
    }

    const authedTwitchAxios = await TwitchClientAuthService.authAxios(twitchAxios);

    const userResponse = await authedTwitchAxios.get(`/helix/users?id=${twitchUserId}`);

    const displayName = userResponse.data?.data[0]?.display_name;

    return displayName === undefined ? res.status(400).send('No name') : res.status(200).send({ displayName });
}
