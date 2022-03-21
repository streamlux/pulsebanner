import { logger } from '@app/util/logger';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { Request } from 'express';
import imageToBase64 from 'image-to-base64';
import { rm } from 'fs/promises';
import { S3Service } from '@app/services/S3Service';

export const config = {
    api: {
        bodyParser: false
    }
};

const handler = createAuthApiHandler();

const s3 = S3Service.createS3()

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
            const base64 = await imageToBase64(fileReq.file?.path ?? '');
            try {
                await S3Service.uploadBase64('pb-static', userId, base64);
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

export default handler;
