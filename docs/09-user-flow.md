# User Flow

## Overview

This document defines the standard user flows for Yoyaku Version 1.0.

The objective is to minimize the number of steps required to complete a reservation while maintaining clarity, accuracy, and security.

Every workflow should prioritize speed, simplicity, and consistency.

---

# Customer User Flow

```text
Launch Application
        │
        ▼
Search Reservation
        │
        ▼
Search Result
        │
        ▼
Select Store
        │
        ▼
Select Service
        │
        ▼
Select Staff (Optional)
        │
        ▼
Confirm Reservation Details
        │
        ▼
Login / Register (if required)
        │
        ▼
Payment (if required)
        │
        ▼
Reservation Completed
        │
        ▼
Confirmation Screen
```

---

# Reservation Search Flow

Customer opens application.

↓

Select:

- Date
- Time
- Duration
- Number of People
- Area
- Service

↓

Tap **Search**

↓

System searches available reservations.

↓

Display only available reservation slots.

↓

Customer selects preferred reservation.

---

# Reservation Flow

Customer selects:

- Store
- Service
- Staff (optional)

↓

System calculates reservation availability.

↓

Display reservation summary.

↓

Customer confirms reservation.

↓

Payment (if required).

↓

Reservation created.

↓

Confirmation notification sent.

---

# Login Flow

```text
Open Login Screen
        │
        ▼
Select Login Method
        │
        ├── Email
        ├── Google
        └── Apple
        │
        ▼
Authentication
        │
        ▼
Login Success
        │
        ▼
Return Previous Screen
```

---

# Registration Flow

Customer selects Create Account.

↓

Enter required information.

↓

Verify email.

↓

Account created.

↓

Automatically sign in.

↓

Return to reservation.

---

# Payment Flow

```text
Reservation Confirmed
        │
        ▼
Payment Required?
        │
   ┌────┴─────┐
   │          │
 No         Yes
   │          │
   ▼          ▼
Complete   Stripe Checkout
              │
              ▼
      Payment Success
              │
              ▼
 Reservation Completed
```

---

# Cancellation Flow

Customer opens reservation history.

↓

Select reservation.

↓

Tap Cancel Reservation.

↓

System validates cancellation policy.

↓

Display cancellation fee (if applicable).

↓

Customer confirms.

↓

Reservation cancelled.

↓

Notification sent.

---

# Store Owner Flow

```text
Login
   │
   ▼
Dashboard
   │
   ├── Reservations
   ├── Staff
   ├── Services
   ├── Customers
   ├── Reports
   └── Settings
```

---

# Staff Flow

Staff logs in.

↓

View today's schedule.

↓

Open reservation.

↓

Check customer information.

↓

Complete service.

↓

Mark reservation completed.

---

# Administrator Flow

Administrator logs in.

↓

View system dashboard.

↓

Monitor:

- Users
- Stores
- Reservations
- Payments
- Logs
- Errors
- Monitoring

↓

Perform required administrative actions.

---

# Error Flow

If validation fails:

↓

Display clear error message.

↓

Highlight incorrect field.

↓

Allow immediate correction.

↓

Maintain entered information whenever possible.

---

# Session Timeout Flow

User inactive.

↓

Session expires.

↓

Redirect to Login.

↓

After authentication, return user to previous screen whenever possible.

---

# Notification Flow

Events triggering notifications:

- Reservation Created
- Reservation Updated
- Reservation Cancelled
- Payment Completed
- Payment Failed
- Reminder Before Reservation

Notification channels:

- Email
- Push Notification

Future:

- SMS

---

# Reservation Status Flow

```text
Available
    │
    ▼
Reserved
    │
    ▼
Confirmed
    │
    ├────────────┐
    ▼            ▼
Completed    Cancelled
                 │
                 ▼
             Refunded
```

---

# Search Flow

Search Conditions

↓

Availability Calculation

↓

Business Hour Validation

↓

Holiday Validation

↓

Staff Availability Validation

↓

Reservation Conflict Check

↓

Display Available Slots

---

# User Experience Principles

Every workflow should:

- Minimize user input.
- Reduce navigation depth.
- Provide immediate feedback.
- Prevent user errors.
- Display only relevant information.
- Complete common tasks in as few steps as possible.

---

# User Flow Summary

These workflows define the expected behavior of Yoyaku Version 1.0.

Future features should extend these flows while preserving the platform's core philosophy:

**Book in Seconds.**
