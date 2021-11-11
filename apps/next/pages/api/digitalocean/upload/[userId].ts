import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import S3 from 'aws-sdk/clients/s3';
import { env } from 'process';
import imageToBase64 from 'image-to-base64';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run the cors middleware
    // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
    await NextCors(req, res, {
        // Options
        // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    const s3 = new S3({
        endpoint: env.DO_SPACE_ENDPOINT,
        credentials: {
            accessKeyId: env.DO_ACCESS_KEY,
            secretAccessKey: env.DO_SECRET,
        },
    });

    const userId: string = req.query.userId as string;
    const imageUrl: string = req.query.imageUrl as string;

    const imageBase64 = imageUrl === 'empty' ? 'empty' : await imageToBase64(imageUrl);

    s3.upload({ Bucket: 'pulsebanner', Key: userId, Body: imageBase64 }, null, (err, _data) => {
        if (err) {
            console.log('error: ', err);
            res.status(400).send('Error uploading image to s3 storage');
        }
    });

    res.status(200).send('Success');
}