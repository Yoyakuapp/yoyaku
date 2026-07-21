-- AlterTable
ALTER TABLE "MenuCategory" ADD COLUMN "nameEn" TEXT;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN "adminLocale" TEXT NOT NULL DEFAULT 'ja';
