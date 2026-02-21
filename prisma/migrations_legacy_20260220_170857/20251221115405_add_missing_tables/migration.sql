-- Create IncomingShipment table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'IncomingShipment') THEN
        CREATE TABLE "IncomingShipment" (
            "id" TEXT NOT NULL,
            "shipmentNumber" TEXT NOT NULL,
            "po_id" TEXT NOT NULL,
            "warehouse_id" TEXT,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "assignedAt" TIMESTAMP(3),
            "assignedBy" TEXT,
            "receivedAt" TIMESTAMP(3),
            "processedAt" TIMESTAMP(3),
            "notes" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "IncomingShipment_pkey" PRIMARY KEY ("id")
        );

        CREATE UNIQUE INDEX "IncomingShipment_shipmentNumber_key" ON "IncomingShipment"("shipmentNumber");
    END IF;
END $$;

-- Create IncomingShipmentLine table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'IncomingShipmentLine') THEN
        CREATE TABLE "IncomingShipmentLine" (
            "id" TEXT NOT NULL,
            "shipment_id" TEXT NOT NULL,
            "product_id" TEXT NOT NULL,
            "quantity_expected" INTEGER NOT NULL,
            "quantity_received" INTEGER NOT NULL DEFAULT 0,
            "quantity_accepted" INTEGER NOT NULL DEFAULT 0,
            "quantity_rejected" INTEGER NOT NULL DEFAULT 0,
            "unit_price" DECIMAL(15,2) NOT NULL,
            "notes" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "IncomingShipmentLine_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
