import { getProfilePicEntry, getTwitterInfo } from '@app/util/database/postgresHelpers';
import { download } from '@app/util/s3/download';
import { TwitterResponseCode, updateProfilePic } from '@app/util/twitter/twitterHelpers';
import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { env } from 'process';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run the cors middleware
    // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
    await NextCors(req, res, {
        // Options
        // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        methods: ['GET', 'POST'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    const userId: string = req.query.userId as string;

    const bucketName: string = env.PROFILE_PIC_BUCKET_NAME;

    if (userId) {
        const profilePicInfo = await getProfilePicEntry(userId);

        const twitterInfo = await getTwitterInfo(userId);

        if (profilePicInfo === null || twitterInfo === null) {
            return res.status(400).send('Could not find profile pic entry or twitter info for user');
        }

        let base64Image: string | undefined = undefined;
        try {
            // get the original image from the
            base64Image = await download(bucketName, userId);
        } catch (e) {
            // we should only hit this when the user has enabled the feature while streaming and then go offline
        }

        if (base64Image === undefined) {
            console.log('Unable to find user in database for profile picture on streamdown. This can be caused by the user enabling the feature while currently live.');
            return res.status(404).send('Unable to find user in database for profile pic on streamdown. This can be caused by the user enabling the feature while currently live.');
        }

        const profilePicStatus: TwitterResponseCode = await updateProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, base64Image);
        return profilePicStatus === 200 ? res.status(200).send('Set profile pic back to original image') : res.status(400).send('Unable to set profile pic to original image');
    }
}
