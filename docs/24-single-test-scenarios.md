# Yoyakus Single Test Scenarios

## Booking

- Normal reservation with active menu.
- Reservation outside business hours is rejected.
- Holiday reservation is rejected.
- Shift-outside reservation is rejected.
- Concurrent reservation for the same staff/time does not double-book.
- Store A bookings do not block Store B availability.
- Inactive menu reservation is rejected.
- Tampered duration or price does not affect server-side price.

## Payment

- PaymentIntent is created for DB-derived deposit.
- Payment success creates one confirmed booking.
- Payment failure marks payment attempt failed.
- Invalid webhook signature is rejected.
- Webhook replay does not create a duplicate booking.
- PaymentIntent amount mismatch is rejected.

## Lifecycle

- Confirmed booking can be completed.
- Completed booking cannot be cancelled.
- Confirmed booking can be cancelled.
- Refund before the 24-hour deadline succeeds.
- Double refund is rejected.
- Refund inside 24 hours is rejected.

## Admin Scope

- Unauthenticated admin API returns 401.
- Admin outside the store cannot access another store's data.
- Customer and sales screens show only the administrator's store data.
