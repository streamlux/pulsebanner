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

    if (userId) {
        const accounts = await getAccountsById(userId);
        let isStreaming = false;
        if (accounts['twitch']) {
            const twitchUserId = accounts['twitch'].providerAccountId;
            const authedTwitchAxios = await TwitchClientAuthService.authAxios(twitchAxios);
            const getIsStreaming = await authedTwitchAxios.get(`/helix/streams?user_id=${twitchUserId}`);
            isStreaming = getIsStreaming.data.data.length !== 0;

            return res.status(200).send({ isStreaming: isStreaming });
        }
    }

    return res.status(200).send({ isStreaming: false });
}
