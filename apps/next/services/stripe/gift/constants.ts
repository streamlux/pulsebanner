import { PaymentPlan } from "@app/services/payment/paymentHelpers";

// for gifting. Price id to coupon id
export const giftPricingLookupMap: Record<string, string> = {
    // test env
    price_1KaRx2JzF2VT0EeK9kcprJar: 'HeaJ0GER', // personal 1 month
    price_1KaRwdJzF2VT0EeKUc14FMC1: 'LJSXGYHj', // personal 3 month
    price_1KaRvXJzF2VT0EeKhpeH0DOq: 'C6fDIzhp', // personal 6 month
    price_1KaaNyJzF2VT0EeKSuIGAE09: 'kx1j0z4n', // personal 1 year

    price_1KaRyWJzF2VT0EeKxTySB9Yy: 'VSQEVU3w', // professional 1 month
    price_1KaRyWJzF2VT0EeKCuKPCfR9: 'e1pPqJdK', // professional 3 month
    price_1KaRyWJzF2VT0EeKLkHcHWFk: 'g5sqhpgr', // professional 6 month
    price_1KaaPRJzF2VT0EeKkEfow72g: 'M0dg7iBM', // professional 1 year

    // prod env (TODO)
};

// gift couponId to the corresponding priceId
export const giftPromoCodeLookupMap: Record<string, string> = {
    // test env
    HeaJ0GER: 'price_1JwkpXJzF2VT0EeKXFGDsr5A', // personal 1 month
    LJSXGYHj: 'price_1JwkpXJzF2VT0EeKXFGDsr5A', // personal 3 month
    C6fDIzhp: 'price_1JwkpXJzF2VT0EeKXFGDsr5A', // personal 6 month
    kx1j0z4n: 'price_1JwgTKJzF2VT0EeKxAbRNX6d', // personal 1 year

    VSQEVU3w: 'price_1JwgPBJzF2VT0EeK31OQd0UG', // professional 1 month
    e1pPqJdK: 'price_1JwgPBJzF2VT0EeK31OQd0UG', // professional 3 month
    g5sqhpgr: 'price_1JwgPBJzF2VT0EeK31OQd0UG', // professional 6 month
    M0dg7iBM: 'price_1JwgShJzF2VT0EeKsIvKjFDc', // professional 1 year
};

/**
 * Name of the query param that contains the id of the gift purchase to redeem.
 */
export const giftRedemptionLinkQueryParamName = 'giftId';

type GiftDurations = 'oneMonth' | 'threeMonths' | 'sixMonths' | 'oneYear';

const personalGiftPriceIds: Record<GiftDurations, string> = {
    oneMonth: 'price_1KaRx2JzF2VT0EeK9kcprJar',
    threeMonths: 'price_1KaRwdJzF2VT0EeKUc14FMC1',
    sixMonths: 'price_1KaRvXJzF2VT0EeKhpeH0DOq',
    oneYear: 'price_1KaaNyJzF2VT0EeKSuIGAE09',

}

const professionalGiftPriceIds: Record<GiftDurations, string> = {
    oneMonth: 'price_1KaRyWJzF2VT0EeKxTySB9Yy',
    threeMonths: 'price_1KaRyWJzF2VT0EeKCuKPCfR9',
    sixMonths: 'price_1KaRyWJzF2VT0EeKLkHcHWFk',
    oneYear: 'price_1KaaPRJzF2VT0EeKkEfow72g',
}

export const giftPriceIds: Record<Exclude<PaymentPlan, 'Free'>, typeof professionalGiftPriceIds> = {
    Personal: personalGiftPriceIds,
    Professional: professionalGiftPriceIds,
}
