import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { TwitterResponseCode, updateBanner } from '@app/util/twitter/twitterHelpers';
import { getBannerEntry, getTwitterInfo } from '@app/util/database/postgresHelpers';
import { localAxios } from '@app/util/axios';
import { log } from '@app/util/discord/log';

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

    const bannerEntry = await getBannerEntry(userId);

    const twitterInfo = await getTwitterInfo(userId);

    if (bannerEntry === null || twitterInfo === null) {
        return res.status(400).send('Could not find banner entry or token info for user');
    }

    // query the original banner image from the db
    const response = await localAxios.get(`/api/storage/download/${userId}`);
    if (response.status === 200) {
        log('Found user in db and got image');
    } else {
        res.status(404).send('Unable to find user in database for streamdown');
    }

    // add check for if it is 'empty' string, then we just set back to default (remove the current banner)

    const bannerStatus: TwitterResponseCode = await updateBanner(twitterInfo.oauth_token, twitterInfo.oauth_token_secret, response.data);
    return bannerStatus === 200 ? res.status(200).send('Set banner back to original image') : res.status(400).send('Unable to set banner to original image');
}
