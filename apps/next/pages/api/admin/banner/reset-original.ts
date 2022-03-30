import { Context } from '@app/services/Context';
import { S3Service } from '@app/services/S3Service';
import env from '@app/util/env';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    if (req.session.role !== 'admin') {
        res.send(401);
    }

    const userId = req.query.userId as string;

    const context = new Context(userId, {
        action: 'Reset original banner image',
        admin: true,
    });

    if (userId && typeof userId === 'string') {
        try {
            const backup = await S3Service.download(context, env.BANNER_BACKUP_BUCKET, userId);
            if (backup) {
                await S3Service.uploadBase64(context, env.IMAGE_BUCKET_NAME, userId, backup);
                return res.status(200).end();
            } else {
                return res.status(500).end('No banner found');
            }
        } catch (e) {
            return res.status(500).end('S3 error');
        }
    } else {
        return res.status(400).end('Missing userId parameter');
    }
});

export default handler;
