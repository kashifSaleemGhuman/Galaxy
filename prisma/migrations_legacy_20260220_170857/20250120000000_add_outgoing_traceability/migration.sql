-- CreateTable
CREATE TABLE "MeasurementPacking" (
    "id" TEXT NOT NULL,
    "recordNumber" TEXT NOT NULL,
    "finishedBatchId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "rtCode" TEXT,
    "wbCode" TEXT,
    "rawBatchCode" TEXT,
    "measurementDate" TIMESTAMP(3) NOT NULL,
    "batchNumberMeas" TEXT,
    "customerOrderNumber" TEXT,
    "vendorCode" TEXT,
    "thickness" DECIMAL(65,30),
    "color" TEXT,
    "weight" DECIMAL(65,30),
    "pieces" INTEGER,
    "areaDm2" DECIMAL(65,30),
    "areaM2" DECIMAL(65,30),
    "packedDate" TIMESTAMP(3),
    "packingStatus" TEXT NOT NULL DEFAULT 'pending',
    "packingNotes" TEXT,
    "qcStatus" TEXT,
    "qcNotes" TEXT,
    "qcDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeasurementPacking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispatch" (
    "id" TEXT NOT NULL,
    "dispatchNumber" TEXT NOT NULL,
    "measurementPackingId" TEXT,
    "finishedBatchId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "rtCode" TEXT,
    "wbCode" TEXT,
    "rawBatchCode" TEXT,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerOrderNumber" TEXT,
    "vendorCode" TEXT,
    "dispatchDate" TIMESTAMP(3) NOT NULL,
    "dispatchType" TEXT,
    "vehicleNumber" TEXT,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "destination" TEXT,
    "deliveryAddress" TEXT,
    "quantity" DECIMAL(65,30),
    "unit" TEXT,
    "pieces" INTEGER,
    "areaM2" DECIMAL(65,30),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerDelivery" (
    "id" TEXT NOT NULL,
    "deliveryNumber" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "dispatchNumber" TEXT NOT NULL,
    "finishedBatchId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerOrderNumber" TEXT,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "deliveryStatus" TEXT NOT NULL DEFAULT 'pending',
    "receivedBy" TEXT,
    "receivedByPhone" TEXT,
    "deliveryNotes" TEXT,
    "qualityStatus" TEXT,
    "qualityNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeasurementPacking_recordNumber_key" ON "MeasurementPacking"("recordNumber");

-- CreateIndex
CREATE INDEX "MeasurementPacking_recordNumber_idx" ON "MeasurementPacking"("recordNumber");

-- CreateIndex
CREATE INDEX "MeasurementPacking_finishedBatchId_idx" ON "MeasurementPacking"("finishedBatchId");

-- CreateIndex
CREATE INDEX "MeasurementPacking_batchNumber_idx" ON "MeasurementPacking"("batchNumber");

-- CreateIndex
CREATE INDEX "MeasurementPacking_customerOrderNumber_idx" ON "MeasurementPacking"("customerOrderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Dispatch_dispatchNumber_key" ON "Dispatch"("dispatchNumber");

-- CreateIndex
CREATE INDEX "Dispatch_dispatchNumber_idx" ON "Dispatch"("dispatchNumber");

-- CreateIndex
CREATE INDEX "Dispatch_finishedBatchId_idx" ON "Dispatch"("finishedBatchId");

-- CreateIndex
CREATE INDEX "Dispatch_customerOrderNumber_idx" ON "Dispatch"("customerOrderNumber");

-- CreateIndex
CREATE INDEX "Dispatch_dispatchDate_idx" ON "Dispatch"("dispatchDate");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDelivery_deliveryNumber_key" ON "CustomerDelivery"("deliveryNumber");

-- CreateIndex
CREATE INDEX "CustomerDelivery_deliveryNumber_idx" ON "CustomerDelivery"("deliveryNumber");

-- CreateIndex
CREATE INDEX "CustomerDelivery_dispatchId_idx" ON "CustomerDelivery"("dispatchId");

-- CreateIndex
CREATE INDEX "CustomerDelivery_finishedBatchId_idx" ON "CustomerDelivery"("finishedBatchId");

-- CreateIndex
CREATE INDEX "CustomerDelivery_customerOrderNumber_idx" ON "CustomerDelivery"("customerOrderNumber");

-- AddForeignKey
ALTER TABLE "MeasurementPacking" ADD CONSTRAINT "MeasurementPacking_finishedBatchId_fkey" FOREIGN KEY ("finishedBatchId") REFERENCES "FinishedLeatherBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_measurementPackingId_fkey" FOREIGN KEY ("measurementPackingId") REFERENCES "MeasurementPacking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_finishedBatchId_fkey" FOREIGN KEY ("finishedBatchId") REFERENCES "FinishedLeatherBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDelivery" ADD CONSTRAINT "CustomerDelivery_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "Dispatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDelivery" ADD CONSTRAINT "CustomerDelivery_finishedBatchId_fkey" FOREIGN KEY ("finishedBatchId") REFERENCES "FinishedLeatherBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

