/*
  Warnings:

  - Added the required column `amount` to the `invoice_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_type` to the `invoice_payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "payment_type" AS ENUM ('BALANCE', 'BANK_TRANSACTION');

-- AlterTable
ALTER TABLE "invoice_payments" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "payment_type" "payment_type" NOT NULL;
