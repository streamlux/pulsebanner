-- DropForeignKey
ALTER TABLE "partner_invoice" DROP CONSTRAINT "partner_invoice_customerId_fkey";

-- DropIndex
DROP INDEX "partner_invoice_customerId_key";
