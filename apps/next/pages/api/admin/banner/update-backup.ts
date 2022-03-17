import env from '@app/util/env';
import { download } from '@app/util/s3/download';
import { uploadBase64 } from '@app/util/s3/upload';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    if (req.session.role !== 'admin') {
        res.send(401);
    }

    const userId = req.query.userId;
    console.log('updating backup image');
    if (userId && typeof userId === 'string') {
        try {
            const backup: string | undefined = await download(env.IMAGE_BUCKET_NAME, userId);
            if (backup) {
                await uploadBase64(env.BANNER_BACKUP_BUCKET, userId, backup);
                return res.status(200).end();
            } else {
                return res.status(500).end('S3 error');
            }
        } catch (e) {
            return res.status(500).end('S3 error');
        }
    } else {
        return res.status(400).end('Missing userId parameter');
    }
});

export default handler;
