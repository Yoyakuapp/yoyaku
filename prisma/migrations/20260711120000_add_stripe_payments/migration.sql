CREATE TYPE "PaymentAttemptStatus" AS ENUM ('CREATED', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED');

ALTER TABLE "Booking"
ADD COLUMN "stripePaymentIntentId" TEXT,
ADD COLUMN "stripeRefundId" TEXT,
ADD COLUMN "refundedAt" TIMESTAMP(3);

CREATE TABLE "BookingPaymentAttempt" (
    "id" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "memo" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "people" INTEGER NOT NULL,
    "staff" TEXT NOT NULL,
    "menu" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "deposit" INTEGER NOT NULL,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'CREATED',
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingPaymentAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Booking_stripePaymentIntentId_key" ON "Booking"("stripePaymentIntentId");
CREATE UNIQUE INDEX "BookingPaymentAttempt_stripePaymentIntentId_key" ON "BookingPaymentAttempt"("stripePaymentIntentId");
CREATE UNIQUE INDEX "BookingPaymentAttempt_bookingId_key" ON "BookingPaymentAttempt"("bookingId");
CREATE INDEX "BookingPaymentAttempt_date_idx" ON "BookingPaymentAttempt"("date");
CREATE INDEX "BookingPaymentAttempt_status_idx" ON "BookingPaymentAttempt"("status");

ALTER TABLE "BookingPaymentAttempt"
ADD CONSTRAINT "BookingPaymentAttempt_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
