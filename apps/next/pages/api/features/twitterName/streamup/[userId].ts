import { getTwitterInfo, getTwitterName, updateOriginalTwitterNameDB } from '@app/util/database/postgresHelpers';
import { getCurrentTwitterName, updateTwitterName } from '@app/util/twitter/twitterHelpers';
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

    const twitterInfo = await getTwitterInfo(userId);

    // get the current twitter name
    const twitterName = await getCurrentTwitterName(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    console.log('current twitter name: ', twitterName);

    // get the twitter stream name specified in table
    const dbInfo = await getTwitterName(userId);

    // If it is not found return immediately and do not update normal twitter name
    if (dbInfo && twitterName !== '') {
        if (dbInfo.streamName) {
            // join the existing twitter name with stream name
            const joinedName = `${dbInfo.streamName} | ${twitterName}`.substring(0, 50);

            // post to twitter
            const response = await updateTwitterName(twitterInfo.oauth_token, twitterInfo.oauth_token_secret, joinedName);

            if (response === 200) {
                await updateOriginalTwitterNameDB(userId, twitterName);
                console.log('success updating username on streamup');
                return res.status(200).send('success');
            }
        }
    }
    return res.status(400).send('error handling twitter name on streamup');
}
