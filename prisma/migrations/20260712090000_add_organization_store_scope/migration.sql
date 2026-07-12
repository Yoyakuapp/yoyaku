-- CreateEnum
CREATE TYPE "StoreMemberRole" AS ENUM ('PLATFORM_ADMIN', 'ORGANIZATION_ADMIN', 'STORE_MANAGER', 'STAFF');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'JP',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Tokyo',
    "currency" TEXT NOT NULL DEFAULT 'JPY',
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreMember" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "role" "StoreMemberRole" NOT NULL DEFAULT 'STORE_MANAGER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreMember_pkey" PRIMARY KEY ("id")
);

-- Seed default single-store scope.
INSERT INTO "Organization" ("id", "name", "createdAt", "updatedAt")
VALUES ('org_yoyakus_single_default', 'Yoyakus Demo Operations', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE
SET
    "name" = EXCLUDED."name",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Store" (
    "id",
    "organizationId",
    "name",
    "slug",
    "country",
    "timezone",
    "currency",
    "isActive",
    "isPublished",
    "createdAt",
    "updatedAt"
)
VALUES (
    'store_yoyakus_single_default',
    'org_yoyakus_single_default',
    'Sakura Relaxation Namba Demo',
    'sakura-relaxation-namba-demo',
    'JP',
    'Asia/Tokyo',
    'JPY',
    true,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO UPDATE
SET
    "organizationId" = EXCLUDED."organizationId",
    "name" = EXCLUDED."name",
    "slug" = EXCLUDED."slug",
    "country" = EXCLUDED."country",
    "timezone" = EXCLUDED."timezone",
    "currency" = EXCLUDED."currency",
    "isActive" = EXCLUDED."isActive",
    "isPublished" = EXCLUDED."isPublished",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Add storeId as nullable first so existing rows can be backfilled safely.
ALTER TABLE "Booking" ADD COLUMN "storeId" TEXT;
ALTER TABLE "BookingPaymentAttempt" ADD COLUMN "storeId" TEXT;
ALTER TABLE "Staff" ADD COLUMN "storeId" TEXT;
ALTER TABLE "BusinessHour" ADD COLUMN "storeId" TEXT;
ALTER TABLE "Holiday" ADD COLUMN "storeId" TEXT;

-- Backfill existing single-store data.
UPDATE "Booking"
SET "storeId" = 'store_yoyakus_single_default'
WHERE "storeId" IS NULL;

UPDATE "BookingPaymentAttempt"
SET "storeId" = 'store_yoyakus_single_default'
WHERE "storeId" IS NULL;

UPDATE "Staff"
SET "storeId" = 'store_yoyakus_single_default'
WHERE "storeId" IS NULL;

UPDATE "BusinessHour"
SET "storeId" = 'store_yoyakus_single_default'
WHERE "storeId" IS NULL;

UPDATE "Holiday"
SET "storeId" = 'store_yoyakus_single_default'
WHERE "storeId" IS NULL;

INSERT INTO "StoreMember" ("id", "adminUserId", "storeId", "role", "createdAt", "updatedAt")
SELECT
    'store_member_' || "id",
    "id",
    'store_yoyakus_single_default',
    'STORE_MANAGER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "AdminUser"
ON CONFLICT DO NOTHING;

-- Safety checks before making storeId required.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Booking" WHERE "storeId" IS NULL) THEN
        RAISE EXCEPTION 'Booking backfill failed: storeId is null';
    END IF;

    IF EXISTS (SELECT 1 FROM "BookingPaymentAttempt" WHERE "storeId" IS NULL) THEN
        RAISE EXCEPTION 'BookingPaymentAttempt backfill failed: storeId is null';
    END IF;

    IF EXISTS (SELECT 1 FROM "Staff" WHERE "storeId" IS NULL) THEN
        RAISE EXCEPTION 'Staff backfill failed: storeId is null';
    END IF;

    IF EXISTS (SELECT 1 FROM "BusinessHour" WHERE "storeId" IS NULL) THEN
        RAISE EXCEPTION 'BusinessHour backfill failed: storeId is null';
    END IF;

    IF EXISTS (SELECT 1 FROM "Holiday" WHERE "storeId" IS NULL) THEN
        RAISE EXCEPTION 'Holiday backfill failed: storeId is null';
    END IF;
END $$;

-- Make storeId required after successful backfill.
ALTER TABLE "Booking" ALTER COLUMN "storeId" SET NOT NULL;
ALTER TABLE "BookingPaymentAttempt" ALTER COLUMN "storeId" SET NOT NULL;
ALTER TABLE "Staff" ALTER COLUMN "storeId" SET NOT NULL;
ALTER TABLE "BusinessHour" ALTER COLUMN "storeId" SET NOT NULL;
ALTER TABLE "Holiday" ALTER COLUMN "storeId" SET NOT NULL;

-- Replace global uniqueness with store-scoped uniqueness.
DROP INDEX "BusinessHour_dayOfWeek_key";
DROP INDEX "Holiday_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");
CREATE INDEX "Store_organizationId_idx" ON "Store"("organizationId");
CREATE INDEX "Store_isActive_isPublished_idx" ON "Store"("isActive", "isPublished");
CREATE UNIQUE INDEX "StoreMember_adminUserId_storeId_key" ON "StoreMember"("adminUserId", "storeId");
CREATE INDEX "StoreMember_storeId_role_idx" ON "StoreMember"("storeId", "role");
CREATE INDEX "Booking_storeId_date_idx" ON "Booking"("storeId", "date");
CREATE INDEX "Booking_storeId_status_idx" ON "Booking"("storeId", "status");
CREATE INDEX "BookingPaymentAttempt_storeId_date_idx" ON "BookingPaymentAttempt"("storeId", "date");
CREATE INDEX "BookingPaymentAttempt_storeId_status_idx" ON "BookingPaymentAttempt"("storeId", "status");
CREATE INDEX "Staff_storeId_active_idx" ON "Staff"("storeId", "active");
CREATE UNIQUE INDEX "BusinessHour_storeId_dayOfWeek_key" ON "BusinessHour"("storeId", "dayOfWeek");
CREATE UNIQUE INDEX "Holiday_storeId_date_key" ON "Holiday"("storeId", "date");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoreMember" ADD CONSTRAINT "StoreMember_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoreMember" ADD CONSTRAINT "StoreMember_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BookingPaymentAttempt" ADD CONSTRAINT "BookingPaymentAttempt_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BusinessHour" ADD CONSTRAINT "BusinessHour_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Holiday" ADD CONSTRAINT "Holiday_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
