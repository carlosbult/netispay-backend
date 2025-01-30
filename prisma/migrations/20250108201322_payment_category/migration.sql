-- CreateEnum
CREATE TYPE "payment_category" AS ENUM ('BALANCE', 'CREDIT_CARD', 'DEBIT_CARD', 'PAYMENT_LINK', 'BANK_TRANSFER', 'CRYPTO');

-- AlterTable
ALTER TABLE "bank_product" ADD COLUMN     "payment_category" "payment_category" NOT NULL DEFAULT 'BANK_TRANSFER';
