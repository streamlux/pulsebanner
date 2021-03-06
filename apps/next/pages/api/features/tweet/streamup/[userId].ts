import { AccountsService } from '@app/services/AccountsService';
import { getTweetInfo } from '@app/services/postgresHelpers';
import { tweetStreamStatusLive, TwitterResponseCode } from '@app/services/twitter/twitterHelpers';
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

    // use this when they upload their stream link, string they want to use, etc.
    const tweetInfo = await getTweetInfo(userId);

    const twitterInfo = await AccountsService.getTwitterInfo(userId);

    // add tweetEntry check once frontend enable is added for testing
    if (tweetInfo === null || twitterInfo === null) {
        return res.status(400).send('Could not find tweet entry or twitter info for user');
    }

    // get the twitch info from tweetInfo here, then feed into tweetStreamStatusLive

    const tweetStatus: TwitterResponseCode = await tweetStreamStatusLive(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    return tweetStatus === 200 ? res.status(200).send('Tweet successfully published') : res.status(400).send('Unable to publish tweet');
}
