import { getTwitterInfo } from '@app/util/database/postgresHelpers';
import { createS3 } from '@app/util/database/s3ClientHelper';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import { getBanner } from '@app/util/twitter/twitterHelpers';
import axios from 'axios';
import { env } from 'process';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {

    // remove this to actually use this
    res.send(404);

    // this is just me testing out how to upload a jpeg directly to S3
    const userId = req.session.userId;

    try {
        const twitterInfo = await getTwitterInfo(userId, true);
        const twitterBanner = await getBanner(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);
        const { data } = await axios.get(twitterBanner, { responseType: "stream" });

        const s3 = createS3(env.DO_SPACE_ENDPOINT, env.DO_ACCESS_KEY, env.DO_SECRET);
        const upload = await s3.upload({
            Bucket: 'pb-static',
            ACL: 'public-read',
            Key: `${userId}.jpeg`,
            ContentType: 'image/jpeg',
            Body: data,
        }).promise();

        return res.status(200);
    } catch (e) {
        return res.status(500).end('S3 error');
    }
});

export default handler;
