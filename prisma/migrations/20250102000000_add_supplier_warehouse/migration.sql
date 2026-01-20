-- CreateTable
CREATE TABLE "SupplierLeatherWarehouse" (
    "id" TEXT NOT NULL,
    "warehouseName" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "location" TEXT,
    "region" TEXT,
    "lwgCertified" BOOLEAN NOT NULL DEFAULT false,
    "capacity" DECIMAL(65,30),
    "capacityUnit" TEXT,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierLeatherWarehouse_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "InwardGatePass" ADD COLUMN "warehouseId" TEXT,
ADD COLUMN "warehouseName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SupplierLeatherWarehouse_warehouseName_key" ON "SupplierLeatherWarehouse"("warehouseName");

-- CreateIndex
CREATE INDEX "SupplierLeatherWarehouse_supplierId_idx" ON "SupplierLeatherWarehouse"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierLeatherWarehouse_warehouseName_idx" ON "SupplierLeatherWarehouse"("warehouseName");

-- CreateIndex
CREATE INDEX "SupplierLeatherWarehouse_status_idx" ON "SupplierLeatherWarehouse"("status");

-- CreateIndex
CREATE INDEX "InwardGatePass_warehouseId_idx" ON "InwardGatePass"("warehouseId");

-- AddForeignKey
ALTER TABLE "InwardGatePass" ADD CONSTRAINT "InwardGatePass_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "SupplierLeatherWarehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

