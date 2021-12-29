import { getTwitterInfo, getTwitterName, updateOriginalTwitterNameDB } from '@app/util/database/postgresHelpers';
import { getCurrentTwitterName, updateTwitterName } from '@app/util/twitter/twitterHelpers';
import { TwitterName } from '@prisma/client';
import axios from 'axios';
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
    const currentTwitterName = await getCurrentTwitterName(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);

    // get the twitter stream name specified in table
    const twitterNameSettings: TwitterName = await getTwitterName(userId);
    if (!twitterNameSettings.enabled) {
        return res.status(400).send('Feature not enabled.');
    }

    let updatedTwitterLiveName = undefined;
    if (twitterNameSettings.streamName && currentTwitterName && twitterNameSettings.streamName.indexOf(currentTwitterName) === -1) {
        // check if they are premium. if they are premium, we cannot do anything
        const response = await axios.get('/api/user/subscription');
        if (response.data.plan && response.data.plan === 'Free') {
            updatedTwitterLiveName = `🔴 Live now | ${currentTwitterName}`;
            console.log(`Changing Twitter name from '${currentTwitterName}' to '${updatedTwitterLiveName}'.`);
        }
    } else {
        console.log(`Changing Twitter name from '${currentTwitterName}' to '${twitterNameSettings.streamName}'.`);
    }

    // If it is not found return immediately and do not update normal twitter name
    if (twitterNameSettings && currentTwitterName !== '') {
        if (updatedTwitterLiveName !== undefined) {
            // post to twitter
            const response = await updateTwitterName(twitterInfo.oauth_token, twitterInfo.oauth_token_secret, updatedTwitterLiveName);

            if (response === 200) {
                await updateOriginalTwitterNameDB(userId, currentTwitterName);
                console.log('Successfully updated Twitter name on streamup.');
                return res.status(200).end();
            }
        } else if (twitterNameSettings.streamName) {
            // post to twitter
            const response = await updateTwitterName(twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterNameSettings.streamName);

            if (response === 200) {
                await updateOriginalTwitterNameDB(userId, currentTwitterName);
                console.log('Successfully updated Twitter name on streamup.');
                return res.status(200).end();
            }
        }
    }
    return res.status(400).send('Error updating Twitter name on streamup');
}
