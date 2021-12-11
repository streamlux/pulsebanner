import { getTweetInfo, getTwitterInfo } from '@app/util/database/postgresHelpers';
import { tweetStreamStatusLive, TwitterResponseCode } from '@app/util/twitter/twitterHelpers';
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

    const twitterInfo = await getTwitterInfo(userId);

    // add tweetEntry check once frontend enable is added for testing
    if (tweetInfo === null || twitterInfo === null) {
        return res.status(400).send('Could not find tweet entry or twitter info for user');
    }

    let tweetContent = '';
    if (tweetInfo.streamUrl) {
        tweetContent = `${tweetInfo.tweetInfo}\n${tweetInfo.streamUrl}`;
    } else {
        tweetContent = `${tweetInfo.tweetInfo}`;
    }

    // get the twitch info from tweetInfo here, then feed into tweetStreamStatusLive

    const tweetStatus: TwitterResponseCode = await tweetStreamStatusLive(twitterInfo.oauth_token, twitterInfo.oauth_token_secret, tweetContent);
    // we hit this when their last tweet was also from us. We do not tweet then
    if (tweetStatus === 403) {
        return res.status(201).send('Tweet already published recently. No changes');
    }

    return tweetStatus === 200 ? res.status(200).send('Tweet successfully published') : res.status(400).send('Unable to publish tweet');
}
