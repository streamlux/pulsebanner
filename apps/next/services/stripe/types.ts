export type InvoiceInformation = {
    invoiceId: string;
    stripePromoCode: string | undefined;
    paidAt: Date;
    productId: string | undefined;
    customerId: string;
    metadata: any;
    status: string;
    priceId: string | undefined;
    purchaseAmount: number;
    planBaseAmount: number;
    giftProducts: string[];
};
