# Yoyakus Single Completion Checklist

## Completion Conditions

- Admin account can be provisioned once with hidden password input.
- Admin pages and admin APIs require authentication.
- StoreMember limits operations to the administrator's store.
- Store, business hours, holidays, staff, shifts, menus, bookings, payments, cancellations, refunds, customers, and sales can be operated from the admin area.
- Booking price and deposit are resolved on the server from `ServiceMenu`.
- Stripe PaymentIntent amount matches the stored deposit before confirmation.
- Duplicate booking creation from the same PaymentIntent is prevented.

## Manual Stop Points

- Apply migrations to Neon.
- Enter the first administrator password.
- Configure Stripe webhook and keys.
- Configure Vercel environment variables.
- Configure an email provider before enabling real email delivery.

## Deferred After Single Launch

- Customer self-cancellation with secure reservation token.
- Coupons, reviews, FAQ, advanced analytics, advanced image management, and advanced notification settings.
- Group, Network, and Platform features.
