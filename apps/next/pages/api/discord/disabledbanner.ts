import { CustomSession } from '@app/services/auth/CustomSession';
import env from '@app/util/env';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import NextCors from 'nextjs-cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run the cors middleware
    // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
    await NextCors(req, res, {
        // Options
        // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        methods: ['POST'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    const session: CustomSession | null = await getSession({ req }) as CustomSession;
    if (session === null || session.user === null) {
        return res.status(401).send('Unauthenticated');
    }

    const body = req.body;

    if (process.env.ENABLE_DISCORD_WEBHOOKS === 'true') {
        const response = await axios.post(env.DISCORD_BANNER_DISABLED_WEBHOOK_URL, {
            content: `Reason for disabled: ${body.radioValue}.\nComment: ${body.inputValue}\nUserID: ${session.user.id}`,
        });

        return res.send(response.status);
    }

    res.status(200).send('Success');
}
