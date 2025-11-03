-- Create Supplier table
CREATE TABLE IF NOT EXISTS "Supplier" (
  "supplierId" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "contactInfo" TEXT,
  "email" TEXT NOT NULL,
  "phone" TEXT
);

-- Create PurchaseOrder table
CREATE TABLE IF NOT EXISTS "PurchaseOrder" (
  "poId" TEXT PRIMARY KEY,
  "rfqId" TEXT,
  "supplierId" TEXT NOT NULL,
  "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'draft',
  CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("supplierId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create POLine table
CREATE TABLE IF NOT EXISTS "POLine" (
  "poLineId" TEXT PRIMARY KEY,
  "poId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantityOrdered" INTEGER NOT NULL,
  "quantityReceived" INTEGER NOT NULL DEFAULT 0,
  "price" DECIMAL(65,30) NOT NULL,
  CONSTRAINT "POLine_poId_fkey" FOREIGN KEY ("poId") REFERENCES "PurchaseOrder"("poId") ON DELETE RESTRICT ON UPDATE CASCADE
);
