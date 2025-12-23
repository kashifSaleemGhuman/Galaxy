-- CreateTable
CREATE TABLE "InwardGatePass" (
    "id" TEXT NOT NULL,
    "igpNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "region" TEXT,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "truckLoadNumber" TEXT,
    "batchNumber" TEXT,
    "lwgCertified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InwardGatePass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawBatch" (
    "id" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "igpId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "region" TEXT,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    "quantity" DECIMAL(65,30),
    "unit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WetBlueBatch" (
    "id" TEXT NOT NULL,
    "wbCode" TEXT NOT NULL,
    "rawBatchId" TEXT NOT NULL,
    "rawBatchCode" TEXT NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    "quantity" DECIMAL(65,30),
    "unit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WetBlueBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeAssortment" (
    "id" TEXT NOT NULL,
    "wbBatchId" TEXT NOT NULL,
    "wbCode" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "gradeCategory" TEXT,
    "quantity" DECIMAL(65,30),
    "unit" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradeAssortment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReTanningBatch" (
    "id" TEXT NOT NULL,
    "rtCode" TEXT NOT NULL,
    "wbBatchId" TEXT NOT NULL,
    "wbCode" TEXT NOT NULL,
    "rawBatchId" TEXT,
    "rawBatchCode" TEXT,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    "quantity" DECIMAL(65,30),
    "unit" TEXT,
    "recipe" TEXT,
    "technicianId" TEXT,
    "technicianName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReTanningBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinishedLeatherBatch" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "rtBatchId" TEXT NOT NULL,
    "rtCode" TEXT NOT NULL,
    "wbBatchId" TEXT,
    "wbCode" TEXT,
    "rawBatchId" TEXT,
    "rawBatchCode" TEXT,
    "completionDate" TIMESTAMP(3) NOT NULL,
    "quantity" DECIMAL(65,30),
    "unit" TEXT,
    "thickness" DECIMAL(65,30),
    "color" TEXT,
    "weight" DECIMAL(65,30),
    "pieces" INTEGER,
    "areaM2" DECIMAL(65,30),
    "customerOrderNumber" TEXT,
    "vendorCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinishedLeatherBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobCard" (
    "id" TEXT NOT NULL,
    "jobCardNumber" TEXT NOT NULL,
    "rawBatchId" TEXT,
    "wbBatchId" TEXT,
    "rtBatchId" TEXT,
    "finishedBatchId" TEXT,
    "recipe" TEXT,
    "technicianId" TEXT,
    "technicianName" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "month" INTEGER,
    "year" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchCard" (
    "id" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "rawBatchId" TEXT,
    "wbBatchId" TEXT,
    "rtBatchId" TEXT,
    "finishedBatchId" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionStage" (
    "id" TEXT NOT NULL,
    "stageName" TEXT NOT NULL,
    "stageType" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InwardGatePass_igpNumber_key" ON "InwardGatePass"("igpNumber");

-- CreateIndex
CREATE INDEX "InwardGatePass_supplierId_idx" ON "InwardGatePass"("supplierId");

-- CreateIndex
CREATE INDEX "InwardGatePass_igpNumber_idx" ON "InwardGatePass"("igpNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RawBatch_batchCode_key" ON "RawBatch"("batchCode");

-- CreateIndex
CREATE INDEX "RawBatch_batchCode_idx" ON "RawBatch"("batchCode");

-- CreateIndex
CREATE INDEX "RawBatch_igpId_idx" ON "RawBatch"("igpId");

-- CreateIndex
CREATE UNIQUE INDEX "WetBlueBatch_wbCode_key" ON "WetBlueBatch"("wbCode");

-- CreateIndex
CREATE INDEX "WetBlueBatch_wbCode_idx" ON "WetBlueBatch"("wbCode");

-- CreateIndex
CREATE INDEX "WetBlueBatch_rawBatchId_idx" ON "WetBlueBatch"("rawBatchId");

-- CreateIndex
CREATE INDEX "GradeAssortment_wbBatchId_idx" ON "GradeAssortment"("wbBatchId");

-- CreateIndex
CREATE INDEX "GradeAssortment_grade_idx" ON "GradeAssortment"("grade");

-- CreateIndex
CREATE UNIQUE INDEX "ReTanningBatch_rtCode_key" ON "ReTanningBatch"("rtCode");

-- CreateIndex
CREATE INDEX "ReTanningBatch_rtCode_idx" ON "ReTanningBatch"("rtCode");

-- CreateIndex
CREATE INDEX "ReTanningBatch_wbBatchId_idx" ON "ReTanningBatch"("wbBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "FinishedLeatherBatch_batchNumber_key" ON "FinishedLeatherBatch"("batchNumber");

-- CreateIndex
CREATE INDEX "FinishedLeatherBatch_batchNumber_idx" ON "FinishedLeatherBatch"("batchNumber");

-- CreateIndex
CREATE INDEX "FinishedLeatherBatch_rtBatchId_idx" ON "FinishedLeatherBatch"("rtBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "JobCard_jobCardNumber_key" ON "JobCard"("jobCardNumber");

-- CreateIndex
CREATE INDEX "JobCard_jobCardNumber_idx" ON "JobCard"("jobCardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BatchCard_cardNumber_key" ON "BatchCard"("cardNumber");

-- CreateIndex
CREATE INDEX "BatchCard_cardNumber_idx" ON "BatchCard"("cardNumber");

-- CreateIndex
CREATE INDEX "BatchCard_stage_idx" ON "BatchCard"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionStage_stageName_key" ON "ProductionStage"("stageName");

-- CreateIndex
CREATE INDEX "ProductionStage_order_idx" ON "ProductionStage"("order");

-- AddForeignKey
ALTER TABLE "RawBatch" ADD CONSTRAINT "RawBatch_igpId_fkey" FOREIGN KEY ("igpId") REFERENCES "InwardGatePass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WetBlueBatch" ADD CONSTRAINT "WetBlueBatch_rawBatchId_fkey" FOREIGN KEY ("rawBatchId") REFERENCES "RawBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeAssortment" ADD CONSTRAINT "GradeAssortment_wbBatchId_fkey" FOREIGN KEY ("wbBatchId") REFERENCES "WetBlueBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReTanningBatch" ADD CONSTRAINT "ReTanningBatch_wbBatchId_fkey" FOREIGN KEY ("wbBatchId") REFERENCES "WetBlueBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedLeatherBatch" ADD CONSTRAINT "FinishedLeatherBatch_rtBatchId_fkey" FOREIGN KEY ("rtBatchId") REFERENCES "ReTanningBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_rawBatchId_fkey" FOREIGN KEY ("rawBatchId") REFERENCES "RawBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_wbBatchId_fkey" FOREIGN KEY ("wbBatchId") REFERENCES "WetBlueBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_rtBatchId_fkey" FOREIGN KEY ("rtBatchId") REFERENCES "ReTanningBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_finishedBatchId_fkey" FOREIGN KEY ("finishedBatchId") REFERENCES "FinishedLeatherBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchCard" ADD CONSTRAINT "BatchCard_rawBatchId_fkey" FOREIGN KEY ("rawBatchId") REFERENCES "RawBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchCard" ADD CONSTRAINT "BatchCard_wbBatchId_fkey" FOREIGN KEY ("wbBatchId") REFERENCES "WetBlueBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchCard" ADD CONSTRAINT "BatchCard_rtBatchId_fkey" FOREIGN KEY ("rtBatchId") REFERENCES "ReTanningBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchCard" ADD CONSTRAINT "BatchCard_finishedBatchId_fkey" FOREIGN KEY ("finishedBatchId") REFERENCES "FinishedLeatherBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

