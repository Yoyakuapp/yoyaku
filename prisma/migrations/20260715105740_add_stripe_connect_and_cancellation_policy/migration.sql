-- AlterTable
ALTER TABLE "Store" ADD COLUMN "stripeAccountId" TEXT;
ALTER TABLE "Store" ADD COLUMN "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Store" ADD COLUMN "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Store" ADD COLUMN "stripeDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Store" ADD COLUMN "stripeOnboardingCompletedAt" TIMESTAMP(3);
ALTER TABLE "Store" ADD COLUMN "cancellationPolicy" JSONB;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "platformFeeAmount" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "paymentStripeAccountId" TEXT;

-- AlterTable
ALTER TABLE "BookingPaymentAttempt" ADD COLUMN "platformFeeAmount" INTEGER;
ALTER TABLE "BookingPaymentAttempt" ADD COLUMN "paymentStripeAccountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Store_stripeAccountId_key" ON "Store"("stripeAccountId");
