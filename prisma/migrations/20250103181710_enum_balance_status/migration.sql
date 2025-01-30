/*
  Warnings:

  - The values [PENDING,EXPIRED] on the enum `balance_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "balance_status_new" AS ENUM ('ACTIVE', 'PARTIALLY_USED', 'DEPLETED', 'RETURNED', 'CANCELLED');
ALTER TABLE "client_balance" ALTER COLUMN "status" TYPE "balance_status_new" USING ("status"::text::"balance_status_new");
ALTER TYPE "balance_status" RENAME TO "balance_status_old";
ALTER TYPE "balance_status_new" RENAME TO "balance_status";
DROP TYPE "balance_status_old";
COMMIT;
