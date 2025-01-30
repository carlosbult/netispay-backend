/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `banks` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `name` on the `bank_product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "bank_products_name" AS ENUM ('CP2', 'B2P', 'PAY_BUTTON');

-- AlterTable
ALTER TABLE "bank_product" DROP COLUMN "name",
ADD COLUMN     "name" "bank_products_name" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "banks_code_key" ON "banks"("code");
