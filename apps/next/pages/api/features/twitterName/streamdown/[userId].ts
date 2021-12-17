import { getOriginalTwitterName, getTwitterInfo } from '@app/util/database/postgresHelpers';
import { updateTwitterName } from '@app/util/twitter/twitterHelpers';
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
    // on stream down, we need to see if they have anything in their original image table. If they don't, we should not do anything because this means
    // they enabled the feature while streaming and we will fail updating it

    const userId: string = req.query.userId as string;

    const twitterInfo = await getTwitterInfo(userId);

    if (twitterInfo) {
        // call our db to get the original twitter name
        const originalName = await getOriginalTwitterName(userId);

        // when received, post to twitter to update
        if (originalName) {
            const response = await updateTwitterName(twitterInfo.oauth_token, twitterInfo.oauth_token_secret, originalName.originalName);

            if (response === 200) {
                // just return, we do not need to do anything to the db's on streamdown
                console.log('success updating username on streamdown');
                return res.status(200).send('success');
            }
        }

        return res.status(400).send('error handling twitter name on streamdown');
    }
}
