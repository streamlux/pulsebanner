import { GiftPurchase, Price, Product } from "@prisma/client";

export type GiftInfo = { gift: GiftPurchase; redemptionUrl: string; redeemed: boolean; price: Price & { product: Product } };
