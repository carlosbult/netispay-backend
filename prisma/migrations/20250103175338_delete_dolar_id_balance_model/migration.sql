/*
  Warnings:

  - You are about to drop the column `dolar_rate_id` on the `client_balance` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "client_balance" DROP CONSTRAINT "client_balance_dolar_rate_id_fkey";

-- AlterTable
ALTER TABLE "client_balance" DROP COLUMN "dolar_rate_id";
