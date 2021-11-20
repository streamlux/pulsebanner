import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { TwitterResponseCode, updateBanner, getBanner } from '@app/util/twitter/twitterHelpers';
import { getBannerEntry, getTwitterInfo } from '@app/util/database/postgresHelpers';
import { localAxios, remotionAxios } from '@app/util/axios';
import { Prisma } from '@prisma/client';

type TemplateRequestBody = {
    foregroundId: string;
    backgroundId: string;
    foregroundProps: Record<string, unknown>;
    backgroundProps: Record<string, unknown>;
};

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
        return res.status(400).send('Could not find banner entry or twitter info for user');
    }

    // call twitter api to get imageUrl and convert to base64
    const bannerUrl = await getBanner(twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);

    // store the current banner in s3
    await localAxios.put(`/api/storage/upload/${userId}?imageUrl=${bannerUrl}`);

    // get the banner info saved in Banner table

    // construct template object
    const templateObj: TemplateRequestBody = {
        backgroundId: bannerEntry.backgroundId ?? 'CSSBackground',
        foregroundId: bannerEntry.foregroundId ?? 'ImLive',
        foregroundProps: bannerEntry.foregroundProps as Prisma.JsonObject ?? {},
        backgroundProps: bannerEntry.backgroundProps as Prisma.JsonObject ?? {},
    };

    // pass in the bannerEntry info
    const response = await remotionAxios.post('/getTemplate', templateObj, {

    });
    const base64Image = response.data;

    // post this base64 image to twitter
    const bannerStatus: TwitterResponseCode = await updateBanner(twitterInfo.oauth_token, twitterInfo.oauth_token_secret, base64Image);
    return bannerStatus === 200 ? res.status(200).send('Set banner to given template') : res.status(400).send('Unable to set banner');
}
