import { createS3 } from '@app/util/database/s3ClientHelper';
import { logger } from '@app/util/logger';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import multer from 'multer';
import { env } from 'process';
import multerS3 from 'multer-s3';
import { Request } from 'express';
import { uploadBase64 } from '@app/util/s3/upload';
import imageToBase64 from 'image-to-base64';
import { rm } from 'fs/promises';
import { getAccountsById } from '@app/util/getAccountsById';
import { download } from '@app/util/s3/download';

export const config = {
    api: {
        bodyParser: false
    }
};

const handler = createAuthApiHandler();

const s3 = createS3(env.DO_SPACE_ENDPOINT, env.DO_ACCESS_KEY, env.DO_SECRET);

const uploadDisk = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, `${Date.now().toString()}.jpeg`);
    }
});

const uploadS3 = multerS3({
    s3: s3,
    bucket: 'pb-static',
    acl: 'public-read',
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        cb(null, Date.now().toString())
    },
    contentType: (req, file, cb) => {
        cb(null, 'image/jpeg', file.stream);
    }
});

const upload = multer({
    storage: uploadDisk
});

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
            const base64 = await imageToBase64(fileReq.file.path);
            try {
                await uploadBase64(env.IMAGE_BUCKET_NAME, userId, base64);
            } catch (e) {
                logger.error('Error uplading banner to S3', { userId, error: e });
                return res.status(500).end();
            }
            res.status(200).end();
            await rm(fileReq.file.path);
            return;
        });

    } catch (e) {
        logger.error('Error updating offline banner from current Twitter banner', { userId });
        return res.status(500).end('S3 error');
    }
});

export default handler;
