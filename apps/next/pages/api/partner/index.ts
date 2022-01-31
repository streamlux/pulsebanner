import { sendErrorInternal } from '@app/util/discord/sendError';
import { logger } from '@app/util/logger';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import axios from 'axios';

const handler = createAuthApiHandler();

const leadDynoEndpoint = 'https://api.leaddyno.com/v1/affiliates';

handler.post(async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
        logger.error('UserId not found to process affiliate request');
        sendErrorInternal('Affiliate post request. UserId not found');
        return res.send(404);
    }

    const subscriptionUser = await prisma.subscription.findUnique({
        where: {
            userId: userId,
        },
    });

    const isPartner = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            partner: true,
        },
    });

    const validPartner = isPartner !== null && isPartner.partner;
    const subscriber = subscriptionUser !== null;

    // if they aren't a partner or subscriber, we should not have shown them the page and we should not apply
    if (!validPartner && !subscriber) {
        logger.error('User is not partner or subscriber. Not handling request. ', { userId });
        return res.status(401).send('User is not partner or subscriber.');
    }

    // verify the user email/code does not exist already in leaddyno

    try {
        // make request to leaddyno to create the request
        const dynoResponse = await axios.post(leadDynoEndpoint, {
            key: process.env.LEADDYNO_API_KEY,
            email: req.body.email,
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            affiliate_code: req.body.discountCode,
            paypal_email: req.body.paypalEmail,
        });

        // this will return null i.e. that code is already in use. If this is the case, we need to report back to the user.
        // if the email already exists in leaddyno, it will not do anything. The affiliate code specified will NOT be in effect, it will be from the very first request
        if (dynoResponse === null) {
            logger.error(`The affiliate code ${req.body.discountCode} is already taken. Different discount code required.`, {
                userId: userId,
                discountCode: req.body.discountCode,
            });
            // process 409's by returning a toast message since the request failed
            return res.status(409).send('The affiliate code ${req.body.discountCode} is already taken. Please choose a different code.');
        }
        console.log('dynoResponse: ', dynoResponse);
        // update/add the user to the table
        const dynoId = dynoResponse.data.id;

        await prisma.affiliateInformation.upsert({
            where: {
                userId: userId,
            },
            create: {
                userId: userId,
                affiliateId: dynoId,
            },
            update: {
                affiliateId: dynoId,
            },
        });
    } catch (e) {
        logger.error(`Error processing request for partner program. `, { error: e, userId: userId });
        return res.status(400).send(`Error processing request for partner program: ${e}`);
    }
    return res.status(200).send('Successfully applied for partner program.');
});

export default handler;
