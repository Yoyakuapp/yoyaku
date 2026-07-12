-- CreateTable
CREATE TABLE "ServiceMenu" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "durationMinutes" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "depositAmount" INTEGER,
    "depositRate" INTEGER NOT NULL DEFAULT 15,
    "currency" TEXT NOT NULL DEFAULT 'JPY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceMenu_pkey" PRIMARY KEY ("id")
);

-- AddColumn
ALTER TABLE "Booking" ADD COLUMN "serviceMenuId" TEXT;
ALTER TABLE "BookingPaymentAttempt" ADD COLUMN "serviceMenuId" TEXT;

-- Seed default single-store service menus while preserving current duration/price behavior.
INSERT INTO "ServiceMenu" (
    "id",
    "storeId",
    "name",
    "description",
    "durationMinutes",
    "price",
    "depositRate",
    "currency",
    "isActive",
    "displayOrder",
    "createdAt",
    "updatedAt"
)
VALUES
    ('service_menu_single_30', 'store_yoyakus_single_default', 'タイ古式マッサージ 30分', '', 30, 4500, 15, 'JPY', true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('service_menu_single_60', 'store_yoyakus_single_default', 'タイ古式マッサージ 60分', '', 60, 9000, 15, 'JPY', true, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('service_menu_single_90', 'store_yoyakus_single_default', 'タイ古式マッサージ 90分', '', 90, 13500, 15, 'JPY', true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('service_menu_single_120', 'store_yoyakus_single_default', 'タイ古式マッサージ 120分', '', 120, 18000, 15, 'JPY', true, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE
SET
    "name" = EXCLUDED."name",
    "durationMinutes" = EXCLUDED."durationMinutes",
    "price" = EXCLUDED."price",
    "depositRate" = EXCLUDED."depositRate",
    "currency" = EXCLUDED."currency",
    "isActive" = EXCLUDED."isActive",
    "displayOrder" = EXCLUDED."displayOrder",
    "updatedAt" = CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "ServiceMenu_storeId_isActive_displayOrder_idx" ON "ServiceMenu"("storeId", "isActive", "displayOrder");
CREATE INDEX "Booking_storeId_serviceMenuId_idx" ON "Booking"("storeId", "serviceMenuId");
CREATE INDEX "BookingPaymentAttempt_storeId_serviceMenuId_idx" ON "BookingPaymentAttempt"("storeId", "serviceMenuId");

-- AddForeignKey
ALTER TABLE "ServiceMenu" ADD CONSTRAINT "ServiceMenu_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceMenuId_fkey" FOREIGN KEY ("serviceMenuId") REFERENCES "ServiceMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BookingPaymentAttempt" ADD CONSTRAINT "BookingPaymentAttempt_serviceMenuId_fkey" FOREIGN KEY ("serviceMenuId") REFERENCES "ServiceMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;
