/*
  Warnings:

  - You are about to drop the column `apiKey` on the `bank_product` table. All the data in the column will be lost.
  - You are about to drop the column `apiSecret` on the `bank_product` table. All the data in the column will be lost.
  - You are about to drop the column `apiUrl` on the `bank_product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bank_product" DROP COLUMN "apiKey",
DROP COLUMN "apiSecret",
DROP COLUMN "apiUrl",
ADD COLUMN     "api_key" TEXT,
ADD COLUMN     "api_secret" TEXT,
ADD COLUMN     "api_url" TEXT;
