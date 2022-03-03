/*
  Warnings:

  - You are about to drop the `ProfilePic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfilePicRendered` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `affiliate_information` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customerId` to the `partner_invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "CommissionStatus" ADD VALUE 'waitPeriod';

-- DropIndex
DROP INDEX "partner_invoice_partnerId_key";

-- AlterTable
ALTER TABLE "partner_invoice" ADD COLUMN     "commissionPaidAt" TIMESTAMP(3),
ADD COLUMN     "customerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "partner_invoice" ADD CONSTRAINT "partner_invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
