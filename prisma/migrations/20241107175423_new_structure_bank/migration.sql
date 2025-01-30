/*
  Warnings:

  - You are about to drop the column `fixed_fee_error` on the `bank_product_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `min_amount` on the `bank_product_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `operation_type` on the `bank_product_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `system_commission_rate` on the `bank_product_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `commission_rate` on the `commission_tiers` table. All the data in the column will be lost.
  - You are about to drop the column `min_amount` on the `commission_tiers` table. All the data in the column will be lost.
  - You are about to drop the column `operation_type` on the `commission_tiers` table. All the data in the column will be lost.
  - You are about to drop the column `fixed_fee_error` on the `isp_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `isp_id` on the `monthly_commission_summary` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `monthly_commission_summary` table. All the data in the column will be lost.
  - You are about to drop the column `total_commission` on the `monthly_commission_summary` table. All the data in the column will be lost.
  - You are about to drop the column `commission` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `operation_type` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `operation_cost` to the `commission_tiers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commission_tier_id` to the `monthly_commission_summary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_operation_cost` to the `monthly_commission_summary` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "monthly_commission_summary" DROP CONSTRAINT "monthly_commission_summary_isp_id_fkey";

-- AlterTable
ALTER TABLE "bank_product_configuration" DROP COLUMN "fixed_fee_error",
DROP COLUMN "min_amount",
DROP COLUMN "operation_type",
DROP COLUMN "system_commission_rate",
ADD COLUMN     "bank_operation_rate" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "commission_tiers" DROP COLUMN "commission_rate",
DROP COLUMN "min_amount",
DROP COLUMN "operation_type",
ADD COLUMN     "operation_cost" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "isp_configuration" DROP COLUMN "fixed_fee_error";

-- AlterTable
ALTER TABLE "monthly_commission_summary" DROP COLUMN "isp_id",
DROP COLUMN "total_amount",
DROP COLUMN "total_commission",
ADD COLUMN     "commission_tier_id" INTEGER NOT NULL,
ADD COLUMN     "total_operation_cost" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "commission",
DROP COLUMN "operation_type";

-- DropEnum
DROP TYPE "operation_type";

-- AddForeignKey
ALTER TABLE "monthly_commission_summary" ADD CONSTRAINT "monthly_commission_summary_commission_tier_id_fkey" FOREIGN KEY ("commission_tier_id") REFERENCES "commission_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
