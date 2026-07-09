# Cancellation Specification

## Overview

This document defines the cancellation process for Yoyaku Version 1.0.

The cancellation system allows customers and businesses to cancel reservations according to configurable cancellation policies while maintaining payment consistency, reservation integrity, and complete audit history.

---

# Objectives

The cancellation system shall:

- Allow reservation cancellation.
- Apply cancellation policies automatically.
- Calculate cancellation fees.
- Process refunds when applicable.
- Release reservation slots immediately.
- Notify all affected parties.
- Record complete cancellation history.

---

# Cancellation Flow

```text
Customer Opens Reservation
          │
          ▼
Select Cancel Reservation
          │
          ▼
Validate Cancellation Policy
          │
          ▼
Calculate Cancellation Fee
          │
          ▼
Display Confirmation
          │
          ▼
Customer Confirms
          │
          ▼
Cancel Reservation
          │
          ▼
Release Reservation Slot
          │
          ▼
Process Refund (if applicable)
          │
          ▼
Send Notifications
```

---

# Cancellation Eligibility

A reservation may be cancelled only if:

- Reservation exists.
- Reservation status allows cancellation.
- Cancellation deadline has not expired (if applicable).
- User has permission.
- Reservation has not already been cancelled.

---

# Cancellation Policy

Each store may configure its own cancellation policy.

Supported settings:

- Free cancellation
- Fixed cancellation fee
- Percentage cancellation fee
- Non-refundable

Examples:

- Free until 24 hours before reservation.
- 20% cancellation fee.
- 50% cancellation fee.
- 100% cancellation fee.
- No cancellation allowed.

---

# Cancellation Deadline

Businesses may configure:

- Anytime
- 72 hours before reservation
- 48 hours before reservation
- 24 hours before reservation
- 12 hours before reservation
- 6 hours before reservation
- 3 hours before reservation

---

# Cancellation Fee Calculation

Supported calculation methods:

## Fixed Amount

Example:

¥2,000

---

## Percentage

Example:

20%

50%

100%

---

## Free

No cancellation fee.

---

# Refund Processing

Refund amount is calculated as:

```text
Refund Amount

=

Paid Amount

−

Cancellation Fee
```

Refunds shall be processed automatically whenever possible.

---

# Reservation Status Transition

```text
Confirmed
      │
      ▼
Cancellation Requested
      │
      ▼
Cancelled
      │
      ▼
Refund Processing
      │
      ▼
Refund Completed
```

---

# Slot Release

Immediately after cancellation:

- Reservation slot becomes available.
- Staff schedule is updated.
- Store availability is recalculated.
- Search results are refreshed.

---

# Notifications

Customers receive:

- Cancellation Confirmation
- Refund Confirmation
- Cancellation Fee Summary

Businesses receive:

- Reservation Cancelled
- Refund Information
- Updated Schedule

Notification channels:

- Email
- Push Notification

Future:

- SMS

---

# Refund Rules

Refunds may be:

- Full
- Partial
- None

Refund calculation depends on:

- Cancellation timing
- Store policy
- Payment amount
- Deposit amount

---

# Cancellation History

Each cancellation shall record:

- Cancellation ID
- Reservation ID
- Customer ID
- Cancellation Reason
- Cancellation Fee
- Refund Amount
- Cancelled By
- Cancellation Timestamp

Records shall never be deleted.

---

# Cancellation Reasons

Customers may select:

- Schedule Conflict
- Feeling Unwell
- Found Another Time
- Booking Mistake
- Other

Businesses may additionally select:

- Store Closed
- Staff Unavailable
- Emergency
- System Error

---

# Administrative Cancellation

Administrators may cancel reservations.

Administrator cancellations require:

- Administrator ID
- Cancellation Reason
- Timestamp

---

# Error Handling

Cancellation shall fail when:

- Reservation not found.
- Reservation already cancelled.
- User unauthorized.
- Refund processing unavailable.
- Invalid reservation state.

Appropriate error messages shall be displayed.

---

# Security Requirements

Cancellation processing shall require:

- Authentication
- Authorization
- Server-side validation
- Transaction control
- Audit logging

All cancellation requests shall be validated before execution.

---

# Performance Requirements

| Operation | Target |
|-----------|--------|
| Cancellation Validation | ≤ 500 ms |
| Reservation Cancellation | ≤ 1 second |
| Refund Request | ≤ 2 seconds |

---

# Future Enhancements

Future versions may support:

- Waitlist promotion after cancellation
- Automatic rebooking suggestions
- AI cancellation prediction
- Flexible cancellation insurance
- Membership cancellation benefits

---

# Cancellation Specification Summary

The cancellation system provides configurable, secure, and transparent reservation cancellation while maintaining payment consistency, accurate availability, and complete audit history.

All cancellations must immediately synchronize reservation status, payment status, search availability, and customer notifications.
