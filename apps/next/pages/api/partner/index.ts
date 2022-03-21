import { AcceptanceStatus, PartnerCreateType } from '@app/services/partner/types';
import { sendErrorInternal } from '@app/util/discord/sendError';
import { logger } from '@app/util/logger';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';

const handler = createAuthApiHandler();

// create new affiliate (we create in both tables here)
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
        // logger.error('User is not partner or subscriber. Not handling request. ', { userId });
        return res.status(401).send('User is not partner or subscriber.');
    }

    try {
        // create partner object
        const partnerInfo: PartnerCreateType = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName ?? null,
            partnerCode: req.body.partnerCode,
            notes: req.body.notes ?? null,
        };

        if (!partnerInfo.email || !partnerInfo.firstName || !partnerInfo.partnerCode) {
            return res.status(400).send('Invalid paramters passed back from client.');
        }

        // verify that the email and code does not already exist
        const partnerEmailExists = await prisma.partner.findUnique({
            where: {
                email: partnerInfo.email,
            },
        });

        const partnerCodeExists = await prisma.partner.findUnique({
            where: {
                partnerCode: partnerInfo.partnerCode,
            },
        });

        // Already exists, return 409
        if (partnerEmailExists !== null) {
            console.log('partner email already exists');
            return res.status(409).send({ email: partnerInfo.email });
        }

        if (partnerCodeExists !== null) {
            console.log('partner code already exists');
            return res.status(409).send({ partnerCode: partnerInfo.partnerCode });
        }

        const partner = await prisma.partner.create({
            data: {
                email: partnerInfo.email,
                firstName: partnerInfo.firstName,
                lastName: partnerInfo.lastName,
                partnerCode: partnerInfo.partnerCode,
                acceptanceStatus: AcceptanceStatus.Pending,
                notes: partnerInfo.notes
            },
        });

        if (partner !== null) {
            const partnerId = partner.id;

            await prisma.partnerInformation.upsert({
                where: {
                    userId: userId,
                },
                create: {
                    userId: userId,
                    partnerId: partnerId,
                },
                update: {
                    partnerId: partnerId,
                },
            });
        }
    } catch (e) {
        logger.error(`Error processing request for internal partner program. `, { error: e, userId: userId });
        return res.status(400).send(`Error processing request for partner program: ${e}`);
    }
    return res.status(200).send('Successfully applied for partner program.');
});

export default handler;
