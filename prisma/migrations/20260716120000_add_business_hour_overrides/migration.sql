-- CreateTable
CREATE TABLE "BusinessHourOverride" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessHourOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessHourOverride_storeId_date_key" ON "BusinessHourOverride"("storeId", "date");

-- CreateIndex
CREATE INDEX "BusinessHourOverride_storeId_date_idx" ON "BusinessHourOverride"("storeId", "date");

-- AddForeignKey
ALTER TABLE "BusinessHourOverride" ADD CONSTRAINT "BusinessHourOverride_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
