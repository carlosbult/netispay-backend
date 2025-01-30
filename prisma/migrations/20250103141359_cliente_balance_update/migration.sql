/*
  Warnings:

  - The values [EXPIRED] on the enum `balance_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [USDT] on the enum `currencies` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `balance_type` on the `client_balance` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `client_balance` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_id` on the `client_balance` table. All the data in the column will be lost.
  - Made the column `transaction_id` on table `client_balance` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "balance_status_new" AS ENUM ('AVAILABLE', 'USED', 'CANCELLED');
ALTER TABLE "client_balance" ALTER COLUMN "status" TYPE "balance_status_new" USING ("status"::text::"balance_status_new");
ALTER TYPE "balance_status" RENAME TO "balance_status_old";
ALTER TYPE "balance_status_new" RENAME TO "balance_status";
DROP TYPE "balance_status_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "currencies_new" AS ENUM ('USD', 'VES');
ALTER TABLE "bank_product_configuration" ALTER COLUMN "currency" TYPE "currencies_new" USING ("currency"::text::"currencies_new");
ALTER TABLE "transactions" ALTER COLUMN "currency" TYPE "currencies_new" USING ("currency"::text::"currencies_new");
ALTER TYPE "currencies" RENAME TO "currencies_old";
ALTER TYPE "currencies_new" RENAME TO "currencies";
DROP TYPE "currencies_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "client_balance" DROP CONSTRAINT "client_balance_transaction_id_fkey";

-- DropIndex
DROP INDEX "client_balance_invoice_id_idx";

-- AlterTable
ALTER TABLE "client_balance" DROP COLUMN "balance_type",
DROP COLUMN "expires_at",
DROP COLUMN "invoice_id",
ALTER COLUMN "transaction_id" SET NOT NULL;

-- DropEnum
DROP TYPE "balance_type";

-- AddForeignKey
ALTER TABLE "client_balance" ADD CONSTRAINT "client_balance_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
