import { logger } from '@app/util/logger';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import multer from 'multer';
import { Request } from 'express';
import imageToBase64 from 'image-to-base64';
import { rm } from 'fs/promises';
import env from '@app/util/env';
import { S3Service } from '@app/services/S3Service';

// disk storage only used temporarily, then we convert it to base64 and upload to s3
// we could probably make this better later on
const upload = multer({
    storage: multer.diskStorage({
        filename: (req, file, cb) => {
            cb(null, `${Date.now().toString()}.jpeg`);
        }
    })
});

const handler = createAuthApiHandler();

// uploads image as base64 to the s3 bucket with userId as the key
handler.post(async (req, res) => {
    const userId = req.session.userId;

    try {
        upload.single("File")(req as unknown as Request, {} as any, async (err) => {
            const fileReq: Request = req as unknown as Request;
            if (err) {
                console.log(err);
                return res.status(500).end();
            }
            console.log(fileReq.file);
            const base64 = await imageToBase64(fileReq.file?.path ?? '');
            try {
                await S3Service.uploadBase64(env.IMAGE_BUCKET_NAME, userId, base64);
            } catch (e) {
                logger.error('Error uplading banner to S3', { userId, error: e });
                return res.status(500).end();
            }
            res.status(200).end();
            if (fileReq.file) {
                await rm(fileReq.file.path);
            }
            return;
        });

    } catch (e) {
        logger.error('Error updating offline banner from current Twitter banner', { userId });
        return res.status(500).end('S3 error');
    }
});

// disable body parser for this endpoint so we can use multer
export const config = {
    api: {
        bodyParser: false
    }
};
export default handler;
