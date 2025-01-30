/*
  Warnings:

  - The values [ACTIVE,CANCELLED] on the enum `balance_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
-- Primero creamos el nuevo tipo enum
CREATE TYPE "balance_status_new" AS ENUM ('AVAILABLE', 'PARTIALLY_USED', 'DEPLETED', 'RETURNED');

-- Actualizamos la columna para usar temporalmente el tipo TEXT
ALTER TABLE "client_balance" ALTER COLUMN "status" TYPE TEXT;

-- Ahora actualizamos los registros
UPDATE "client_balance"
SET "status" = 'AVAILABLE'
WHERE "status" = 'ACTIVE';

UPDATE "client_balance"
SET "status" = 'RETURNED'
WHERE "status" = 'CANCELLED';

-- Finalmente convertimos la columna al nuevo tipo enum
ALTER TABLE "client_balance" ALTER COLUMN "status" TYPE "balance_status_new" USING ("status"::balance_status_new);
ALTER TYPE "balance_status" RENAME TO "balance_status_old";
ALTER TYPE "balance_status_new" RENAME TO "balance_status";
DROP TYPE "balance_status_old";
COMMIT;
