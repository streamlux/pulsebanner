import { AppNextApiRequest } from '@app/middlewares/admin';
import { localAxios } from '@app/util/axios';
import { createS3 } from '@app/util/database/s3ClientHelper';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import { NextApiResponse } from 'next';
import { env } from 'process';

const handler = createAuthApiHandler();

handler.delete(async (req: AppNextApiRequest, res: NextApiResponse): Promise<void> => {
    const userId = req.session.userId;

    // delete all webhooks
    await localAxios.delete('/api/twitch/subscription');

    // delete images in s3
    await localAxios.post(`/api/storage/delete/${userId}`);


    // delete objects from s3
    const s3 = createS3(env.DO_SPACE_ENDPOINT, env.DO_ACCESS_KEY, env.DO_SECRET);

    try {
        const response = await s3.deleteObject({ Bucket: env.IMAGE_BUCKET_NAME, Key: userId }).promise();
        const statusCode = response.$response.httpResponse.statusCode;
        return res.status(statusCode).send('S3 deletion completed');
    } catch (e) {
        console.log('error deleting from s3: ', e);
    }

    // delete user from database
    await prisma.user.deleteMany({
        where: {
            id: userId,
        },
    });

    return res.status(200).send('Deleted user.');
});

export default handler;
