import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';

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

    const userId: string = req.query.userId as string;

    // get the current twitter name

    // get the twitter stream name specified in table

    // If it is not found return immediately and do not update normal twitter name

    // update TwitterName table to have the normal twitter name

    // post to twitter

    // done
}
