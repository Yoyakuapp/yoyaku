-- CreateEnum
CREATE TYPE "StoreApplicationStatus" AS ENUM ('ISSUED', 'REJECTED');

-- CreateTable
CREATE TABLE "StoreApplication" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "ipAddress" TEXT,
    "status" "StoreApplicationStatus" NOT NULL,
    "inviteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetRequestLog" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetRequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreApplication_email_createdAt_idx" ON "StoreApplication"("email", "createdAt");

-- CreateIndex
CREATE INDEX "StoreApplication_ipAddress_createdAt_idx" ON "StoreApplication"("ipAddress", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetRequestLog_email_createdAt_idx" ON "PasswordResetRequestLog"("email", "createdAt");

-- CreateIndex
CREATE INDEX "PasswordResetRequestLog_ipAddress_createdAt_idx" ON "PasswordResetRequestLog"("ipAddress", "createdAt");
