-- CreateEnum
CREATE TYPE "roles_options" AS ENUM ('R001', 'R002', 'R003', 'R004');

-- CreateEnum
CREATE TYPE "type_of_person" AS ENUM ('NATURAL', 'JURIDIC');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PAID', 'UNPAID', 'INCOMPLETE');

-- CreateTable
CREATE TABLE "banks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" INTEGER NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_product" (
    "id" SERIAL NOT NULL,
    "bank_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "apiUrl" TEXT,
    "apiKey" TEXT,
    "apiSecret" TEXT,

    CONSTRAINT "bank_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_product_configuration" (
    "id" SERIAL NOT NULL,
    "bank_product_id" INTEGER NOT NULL,
    "interest_rate" DOUBLE PRECISION NOT NULL,
    "transaction_fee" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "bank_product_configuration_pkey" PRIMARY KEY ("id")
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
    "bank_reference" TEXT NOT NULL,
    "ammount_ves" DOUBLE PRECISION NOT NULL,
    "ammount_usd" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "payment_status" "payment_status" NOT NULL,
    "client_profile_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
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
    "connection_params" TEXT NOT NULL,
    "service_rate" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "custom_settings" JSONB,

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
    "is_authenticated" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_profile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "isp_id" INTEGER,
    "department" TEXT,
    "access_level" INTEGER,
    "dni" INTEGER NOT NULL,

    CONSTRAINT "admin_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profile" (
    "id" SERIAL NOT NULL,
    "network_manager_user_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "isp_id" INTEGER,
    "name" TEXT,
    "dni" INTEGER,
    "phone" INTEGER,
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
CREATE UNIQUE INDEX "admin_profile_dni_key" ON "admin_profile"("dni");

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
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bank_product_id_fkey" FOREIGN KEY ("bank_product_id") REFERENCES "bank_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_dolar_rate_id_fkey" FOREIGN KEY ("dolar_rate_id") REFERENCES "dolar_rate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "client_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "isp" ADD CONSTRAINT "isp_network_manager_id_fkey" FOREIGN KEY ("network_manager_id") REFERENCES "network_manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "isp_configuration" ADD CONSTRAINT "isp_configuration_isp_id_fkey" FOREIGN KEY ("isp_id") REFERENCES "isp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profile" ADD CONSTRAINT "admin_profile_isp_id_fkey" FOREIGN KEY ("isp_id") REFERENCES "isp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profile" ADD CONSTRAINT "admin_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_profile" ADD CONSTRAINT "client_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_profile" ADD CONSTRAINT "client_profile_isp_id_fkey" FOREIGN KEY ("isp_id") REFERENCES "isp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_configuration" ADD CONSTRAINT "client_configuration_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "client_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
