-- CreateTable
CREATE TABLE "OperatorNotice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperatorNotice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperatorNotice_displayOrder_idx" ON "OperatorNotice"("displayOrder");
