import { createNewPromoCode, mediaKitGenerationHelper, updatePromoCodeStatus } from '@app/util/partner/partnerHelpers';
import { PartnerService } from '@app/services/partner/PartnerService';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import { AcceptanceStatus } from '@prisma/client';

const handler = createAuthApiHandler();

// throwing 400's somewhere here
handler.post(async (req, res) => {
    if (req.session.role !== 'admin') {
        return res.status(401).send('Not admin user');
    }

    const affiliateStatusUpdate = req.body.affiliateStatusMap as Record<string, AcceptanceStatus>;
    if (!affiliateStatusUpdate) {
        return res.status(400).send('Affiliates to update not provided in body.');
    }

    try {
        Object.keys(affiliateStatusUpdate).forEach(async (partnerId: string) => {
            const partnerInfo = await prisma.partner.findUnique({
                where: {
                    id: partnerId,
                },
            });

            const updatePartner = async () => {
                await prisma.partner.update({
                    where: {
                        id: partnerId,
                    },
                    data: {
                        acceptanceStatus: affiliateStatusUpdate[partnerId],
                    },
                });
            };

            // check if the user already has a promotion code.
            const codeExists = await prisma.stripePartnerInfo.findUnique({
                where: {
                    partnerId: partnerId,
                },
            });

            // if the affiliates state is now active, create or verify that there is a coupon with their code
            if (affiliateStatusUpdate[partnerId] === 'active') {
                // If the user is not in the table and the code doesn't exist, create a promo code and add them to the table
                if (codeExists === null && partnerInfo && partnerInfo.partnerCode) {
                    const response = await PartnerService.createNewPromoCode(partnerId, partnerInfo.partnerCode);
                    if (response.status !== 200) {
                        return res.status(400).send(response.message);
                    } else {
                        await updatePartner();
                        // generate the media kit for the user
                        await mediaKitGenerationHelper(partnerId, partnerInfo.partnerCode);
                        return res.status(200).send('Success creating new promo code');
                    }
                }

                // If the user does exist in the table, we need to just update the status of the promotion code, not the code itself
                const response = await PartnerService.updatePromoCodeStatus(partnerId, true);
                if (response === 200) {
                    await updatePartner();
                    return res.status(200).send('Success updating promo code');
                } else {
                    return res.status(400).send('Error updating promo code');
                }
            } else {
                // If they are not in the active state but exist in our table, we need to deactivate the code. Otherwise it's a no-op
                if (codeExists !== null) {
                    const response = await PartnerService.updatePromoCodeStatus(partnerId, false);
                    if (response === 200) {
                        await updatePartner();
                        return res.status(200).send('Success updating promo code');
                    } else {
                        return res.status(400).send('Error updating promo code');
                    }
                }
            }
        });
    } catch (e) {
        console.log('error updating affiliate status: ', e);
        return res.status(400).send(`Error updating affiliate status: ${e}`);
    }
});

export default handler;
