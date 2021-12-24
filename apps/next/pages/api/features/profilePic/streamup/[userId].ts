import { localAxios, remotionAxios } from '@app/util/axios';
import { getProfilePicEntry, getTwitterInfo } from '@app/util/database/postgresHelpers';
import { getTwitterProfilePic, TwitterResponseCode, updateProfilePic } from '@app/util/twitter/twitterHelpers';
import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { AxiosResponse } from 'axios';
import { env } from 'process';

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
        const profilePicEntry = await getProfilePicEntry(userId);
        const twitterInfo = await getTwitterInfo(userId, true);

        if (profilePicEntry === null || twitterInfo === null) {
            res.status(400).send('Unable to get profilePicEntry or twitterInfo for user on streamup');
        }

        // get the existing profile pic
        const profilePicUrl: string = await getTwitterProfilePic(twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);

        // store the existing one in s3
        const bucketName: string = env.PROFILE_PIC_BUCKET_NAME;

        await localAxios.put(`/api/storage/upload/${userId}?imageUrl=${profilePicUrl}&bucket=${bucketName}`);

        // update remotion here to craft the image and pass back right props. may/should be new endpoint
        const response: AxiosResponse<string> = await remotionAxios.post('/getTemplate', { test: 'tester' });
        // think this needs to be a url
        const image: string = response.data;

        // don't think we can update with base64, needs to be actual image
        const profilePicStatus: TwitterResponseCode = await updateProfilePic(twitterInfo.oauth_token, twitterInfo.oauth_token_secret, image);
        return profilePicStatus === 200 ? res.status(200).send('Set profile pic to given template') : res.status(400).send('Unable to set profile pic');
    }
}
