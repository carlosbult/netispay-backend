
-- Eliminar restricción de clave foránea existente de forma segura
ALTER TABLE "invoice_payments" 
DROP CONSTRAINT IF EXISTS "invoice_payments_transactionsId_fkey";

-- Eliminar columna solo si existe y no tiene dependencias
ALTER TABLE "invoice_payments" 
DROP COLUMN IF EXISTS "transactionsId" CASCADE;

-- Asegurar que la nueva columna transaction_id tenga valores válidos
-- Paso 1: Crear columna temporal para validaciones
ALTER TABLE "invoice_payments" 
ADD COLUMN temp_transaction_id INT;

-- Paso 2: Copiar solo los valores válidos
UPDATE "invoice_payments" ip
SET temp_transaction_id = t.id
FROM transactions t
WHERE ip."transactionsId" = t.id;

-- Paso 3: Eliminar registros huérfanos (opcional, según requerimientos)
-- DELETE FROM "invoice_payments" WHERE "transactionsId" IS NOT NULL AND temp_transaction_id IS NULL;

-- Paso 4: Renombrar columna temporal a definitiva
ALTER TABLE "invoice_payments" 
RENAME COLUMN temp_transaction_id TO transaction_id;

-- Crear nueva restricción de clave foránea con verificación explícita
ALTER TABLE "invoice_payments" 
ADD CONSTRAINT "invoice_payments_transaction_id_fkey" 
FOREIGN KEY ("transaction_id") 
REFERENCES "transactions"("id") 
ON DELETE RESTRICT 
ON UPDATE CASCADE 
DEFERRABLE INITIALLY DEFERRED;
