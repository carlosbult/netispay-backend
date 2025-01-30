/*
  Warnings:

  - You are about to drop the column `include_igtf` on the `isp_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `include_iva_usd` on the `isp_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `include_iva_ves` on the `isp_configuration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "isp_configuration"
  RENAME COLUMN "include_igtf" TO "should_add_igtf";

ALTER TABLE "isp_configuration"
  RENAME COLUMN "include_iva_usd" TO "should_add_iva_usd";

ALTER TABLE "isp_configuration"
  RENAME COLUMN "include_iva_ves" TO "should_add_iva_ves";
