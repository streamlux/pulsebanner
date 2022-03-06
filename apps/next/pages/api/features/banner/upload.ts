import { createS3 } from '@app/util/database/s3ClientHelper';
import { logger } from '@app/util/logger';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import multer from 'multer';
import { env } from 'process';
import multerS3 from 'multer-s3';
import { Request } from 'express';

// Docs: https://www.npmjs.com/package/multer-s3
const upload = multer({
    storage: multerS3({
        s3: createS3(env.DO_SPACE_ENDPOINT, env.DO_ACCESS_KEY, env.DO_SECRET),
        bucket: env.IMAGE_BUCKET_NAME,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req: Request & { session: any }, file, cb) {
            cb(null, `${req.query.folder}/${req.session.userId}`)
        },
        contentType: (req, file, cb) => {
            cb(null, 'image/jpeg', file.stream);
        }
    })
});

// Disable body parsing for this endpoint so we can use multer
export const config = {
    api: {
        bodyParser: false
    }
};

const handler = createAuthApiHandler();

// uploads image as a jpeg to s3 bucket with userId as the key
handler.post(async (req, res) => {
    const userId = req.session.userId;

    try {
        upload.single("File")(req as unknown as Request<any, any, { file: any }>, {} as any, async (err) => {
            if (err) {
                console.log(err);
                return res.status(500).end();
            }
            res.status(200).send((req as any).file.location);
            return;
        });

    } catch (e) {
        logger.error('Error updating offline banner from current Twitter banner', { userId });
        return res.status(500).end('S3 error');
    }
});

export default handler;
