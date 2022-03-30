import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import { getBanner } from '@app/services/twitter/twitterHelpers';
import axios from 'axios';
import { S3Service } from '@app/services/S3Service';
import { AccountsService } from '@app/services/AccountsService';
import { Context } from '@app/services/Context';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {

    // remove this to actually use this
    res.send(404);

    // this is just me testing out how to upload a jpeg directly to S3
    const userId = req.session.userId;
    const context = new Context(userId);

    try {
        const twitterInfo = await AccountsService.getTwitterInfo(userId, true);
        if (!twitterInfo) {
            return res.send(400);
        }
        const twitterBanner = await getBanner(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);
        const { data } = await axios.get(twitterBanner, { responseType: "stream" });

        const s3 = S3Service.createS3()
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
