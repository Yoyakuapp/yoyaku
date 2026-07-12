# Yoyakus Single Operations Guide

## Administrator Creation

After migrations are applied, run:

```bash
npm run admin:create
```

The command asks for Email, Name, Password, and Confirm password. Password input is hidden and only a bcrypt hash is stored.

## Store Initial Setup

1. Confirm the default store record.
2. Set business hours.
3. Add holidays.
4. Register staff.
5. Register shifts.
6. Register active service menus.

## Daily Operations

- Check bookings from the admin booking list.
- Confirm customer details only inside the authenticated admin area.
- Mark completed bookings as `COMPLETED`.
- Cancel eligible bookings from the admin area.
- Use refund only when the server allows it under the cancellation policy.
- Check customers and sales from the admin area.

## Incidents

- If payment succeeds but booking confirmation fails, inspect Stripe PaymentIntent and `BookingPaymentAttempt`.
- If webhook delivery fails, replay from Stripe Dashboard after webhook configuration is fixed.
- If the database has an incident, follow the backup and disaster recovery documents before changing data.
