/*
  Warnings:

  - You are about to drop the column `transactionsId` on the `invoice_payments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoice_payments" DROP CONSTRAINT "invoice_payments_transactionsId_fkey";

-- AlterTable
ALTER TABLE "invoice_payments" DROP COLUMN "transactionsId";

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
