-- CreateEnum
CREATE TYPE "otp_method_type" AS ENUM ('SMS', 'APP', 'CALL', 'WHATSAPP', 'EMAIL', 'WEB');

-- CreateEnum
CREATE TYPE "otp_channel" AS ENUM ('SMS', 'APP', 'CALL', 'WHATSAPP', 'EMAIL', 'WEB');

-- CreateTable
CREATE TABLE "otp_guide" (
    "id" SERIAL NOT NULL,
    "bank_id" INTEGER NOT NULL,
    "method_type" "otp_method_type" NOT NULL,
    "channel" "otp_channel" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "example_image" TEXT,
    "help_contact" TEXT NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "version" TEXT NOT NULL,

    CONSTRAINT "otp_guide_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "otp_guide" ADD CONSTRAINT "otp_guide_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
