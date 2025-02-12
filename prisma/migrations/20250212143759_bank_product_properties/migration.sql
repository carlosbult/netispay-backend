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

-- CreateIndex
CREATE UNIQUE INDEX "bank_product_properties_bank_product_id_property_key_key" ON "bank_product_properties"("bank_product_id", "property_key");

-- AddForeignKey
ALTER TABLE "bank_product_properties" ADD CONSTRAINT "bank_product_properties_bank_product_id_fkey" FOREIGN KEY ("bank_product_id") REFERENCES "bank_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
