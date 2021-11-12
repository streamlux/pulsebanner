import { AppNextApiRequest } from '../../../../middlewares/auth';
import { NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import axios from 'axios';
import { TwitterClient } from 'twitter-api-client';
import { env } from 'process';
import { BannerResponseCode, updateBanner } from '../streamdown/[userId]';

export async function getBanner(oauth_token: string, oauth_token_secret: string, providerAccountId: string): Promise<string> {
    const client = new TwitterClient({
        apiKey: process.env.TWITTER_ID,
        apiSecret: process.env.TWITTER_SECRET,
        accessToken: oauth_token,
        accessTokenSecret: oauth_token_secret,
    });
    let imageUrl: string = undefined;
    try {
        const response = await client.accountsAndUsers.usersProfileBanner({
            user_id: providerAccountId,
        });
        imageUrl = response.sizes['1500x500'].url;
        console.log('imageUrl: ', imageUrl);
    } catch (e) {
        console.log('User does not have a banner setup. Will save empty for later: ', e);
        imageUrl = 'empty';
    }

    return imageUrl;
}

export default async function handler(req: AppNextApiRequest, res: NextApiResponse) {
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

    // these db calls exact same as streamdown, should be extracted later
    const bannerEntry = await prisma.banner?.findFirst({
        where: {
            userId: userId,
        },
    });

    const twitterInfo = await prisma.account?.findFirst({
        where: {
            userId,
        },
        select: {
            oauth_token: true,
            oauth_token_secret: true,
            providerAccountId: true,
        },
    });

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
