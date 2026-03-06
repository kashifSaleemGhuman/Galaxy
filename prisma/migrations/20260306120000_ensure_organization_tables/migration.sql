-- Ensure organization-related tables exist (safe to run multiple times)
-- Fixes 500 errors when Organization, Document, OrganizationSupplier, OrganizationCustomer, Machine are missing

-- Organization
CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyLogo" TEXT,
    "shortName" TEXT,
    "address" TEXT,
    "factoryContactNo" TEXT,
    "email" TEXT,
    "fullAddress" TEXT,
    "auditDate" TIMESTAMP(3),
    "internalAuditorNames" JSONB DEFAULT '[]',
    "dataFrom" TIMESTAMP(3),
    "tenantId" TEXT,
    "siteNameLocalLanguage" TEXT,
    "siteURN" TEXT,
    "fullestScopeOfOperations" TEXT,
    "abbreviations" JSONB DEFAULT '[]',
    "companyRegistrationNumber" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "country" TEXT,
    "telephoneNumber" TEXT,
    "principalContactName" TEXT,
    "principalContactPosition" TEXT,
    "principalContactEmail" TEXT,
    "environmentalResponsibleName" TEXT,
    "environmentalResponsiblePosition" TEXT,
    "environmentalResponsibleEmail" TEXT,
    "lwgCommunicationsMembers" JSONB DEFAULT '[]',
    "website" TEXT,
    "facilityDescription" TEXT,
    "totalSiteArea" TEXT,
    "siteAreaBoundaries" TEXT,
    "directLabourShiftAM" INTEGER,
    "directLabourShiftPM" INTEGER,
    "directLabourShiftNight" INTEGER,
    "directLabourCount" INTEGER,
    "indirectLabourShiftAM" INTEGER,
    "indirectLabourShiftPM" INTEGER,
    "indirectLabourShiftNight" INTEGER,
    "indirectLabourCount" INTEGER,
    "shiftTotalAM" INTEGER,
    "shiftTotalPM" INTEGER,
    "shiftTotalNight" INTEGER,
    "shiftTotal" INTEGER,
    "workerDaysPerWeek" INTEGER,
    "workerWeeksPerYear" INTEGER,
    "workerDaysPerYear" INTEGER,
    "manufacturingDaysPerWeek" INTEGER,
    "manufacturingWeeksPerYear" INTEGER,
    "manufacturingDaysPerYear" INTEGER,
    "environmentalImpacts" TEXT,
    "operationsForOtherOrganisations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Document
CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "docNo" TEXT,
    "revDate" TEXT,
    "description" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Document_name_key" ON "Document"("name");

-- OrganizationSupplier
CREATE TABLE IF NOT EXISTS "OrganizationSupplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "registrationNo" TEXT,
    "taxId" TEXT,
    "taxNo" TEXT,
    "bankDetails" TEXT,
    "bankName" TEXT,
    "bankAddress" TEXT,
    "ibanNo" TEXT,
    "swiftCode" TEXT,
    "accountTitle" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationSupplier_pkey" PRIMARY KEY ("id")
);

-- OrganizationCustomer
CREATE TABLE IF NOT EXISTS "OrganizationCustomer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "registrationNo" TEXT,
    "taxId" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationCustomer_pkey" PRIMARY KEY ("id")
);

-- Machine
CREATE TABLE IF NOT EXISTS "Machine" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT,
    "machineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "motorDetails" TEXT,
    "powerRating" TEXT,
    "airPressure" TEXT,
    "modelNumber" TEXT,
    "manufacturingYear" TEXT,
    "length" TEXT,
    "width" TEXT,
    "height" TEXT,
    "steamTemp" TEXT,
    "steamConsumption" TEXT,
    "electricityRating" TEXT,
    "operationType" TEXT,
    "department" TEXT,
    "status" TEXT,
    "remarks" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Machine_machineId_key" ON "Machine"("machineId");
