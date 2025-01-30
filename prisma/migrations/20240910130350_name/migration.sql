/*
  Warnings:

  - You are about to drop the column `client_profile_id` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_client_profile_id_fkey";

-- AlterTable
ALTER TABLE "invoice_payments" ADD COLUMN     "admin_profile_id" INTEGER,
ADD COLUMN     "client_profile_id" INTEGER;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "client_profile_id";

-- CreateIndex
CREATE INDEX "invoice_payments_client_profile_id_idx" ON "invoice_payments"("client_profile_id");

-- CreateIndex
CREATE INDEX "invoice_payments_admin_profile_id_idx" ON "invoice_payments"("admin_profile_id");

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "client_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_admin_profile_id_fkey" FOREIGN KEY ("admin_profile_id") REFERENCES "admin_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
