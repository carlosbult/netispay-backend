/*
  Warnings:

  - You are about to drop the column `commission_rate` on the `bank_product_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `fixed_fee_success` on the `bank_product_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `invoice_payments` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `invoice_payments` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `invoice_payments` table. All the data in the column will be lost.
  - You are about to drop the column `client_pays_fee` on the `isp_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `commission_rate` on the `isp_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `fixed_fee_success` on the `isp_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `commission_rate` on the `monthly_commission_summary` table. All the data in the column will be lost.
  - Added the required column `operation_type` to the `bank_product_configuration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operation_type` to the `commission_tiers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_data` to the `invoice_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commission_type` to the `isp_configuration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `isp_configuration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operation_type` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "isp_commission_type" AS ENUM ('CLIENT_ASSUMES_ALL', 'CLIENT_ASSUMES_SYSTEM_ISP_ASSUMES_BANK', 'ISP_ASSUMES_ALL', 'ISP_ASSUMES_SYSTEM_CLIENT_ASSUMES_BANK');

-- CreateEnum
CREATE TYPE "operation_type" AS ENUM ('INTERNAL_TRANSACTION', 'EXTERNAL_VERIFICATION');

-- AlterEnum
ALTER TYPE "bank_products_name" ADD VALUE 'VERIFICATION_API';

-- AlterTable
ALTER TABLE "bank_product_configuration" DROP COLUMN "commission_rate",
DROP COLUMN "fixed_fee_success",
ADD COLUMN     "bank_commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "min_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "operation_type" "operation_type" NOT NULL,
ADD COLUMN     "system_commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "commission_tiers" ADD COLUMN     "min_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "operation_type" "operation_type" NOT NULL;

-- AlterTable
ALTER TABLE "invoice_payments" DROP COLUMN "amount",
DROP COLUMN "currency",
DROP COLUMN "updated_at",
ADD COLUMN     "invoice_data" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "isp_configuration" DROP COLUMN "client_pays_fee",
DROP COLUMN "commission_rate",
DROP COLUMN "fixed_fee_success",
ADD COLUMN     "commission_type" "isp_commission_type" NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "igtf_rate" DOUBLE PRECISION NOT NULL DEFAULT 3,
ADD COLUMN     "include_igtf" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "include_iva_usd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "include_iva_ves" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "iva_rate" DOUBLE PRECISION NOT NULL DEFAULT 16,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "monthly_commission_summary" DROP COLUMN "commission_rate";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "operation_type" "operation_type" NOT NULL;
