/*
  Warnings:

  - You are about to drop the column `dni` on the `admin_profile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "admin_profile_dni_key";

-- AlterTable
ALTER TABLE "admin_profile" DROP COLUMN "dni",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" INTEGER;

-- AlterTable
ALTER TABLE "client_profile" ALTER COLUMN "phone" SET DATA TYPE BIGINT;

-- CreateTable
CREATE TABLE "admin_configuration" (
    "id" SERIAL NOT NULL,
    "admin_profile_id" INTEGER NOT NULL,
    "notification_preference" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "admin_configuration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "admin_configuration" ADD CONSTRAINT "admin_configuration_admin_profile_id_fkey" FOREIGN KEY ("admin_profile_id") REFERENCES "admin_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
