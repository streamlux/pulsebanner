import { download } from '@app/util/s3/download';
import { uploadBase64 } from '@app/util/s3/upload';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import { env } from 'process';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    if (req.session.role !== 'admin') {
        res.send(401);
    }

    const userId = req.query.userId;
    console.log('updating backup image');
    if (userId && typeof userId === 'string') {
        try {
            const backup: string = await download(env.IMAGE_BUCKET_NAME, userId);
            await uploadBase64(env.BANNER_BACKUP_BUCKET, userId, backup);
            return res.status(200).end();
        } catch (e) {
            return res.status(500).end('S3 error');
        }
    } else {
        return res.status(400).end('Missing userId parameter');
    }
});

export default handler;
