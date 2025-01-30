-- AlterTable
ALTER TABLE "bank_product" ALTER COLUMN "payment_category" DROP NOT NULL,
ALTER COLUMN "payment_category" DROP DEFAULT;
