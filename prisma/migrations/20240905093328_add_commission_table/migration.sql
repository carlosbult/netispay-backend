/*
  Warnings:

  - You are about to drop the column `interest_rate` on the `bank_product_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_fee` on the `bank_product_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `connection_params` on the `isp_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `isp_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `service_rate` on the `isp_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `ammount_usd` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `ammount_ves` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `currency` to the `bank_product_configuration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bank_response` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month_year` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "currencies" AS ENUM ('USD', 'VES', 'USDT');

-- AlterEnum
ALTER TYPE "payment_status" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "bank_product_configuration" DROP COLUMN "interest_rate",
DROP COLUMN "transaction_fee",
ADD COLUMN     "commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currency" "currencies" NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fixed_fee_error" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "fixed_fee_success" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "isp_configuration" DROP COLUMN "connection_params",
DROP COLUMN "is_active",
DROP COLUMN "service_rate",
ADD COLUMN     "admin_software_token" TEXT,
ADD COLUMN     "client_pays_fee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 2.75,
ADD COLUMN     "fixed_fee_error" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
ADD COLUMN     "fixed_fee_success" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
ADD COLUMN     "instance_ip" TEXT,
ADD COLUMN     "instance_subdomain" TEXT,
ADD COLUMN     "instance_token" TEXT;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "ammount_usd",
DROP COLUMN "ammount_ves",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "bank_response" JSONB NOT NULL,
ADD COLUMN     "currency" "currencies" NOT NULL,
ADD COLUMN     "error_code" TEXT,
ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "month_year" TEXT NOT NULL,
ALTER COLUMN "bank_reference" DROP NOT NULL,
ALTER COLUMN "commission" DROP NOT NULL;

-- CreateTable
CREATE TABLE "commission_tiers" (
    "id" SERIAL NOT NULL,
    "min_transactions" INTEGER NOT NULL,
    "max_transactions" INTEGER NOT NULL,
    "commission_rate" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "commission_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_commission_summary" (
    "id" SERIAL NOT NULL,
    "isp_id" INTEGER NOT NULL,
    "month_year" TEXT NOT NULL,
    "total_transactions" INTEGER NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "commission_rate" DOUBLE PRECISION NOT NULL,
    "total_commission" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_commission_summary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "monthly_commission_summary" ADD CONSTRAINT "monthly_commission_summary_isp_id_fkey" FOREIGN KEY ("isp_id") REFERENCES "isp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
