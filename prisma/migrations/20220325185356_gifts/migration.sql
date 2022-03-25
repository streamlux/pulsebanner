-- AlterTable
ALTER TABLE "prices" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "nickname" TEXT;

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "purchaseAmount" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "status" TEXT NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_purchase" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "promoCodeCode" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "checkoutSessionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "purchaserUserId" TEXT NOT NULL,
    "purchaserEmail" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoice_id_key" ON "invoice"("id");

-- CreateIndex
CREATE UNIQUE INDEX "gift_purchase_promoCodeId_key" ON "gift_purchase"("promoCodeId");

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_purchase" ADD CONSTRAINT "gift_purchase_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "prices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_purchase" ADD CONSTRAINT "gift_purchase_purchaserUserId_fkey" FOREIGN KEY ("purchaserUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
