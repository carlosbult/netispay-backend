/*
  Warnings:

  - You are about to drop the column `amount_used_usd` on the `balance_movement` table. All the data in the column will be lost.
  - You are about to drop the column `amount_used_ves` on the `balance_movement` table. All the data in the column will be lost.
  - You are about to drop the column `remaining_balance_usd` on the `balance_movement` table. All the data in the column will be lost.
  - You are about to drop the column `remaining_balance_ves` on the `balance_movement` table. All the data in the column will be lost.
  - You are about to drop the column `current_amount_usd` on the `client_balance` table. All the data in the column will be lost.
  - You are about to drop the column `current_amount_ves` on the `client_balance` table. All the data in the column will be lost.
  - You are about to drop the column `initial_amount_usd` on the `client_balance` table. All the data in the column will be lost.
  - You are about to drop the column `initial_amount_ves` on the `client_balance` table. All the data in the column will be lost.
  - Added the required column `amount_used` to the `balance_movement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remaining_balance` to the `balance_movement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `current_amount` to the `client_balance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initial_amount` to the `client_balance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "balance_movement" DROP COLUMN "amount_used_usd",
DROP COLUMN "amount_used_ves",
DROP COLUMN "remaining_balance_usd",
DROP COLUMN "remaining_balance_ves",
ADD COLUMN     "amount_used" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "remaining_balance" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "client_balance" DROP COLUMN "current_amount_usd",
DROP COLUMN "current_amount_ves",
DROP COLUMN "initial_amount_usd",
DROP COLUMN "initial_amount_ves",
ADD COLUMN     "current_amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "initial_amount" DOUBLE PRECISION NOT NULL;
