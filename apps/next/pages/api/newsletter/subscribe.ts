import axios from 'axios';
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

    // communicate with revue
    console.log('here with data: ', req.body);

    const response = await axios.post(
        'https://www.getrevue.co/api/v2/subscribers',
        {
            email: req.body.email,
        },
        {
            headers: { Authorization: `Bearer ${env.REVUE_API_KEY}` },
        }
    );

    console.log('response: ', response.status);
    return res.status(response.status).send(response.status !== 200 ? 'Failure' : 'Success');
}
