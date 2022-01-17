import { sendErrorInternal } from '@app/util/discord/sendError';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import axios from 'axios';

const handler = createAuthApiHandler();

const leadDynoEndpoint = 'https://api.leaddyno.com/v1/affiliates';

handler.post(async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
        console.log('Affiliate post request. UserId not found');
        sendErrorInternal('Affiliate post request. UserId not found');
        return res.send(404);
    }

    // we should disable the affiliate request button on the frontend but also double check their plan level on the backend

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
                activeAffiliate: false,
            },
            update: {
                affiliateId: dynoId,
            },
        });
    } catch (e) {
        console.log('error: ', e);
        return res.status(400).send(`Error processing request for affiliate: ${e}`);
    }
    return res.status(200).send('Successfully applied for affiliate');
});

// used for when they de-activate or unsubscribe from a paid membership
// handler.put(async (req, res) => {

// });

export default handler;
