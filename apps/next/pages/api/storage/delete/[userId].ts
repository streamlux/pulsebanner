import { createS3 } from '@app/util/database/s3ClientHelper';
import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { env } from 'process';

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

    const s3 = createS3(env.DO_SPACE_ENDPOINT, env.DO_ACCESS_KEY, env.DO_SECRET);

    const userId: string = req.query.userId as string;

    try {
        const response = await s3.deleteObject({ Bucket: env.IMAGE_BUCKET_NAME, Key: userId }).promise();
        const statusCode = response.$response.httpResponse.statusCode;
        return res.status(statusCode).send('S3 deletion completed');
    } catch (e) {
        console.log('error deleting from s3: ', e);
    }
    return res.status(400).send('Error deleting from s3');
}
