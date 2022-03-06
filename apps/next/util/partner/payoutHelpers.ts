import { PartnerInvoice } from '@prisma/client';
import prisma from '../ssr/prisma';

export const getPartnerInvoice = async (invoiceId: string): Promise<PartnerInvoice> => {
    const partnerInvoice = await prisma.partnerInvoice.findUnique({
        where: {
            id: invoiceId,
        }
    });

    if (partnerInvoice === null || partnerInvoice.partnerId === null || partnerInvoice.commissionAmount === null) {
        return undefined;
    }

    return partnerInvoice;
};

export const getPartnerInfo = async (partnerId: string): Promise<string | undefined> => {
    // get their userId
    const partnerInfo = await prisma.partnerInformation.findUnique({
        where: {
            partnerId: partnerId,
        },
        select: {
            userId: true,
        },
    });

    if (partnerInfo === null) {
        return undefined;
    }

    return partnerInfo.userId;
};

export const getPartnerCustomerInfo = async (userId: string): Promise<string | undefined> => {
    // get the customerId
    const customerId = await prisma.customer.findUnique({
        where: {
            userId: userId,
        },
        select: {
            id: true,
        },
    });

    if (customerId === null) {
        return undefined;
    }

    return customerId.id;
};

export const setBalanceTransactionId = async (invoiceId: string, balanceTransactionId: string) => {
    // update the commission status
    await prisma.partnerInvoice.update({
        where: {
            id: invoiceId,
        },
        data: {
            commissionStatus: 'complete',
            balanceTransactionId,
        },
    });
};

export const updateRejectedPayoutStatus = async (invoiceId: string) => {
    await prisma.partnerInvoice.update({
        where: {
            id: invoiceId,
        },
        data: {
            commissionStatus: 'rejected',
        },
    });
};
