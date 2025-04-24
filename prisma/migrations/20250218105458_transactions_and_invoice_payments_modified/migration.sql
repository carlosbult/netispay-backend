/*
  Warnings:

  - You are about to drop the column `admin_profile_id` on the `invoice_payments` table. All the data in the column will be lost.
  - You are about to drop the column `client_profile_id` on the `invoice_payments` table. All the data in the column will be lost.

*/
BEGIN;

-- Paso 1: Agregar nuevas columnas en transactions
ALTER TABLE "transactions" 
ADD COLUMN client_profile_id INT,
ADD COLUMN admin_profile_id INT;

-- Paso 2: Crear índices temporales en transactions
CREATE INDEX IF NOT EXISTS transactions_client_profile_id_temp_idx ON "transactions" (client_profile_id);
CREATE INDEX IF NOT EXISTS transactions_admin_profile_id_temp_idx ON "transactions" (admin_profile_id);

-- Paso 3: Migrar datos existentes desde invoice_payments
UPDATE transactions t
SET 
  client_profile_id = ip.client_profile_id,
  admin_profile_id = ip.admin_profile_id
FROM invoice_payments ip
WHERE t.id = ip.transaction_id
AND (ip.client_profile_id IS NOT NULL OR ip.admin_profile_id IS NOT NULL);

-- Paso 4: Eliminar restricciones y columnas en invoice_payments
ALTER TABLE "invoice_payments" 
  DROP CONSTRAINT IF EXISTS "invoice_payments_client_profile_id_fkey",
  DROP CONSTRAINT IF EXISTS "invoice_payments_admin_profile_id_fkey";

DROP INDEX IF EXISTS "invoice_payments_client_profile_id_idx";
DROP INDEX IF EXISTS "invoice_payments_admin_profile_id_idx";

ALTER TABLE "invoice_payments"
  DROP COLUMN IF EXISTS client_profile_id,
  DROP COLUMN IF EXISTS admin_profile_id;

-- Paso 5: Crear restricciones definitivas en transactions
CREATE INDEX "transactions_client_profile_id_idx" ON "transactions" (client_profile_id);
CREATE INDEX "transactions_admin_profile_id_idx" ON "transactions" (admin_profile_id);

ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_client_profile_id_fkey" 
  FOREIGN KEY (client_profile_id) REFERENCES client_profile(id) 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_admin_profile_id_fkey" 
  FOREIGN KEY (admin_profile_id) REFERENCES admin_profile(id) 
  ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
