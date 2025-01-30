-- CreateEnum
CREATE TYPE "balance_type" AS ENUM ('PARTIAL_PAYMENT', 'ADVANCE_PAYMENT');

-- CreateEnum
CREATE TYPE "balance_status" AS ENUM ('AVAILABLE', 'USED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "client_balance" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER,
    "invoice_id" TEXT,
    "client_profile_id" INTEGER NOT NULL,
    "amount_usd" DOUBLE PRECISION NOT NULL,
    "amount_ves" DOUBLE PRECISION,
    "balance_type" "balance_type" NOT NULL,
    "status" "balance_status" NOT NULL,
    "dolar_rate_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_balance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_balance_transaction_id_idx" ON "client_balance"("transaction_id");

-- CreateIndex
CREATE INDEX "client_balance_invoice_id_idx" ON "client_balance"("invoice_id");

-- CreateIndex
CREATE INDEX "client_balance_client_profile_id_idx" ON "client_balance"("client_profile_id");

-- AddForeignKey
ALTER TABLE "client_balance" ADD CONSTRAINT "client_balance_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_balance" ADD CONSTRAINT "client_balance_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "client_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_balance" ADD CONSTRAINT "client_balance_dolar_rate_id_fkey" FOREIGN KEY ("dolar_rate_id") REFERENCES "dolar_rate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
