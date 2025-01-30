-- DropForeignKey
ALTER TABLE "invoice_payments" DROP CONSTRAINT "invoice_payments_transaction_id_fkey";

-- DropIndex
DROP INDEX "invoice_payments_transaction_id_idx";

-- AlterTable
ALTER TABLE "invoice_payments" ADD COLUMN     "transactionsId" INTEGER;

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_transactionsId_fkey" FOREIGN KEY ("transactionsId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
