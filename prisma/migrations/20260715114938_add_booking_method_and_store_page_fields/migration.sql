-- AlterTable
ALTER TABLE "Store" ADD COLUMN "requiresDeposit" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Store" ADD COLUMN "allowPhoneBooking" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Store" ADD COLUMN "allowWhatsappBooking" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Store" ADD COLUMN "allowYoyakuBooking" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Store" ADD COLUMN "whatsappNumber" TEXT;
ALTER TABLE "Store" ADD COLUMN "description" TEXT;
ALTER TABLE "Store" ADD COLUMN "imageUrl" TEXT;
