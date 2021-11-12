import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import axios from 'axios';
import { env } from 'process';
import { BannerResponseCode, updateBanner, getBanner } from '../../../../util/twitter/bannerHelpers';
import { getBannerEntry, getTwitterInfo } from '@app/util/database/postgresHelpers';

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

    const twitterInfo = await getTwitterInfo(userId, true);

    if (bannerEntry === null || twitterInfo === null) {
        return res.status(400).send('Could not find banner entry or token info for user');
    }

    // call twitter api to get imageUrl and convert to base64
    const bannerUrl = await getBanner(twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);
    console.log('bannerUrl: ', bannerUrl);

    // store the current banner in s3
    await axios.put(`${env.NEXTAUTH_URL}/api/digitalocean/upload/${userId}?imageUrl=${bannerUrl}`);

    // call server with templateId to get the template
    const response = await axios.post(`${env.REMOTION_URL}/getTemplate`, { tester: 123, thumbnailUrl: 'sample.com', twitchInfo: 'tester' });
    const base64Image = response.data;

    // post this base64 image to twitter
    const bannerStatus: BannerResponseCode = await updateBanner(twitterInfo.oauth_token, twitterInfo.oauth_token_secret, base64Image);
    return bannerStatus === 200 ? res.status(200).send('Set banner to given template') : res.status(400).send('Unable to set banner to original image');
}
