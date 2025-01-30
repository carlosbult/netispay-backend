/*
  Warnings:

  - The values [CP2] on the enum `bank_products_name` will be removed. If these variants are still used in the database, this will fail.
  - The values [CLIENT_ASSUMES_ALL,CLIENT_ASSUMES_SYSTEM_ISP_ASSUMES_BANK,ISP_ASSUMES_ALL,ISP_ASSUMES_SYSTEM_CLIENT_ASSUMES_BANK] on the enum `isp_commission_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [PAID,UNPAID,INCOMPLETE] on the enum `payment_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [R001,R002,R003,R004] on the enum `roles_options` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `access_level` on the `admin_profile` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `admin_profile` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "bank_products_name_new" AS ENUM ('C2P', 'B2P', 'PAY_BUTTON', 'VERIFICATION_API');
ALTER TABLE "bank_product" ALTER COLUMN "name" TYPE "bank_products_name_new" USING ("name"::text::"bank_products_name_new");
ALTER TYPE "bank_products_name" RENAME TO "bank_products_name_old";
ALTER TYPE "bank_products_name_new" RENAME TO "bank_products_name";
DROP TYPE "bank_products_name_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "isp_commission_type_new" AS ENUM ('CLIENT_ASSUMES', 'ISP_ASSUMES');
ALTER TABLE "isp_configuration" ALTER COLUMN "commission_type" TYPE "isp_commission_type_new" USING ("commission_type"::text::"isp_commission_type_new");
ALTER TYPE "isp_commission_type" RENAME TO "isp_commission_type_old";
ALTER TYPE "isp_commission_type_new" RENAME TO "isp_commission_type";
DROP TYPE "isp_commission_type_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "payment_status_new" AS ENUM ('SUCCESS', 'FAILED');
ALTER TABLE "transactions" ALTER COLUMN "payment_status" TYPE "payment_status_new" USING ("payment_status"::text::"payment_status_new");
ALTER TYPE "payment_status" RENAME TO "payment_status_old";
ALTER TYPE "payment_status_new" RENAME TO "payment_status";
DROP TYPE "payment_status_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "roles_options_new" AS ENUM ('ADMIN', 'ACCOUNTING', 'CLIENT');
ALTER TABLE "user" ALTER COLUMN "role" TYPE "roles_options_new" USING ("role"::text::"roles_options_new");
ALTER TYPE "roles_options" RENAME TO "roles_options_old";
ALTER TYPE "roles_options_new" RENAME TO "roles_options";
DROP TYPE "roles_options_old";
COMMIT;

-- AlterTable
ALTER TABLE "admin_profile" DROP COLUMN "access_level",
DROP COLUMN "department";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "is_authenticated" SET DEFAULT true;
