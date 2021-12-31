import { productPlan } from '@app/util/database/paymentHelpers';
import { flipFeatureEnabled, getTwitterInfo, getTwitterName, updateOriginalTwitterNameDB } from '@app/util/database/postgresHelpers';
import { getCurrentTwitterName, updateTwitterName, validateAuthentication } from '@app/util/twitter/twitterHelpers';
import { TwitterName } from '@prisma/client';
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

    // if they are not authenticated with twitter, return 401 and turn off the feature
    const validatedTwitter = await validateAuthentication(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(userId, 'name');
        console.log('Unauthenticated Twitter. Disabling feature name and requiring re-auth.');
        return res.status(401).send('Unauthenticated Twitter. Disabling feature and requiring re-auth.');
    }

    // get the current twitter name
    const currentTwitterName = await getCurrentTwitterName(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret);

    // get the twitter stream name specified in table
    const twitterNameSettings: TwitterName = await getTwitterName(userId);
    if (!twitterNameSettings.enabled) {
        return res.status(400).send('Feature not enabled.');
    }

    let updatedTwitterLiveName = undefined;
    if (twitterNameSettings.streamName && currentTwitterName && twitterNameSettings.streamName.indexOf(currentTwitterName) === -1) {
        // check if they are premium. if they are premium, we cannot do anything
        const plan = await productPlan(userId);

        if (!plan.partner && plan.plan === 'Free') {
            updatedTwitterLiveName = `🔴 Live now | ${currentTwitterName}`;
            console.log(`Changing Twitter name from '${currentTwitterName}' to '${updatedTwitterLiveName}'.`);
        } else {
            console.log(`Changing Twitter name from '${currentTwitterName}' to '${twitterNameSettings.streamName}'.`);
        }
    } else {
        console.log(`Changing Twitter name from '${currentTwitterName}' to '${twitterNameSettings.streamName}'.`);
    }

    // If it is not found return immediately and do not update normal twitwyter name
    if (twitterNameSettings && currentTwitterName !== '') {
        if (updatedTwitterLiveName !== undefined) {
            // post to twitter
            const response = await updateTwitterName(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, updatedTwitterLiveName);

            if (response === 200) {
                await updateOriginalTwitterNameDB(userId, currentTwitterName);
                console.log('Successfully updated Twitter name on streamup.');
                return res.status(200).end();
            }
        } else if (twitterNameSettings.streamName) {
            // post to twitter
            const response = await updateTwitterName(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterNameSettings.streamName);

            if (response === 200) {
                await updateOriginalTwitterNameDB(userId, currentTwitterName);
                console.log('Successfully updated Twitter name on streamup.');
                return res.status(200).end();
            }
        }
    }
    return res.status(400).send('Error updating Twitter name on streamup');
}
