import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { TwitterClient } from 'twitter-api-client';
import axios from 'axios';
import { env } from 'process';

export type BannerResponseCode = 200 | 400;

// pass it the banner so we can just upload the base64 or image url directly
export async function updateBanner(oauth_token: string, oauth_token_secret: string, bannerBase64: string): Promise<BannerResponseCode> {
    const client = new TwitterClient({
        apiKey: process.env.TWITTER_ID,
        apiSecret: process.env.TWITTER_SECRET,
        accessToken: oauth_token,
        accessTokenSecret: oauth_token_secret,
    });

    // We store empty string if user did not have an existing banner
    if (bannerBase64 === 'empty') {
        try {
            await client.accountsAndUsers.accountRemoveProfileBanner();
        } catch (e) {
            console.log('error: ', e);
            return 400;
        }
    } else {
        try {
            await client.accountsAndUsers.accountUpdateProfileBanner({
                banner: bannerBase64,
            });
        } catch (e) {
            if ('errors' in e) {
                // Twitter API error
                if (e.errors[0].code === 88)
                    // rate limit exceeded
                    console.log('Rate limit will reset on', new Date(e._headers.get('x-rate-limit-reset') * 1000));
                // some other kind of error, e.g. read-only API trying to POST
                else console.log('Other error');
            } else {
                // non-API error, e.g. network problem or invalid JSON in response
                console.log('Non api error');
            }
            console.log('failed to update banner');
            return 400;
        }
    }
    console.log('success updating banner');
    return 200;
}

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

    const bannerEntry = await prisma.banner?.findFirst({
        where: {
            userId: userId,
        },
    });

    const tokenInfo = await prisma.account?.findFirst({
        where: {
            userId,
        },
        select: {
            oauth_token: true,
            oauth_token_secret: true,
        },
    });

    if (bannerEntry === null || tokenInfo === null) {
        return res.status(400).send('Could not find banner entry or token info for user');
    }

    // query the original banner image from the db
    const response = await axios.get(`${env.NEXTAUTH_URL}/api/digitalocean/download/${userId}`);
    if (response.status === 200) {
        console.log('Found user in db and got image');
    } else {
        res.status(404).send('Unable to find user in database for streamdown');
    }

    // add check for if it is 'empty' string, then we just set back to default (remove the current banner)

    const bannerStatus: BannerResponseCode = await updateBanner(tokenInfo.oauth_token, tokenInfo.oauth_token_secret, response.data);
    return bannerStatus === 200 ? res.status(200).send('Set banner back to original image') : res.status(400).send('Unable to set banner to original image');
}
