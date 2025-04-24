-- CreateEnum
CREATE TYPE "roles_options" AS ENUM ('ADMIN', 'ACCOUNTING', 'CLIENT');

-- CreateEnum
CREATE TYPE "type_of_person" AS ENUM ('NATURAL', 'JURIDIC');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "currencies" AS ENUM ('USD', 'VES');

-- CreateEnum
CREATE TYPE "isp_commission_type" AS ENUM ('CLIENT_ASSUMES', 'ISP_ASSUMES');

-- CreateEnum
CREATE TYPE "bank_products_name" AS ENUM ('C2P', 'B2P', 'PAY_BUTTON', 'VERIFICATION_API');

-- CreateEnum
CREATE TYPE "balance_status" AS ENUM ('AVAILABLE', 'PARTIALLY_USED', 'DEPLETED', 'RETURNED');

-- CreateEnum
CREATE TYPE "payment_type" AS ENUM ('BALANCE', 'BANK_TRANSACTION');

-- CreateEnum
CREATE TYPE "payment_category" AS ENUM ('BALANCE', 'CREDIT_CARD', 'DEBIT_CARD', 'PAYMENT_LINK', 'BANK_TRANSFER', 'CRYPTO');

-- CreateTable
CREATE TABLE "banks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_product" (
    "id" SERIAL NOT NULL,
    "bank_id" INTEGER NOT NULL,
    "label" TEXT DEFAULT '',
    "name" "bank_products_name" NOT NULL,
    "payment_category" "payment_category",
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "api_url" TEXT,
    "api_key" TEXT,
    "api_secret" TEXT,

    CONSTRAINT "bank_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_product_configuration" (
    "id" SERIAL NOT NULL,
    "bank_product_id" INTEGER NOT NULL,
    "description" TEXT,
    "bank_commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bank_operation_rate" DOUBLE PRECISION DEFAULT 0,
    "currency" "currencies" NOT NULL,

    CONSTRAINT "bank_product_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_product_properties" (
    "id" SERIAL NOT NULL,
    "bank_product_id" INTEGER NOT NULL,
    "property_key" TEXT NOT NULL,
    "property_value" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "bank_product_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dolar_rate" (
    "id" SERIAL NOT NULL,
    "bcv_rate" DOUBLE PRECISION NOT NULL,
    "parallel_rate" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dolar_rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "bank_product_id" INTEGER NOT NULL,
    "dolar_rate_id" INTEGER NOT NULL,
    "bank_reference" TEXT,
    "intermediate_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "currencies" NOT NULL,
    "payment_status" "payment_status" NOT NULL,
    "error_code" TEXT,
    "error_message" TEXT,
    "bank_response" JSONB NOT NULL,
    "month_year" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_tiers" (
    "id" SERIAL NOT NULL,
    "min_transactions" INTEGER NOT NULL,
    "max_transactions" INTEGER NOT NULL,
    "operation_cost" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "commission_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_commission_summary" (
    "id" SERIAL NOT NULL,
    "commission_tier_id" INTEGER NOT NULL,
    "month_year" TEXT NOT NULL,
    "total_transactions" INTEGER NOT NULL,
    "total_operation_cost" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_commission_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_payments" (
    "id" SERIAL NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "network_manager" TEXT NOT NULL,
    "payment_type" "payment_type" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "invoice_data" JSONB NOT NULL,
    "client_profile_id" INTEGER,
    "admin_profile_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_balance" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "client_profile_id" INTEGER NOT NULL,
    "initial_amount" DOUBLE PRECISION NOT NULL,
    "current_amount" DOUBLE PRECISION NOT NULL,
    "status" "balance_status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_movement" (
    "id" SERIAL NOT NULL,
    "client_balance_id" INTEGER NOT NULL,
    "invoice_payment_id" INTEGER NOT NULL,
    "amount_used" DOUBLE PRECISION NOT NULL,
    "remaining_balance" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "isp" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "rif" TEXT,
    "network_manager_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "isp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "network_manager" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "api_url" TEXT,
    "api_key" TEXT,
    "api_secret" TEXT,

    CONSTRAINT "network_manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "isp_configuration" (
    "id" SERIAL NOT NULL,
    "isp_id" INTEGER NOT NULL,
    "igtf_rate" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "iva_rate" DOUBLE PRECISION NOT NULL DEFAULT 16,
    "add_iva_ves" BOOLEAN NOT NULL DEFAULT false,
    "add_iva_usd" BOOLEAN NOT NULL DEFAULT false,
    "add_igtf" BOOLEAN NOT NULL DEFAULT false,
    "commission_type" "isp_commission_type" NOT NULL,
    "allow_partial_payment" BOOLEAN NOT NULL DEFAULT false,
    "instance_subdomain" TEXT,
    "instance_ip" TEXT,
    "instance_token" TEXT,
    "admin_software_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "isp_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_configuration" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "global_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "role" "roles_options" NOT NULL,
    "is_authenticated" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_profile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "isp_id" INTEGER,
    "name" TEXT,
    "phone" TEXT,

    CONSTRAINT "admin_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_configuration" (
    "id" SERIAL NOT NULL,
    "admin_profile_id" INTEGER NOT NULL,
    "notification_preference" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "admin_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profile" (
    "id" SERIAL NOT NULL,
    "network_manager_user_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "isp_id" INTEGER,
    "name" TEXT,
    "dni" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "type_of_person" "type_of_person" NOT NULL,

    CONSTRAINT "client_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_configuration" (
    "id" SERIAL NOT NULL,
    "client_profile_id" INTEGER NOT NULL,
    "transaction_limit" DOUBLE PRECISION,
    "notification_preference" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "client_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "banks_code_key" ON "banks"("code");

-- CreateIndex
CREATE UNIQUE INDEX "bank_product_properties_bank_product_id_property_key_key" ON "bank_product_properties"("bank_product_id", "property_key");

-- CreateIndex
CREATE INDEX "invoice_payments_invoice_id_idx" ON "invoice_payments"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_payments_client_profile_id_idx" ON "invoice_payments"("client_profile_id");

-- CreateIndex
CREATE INDEX "invoice_payments_admin_profile_id_idx" ON "invoice_payments"("admin_profile_id");

-- CreateIndex
CREATE INDEX "client_balance_transaction_id_idx" ON "client_balance"("transaction_id");

-- CreateIndex
CREATE INDEX "client_balance_client_profile_id_idx" ON "client_balance"("client_profile_id");

-- CreateIndex
CREATE INDEX "balance_movement_client_balance_id_idx" ON "balance_movement"("client_balance_id");

-- CreateIndex
CREATE INDEX "balance_movement_invoice_payment_id_idx" ON "balance_movement"("invoice_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "isp_email_key" ON "isp"("email");

-- CreateIndex
CREATE UNIQUE INDEX "isp_rif_key" ON "isp"("rif");

-- CreateIndex
CREATE UNIQUE INDEX "network_manager_name_key" ON "network_manager"("name");

-- CreateIndex
CREATE UNIQUE INDEX "global_configuration_key_key" ON "global_configuration"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_profile_user_id_key" ON "admin_profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_profile_network_manager_user_id_key" ON "client_profile"("network_manager_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_profile_user_id_key" ON "client_profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_profile_dni_key" ON "client_profile"("dni");

-- AddForeignKey
ALTER TABLE "bank_product" ADD CONSTRAINT "bank_product_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_product_configuration" ADD CONSTRAINT "bank_product_configuration_bank_product_id_fkey" FOREIGN KEY ("bank_product_id") REFERENCES "bank_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_product_properties" ADD CONSTRAINT "bank_product_properties_bank_product_id_fkey" FOREIGN KEY ("bank_product_id") REFERENCES "bank_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bank_product_id_fkey" FOREIGN KEY ("bank_product_id") REFERENCES "bank_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_dolar_rate_id_fkey" FOREIGN KEY ("dolar_rate_id") REFERENCES "dolar_rate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_commission_summary" ADD CONSTRAINT "monthly_commission_summary_commission_tier_id_fkey" FOREIGN KEY ("commission_tier_id") REFERENCES "commission_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "client_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_admin_profile_id_fkey" FOREIGN KEY ("admin_profile_id") REFERENCES "admin_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_balance" ADD CONSTRAINT "client_balance_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_balance" ADD CONSTRAINT "client_balance_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "client_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_movement" ADD CONSTRAINT "balance_movement_client_balance_id_fkey" FOREIGN KEY ("client_balance_id") REFERENCES "client_balance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_movement" ADD CONSTRAINT "balance_movement_invoice_payment_id_fkey" FOREIGN KEY ("invoice_payment_id") REFERENCES "invoice_payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "isp" ADD CONSTRAINT "isp_network_manager_id_fkey" FOREIGN KEY ("network_manager_id") REFERENCES "network_manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "isp_configuration" ADD CONSTRAINT "isp_configuration_isp_id_fkey" FOREIGN KEY ("isp_id") REFERENCES "isp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profile" ADD CONSTRAINT "admin_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profile" ADD CONSTRAINT "admin_profile_isp_id_fkey" FOREIGN KEY ("isp_id") REFERENCES "isp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_configuration" ADD CONSTRAINT "admin_configuration_admin_profile_id_fkey" FOREIGN KEY ("admin_profile_id") REFERENCES "admin_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_profile" ADD CONSTRAINT "client_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_profile" ADD CONSTRAINT "client_profile_isp_id_fkey" FOREIGN KEY ("isp_id") REFERENCES "isp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_configuration" ADD CONSTRAINT "client_configuration_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "client_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
