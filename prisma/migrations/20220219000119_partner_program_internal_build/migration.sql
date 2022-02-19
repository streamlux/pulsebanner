/*
  Warnings:

  - You are about to drop the `ProfilePic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfilePicRendered` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `affiliate_information` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AcceptanceStatus" AS ENUM ('active', 'pending', 'suspended', 'rejected');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('complete', 'pendingCompletion', 'pending', 'rejected', 'pendingRejection', 'none');

-- CreateTable
CREATE TABLE "partner_information" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,

    CONSTRAINT "partner_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "paypalEmail" TEXT NOT NULL,
    "partnerCode" TEXT NOT NULL,
    "acceptanceStatus" "AcceptanceStatus" NOT NULL,

    CONSTRAINT "partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_partner_info" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "stripePromoCode" TEXT NOT NULL,

    CONSTRAINT "stripe_partner_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_invoice" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "commissionAmount" INTEGER NOT NULL,
    "purchaseAmount" INTEGER NOT NULL,
    "commissionStatus" "CommissionStatus" NOT NULL,

    CONSTRAINT "partner_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partner_information_user_id_key" ON "partner_information"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_information_partner_id_key" ON "partner_information"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_email_key" ON "partner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partner_partnerCode_key" ON "partner"("partnerCode");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_partner_info_partnerId_key" ON "stripe_partner_info"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_partner_info_stripePromoCode_key" ON "stripe_partner_info"("stripePromoCode");

-- CreateIndex
CREATE UNIQUE INDEX "partner_invoice_id_key" ON "partner_invoice"("id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_invoice_partnerId_key" ON "partner_invoice"("partnerId");

-- AddForeignKey
ALTER TABLE "partner_information" ADD CONSTRAINT "partner_information_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_information" ADD CONSTRAINT "partner_information_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stripe_partner_info" ADD CONSTRAINT "stripe_partner_info_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_invoice" ADD CONSTRAINT "partner_invoice_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
