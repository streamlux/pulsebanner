import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { env } from 'process';
import { createS3 } from '@app/util/database/s3ClientHelper';
import { log } from '@app/util/discord/log';

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
    let base64Image: string = undefined;

    try {
        const s3Object = await s3.getObject({ Bucket: 'pulsebanner', Key: userId }).promise();
        base64Image = s3Object.Body.toString();
    } catch (e) {
        log('Error getting object from S3: ', e);
    }

    return base64Image === undefined ? res.status(404).send('Could not find user') : res.status(200).send(base64Image);
}
