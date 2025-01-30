/*
  Warnings:

  - The values [AVAILABLE,USED] on the enum `balance_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `amount_usd` on the `client_balance` table. All the data in the column will be lost.
  - You are about to drop the column `amount_ves` on the `client_balance` table. All the data in the column will be lost.
  - Added the required column `current_amount_usd` to the `client_balance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initial_amount_usd` to the `client_balance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "balance_status_new" AS ENUM ('ACTIVE', 'PENDING', 'PARTIALLY_USED', 'DEPLETED', 'EXPIRED', 'CANCELLED');
ALTER TABLE "client_balance" ALTER COLUMN "status" TYPE "balance_status_new" USING ("status"::text::"balance_status_new");
ALTER TYPE "balance_status" RENAME TO "balance_status_old";
ALTER TYPE "balance_status_new" RENAME TO "balance_status";
DROP TYPE "balance_status_old";
COMMIT;

-- AlterTable
ALTER TABLE "client_balance" DROP COLUMN "amount_usd",
DROP COLUMN "amount_ves",
ADD COLUMN     "current_amount_usd" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "current_amount_ves" DOUBLE PRECISION,
ADD COLUMN     "initial_amount_usd" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "initial_amount_ves" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "balance_movement" (
    "id" SERIAL NOT NULL,
    "client_balance_id" INTEGER NOT NULL,
    "invoice_payment_id" INTEGER NOT NULL,
    "amount_used_usd" DOUBLE PRECISION NOT NULL,
    "amount_used_ves" DOUBLE PRECISION,
    "remaining_balance_usd" DOUBLE PRECISION NOT NULL,
    "remaining_balance_ves" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_movement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "balance_movement_client_balance_id_idx" ON "balance_movement"("client_balance_id");

-- CreateIndex
CREATE INDEX "balance_movement_invoice_payment_id_idx" ON "balance_movement"("invoice_payment_id");

-- AddForeignKey
ALTER TABLE "balance_movement" ADD CONSTRAINT "balance_movement_client_balance_id_fkey" FOREIGN KEY ("client_balance_id") REFERENCES "client_balance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_movement" ADD CONSTRAINT "balance_movement_invoice_payment_id_fkey" FOREIGN KEY ("invoice_payment_id") REFERENCES "invoice_payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
