/*
  Warnings:

  - You are about to drop the column `paypalEmail` on the `partner` table. All the data in the column will be lost.
  - You are about to drop the column `commissionPaidAt` on the `partner_invoice` table. All the data in the column will be lost.
  - You are about to drop the `affiliate_information` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "affiliate_information" DROP CONSTRAINT "affiliate_information_user_id_fkey";

-- AlterTable
ALTER TABLE "partner" DROP COLUMN "paypalEmail",
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "partner_invoice" DROP COLUMN "commissionPaidAt",
ADD COLUMN     "balanceTransactionId" TEXT;

-- DropTable
DROP TABLE "affiliate_information";
