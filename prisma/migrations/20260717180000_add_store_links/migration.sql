-- CreateEnum
CREATE TYPE "StoreLinkType" AS ENUM ('SISTER', 'REGIONAL');

-- CreateEnum
CREATE TYPE "StoreLinkStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "StoreLink" (
    "id" TEXT NOT NULL,
    "type" "StoreLinkType" NOT NULL,
    "status" "StoreLinkStatus" NOT NULL DEFAULT 'PENDING',
    "requestingStoreId" TEXT NOT NULL,
    "targetStoreId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "storeNetworkEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreLink_requestingStoreId_targetStoreId_type_key" ON "StoreLink"("requestingStoreId", "targetStoreId", "type");

-- CreateIndex
CREATE INDEX "StoreLink_targetStoreId_status_idx" ON "StoreLink"("targetStoreId", "status");

-- CreateIndex
CREATE INDEX "StoreLink_requestingStoreId_status_idx" ON "StoreLink"("requestingStoreId", "status");

-- AddForeignKey
ALTER TABLE "StoreLink" ADD CONSTRAINT "StoreLink_requestingStoreId_fkey" FOREIGN KEY ("requestingStoreId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreLink" ADD CONSTRAINT "StoreLink_targetStoreId_fkey" FOREIGN KEY ("targetStoreId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
