-- CreateTable
CREATE TABLE "SalesQuotation" (
    "id" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "validityDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerCompanyName" TEXT,
    "termsAndConditions" TEXT,
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "freightCharges" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "finalNetPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesQuotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesQuotationItem" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "exFactoryPrice" DECIMAL(65,30) NOT NULL,
    "taxCharges" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "freightCharges" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "finalNetPrice" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesQuotationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesQuotationApproval" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesQuotationApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesQuotation_quotationNumber_key" ON "SalesQuotation"("quotationNumber");

-- AddForeignKey
ALTER TABLE "SalesQuotation" ADD CONSTRAINT "SalesQuotation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesQuotation" ADD CONSTRAINT "SalesQuotation_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesQuotationItem" ADD CONSTRAINT "SalesQuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "SalesQuotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesQuotationApproval" ADD CONSTRAINT "SalesQuotationApproval_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "SalesQuotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesQuotationApproval" ADD CONSTRAINT "SalesQuotationApproval_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
