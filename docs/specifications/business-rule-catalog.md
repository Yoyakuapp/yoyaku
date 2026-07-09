# Business Rule Catalog

## Overview

This document defines the business rules governing Yoyaku Version 1.0.

Business rules describe the operational constraints that ensure reservation consistency, payment integrity, customer fairness, and platform reliability.

These rules are mandatory for every client, API, database operation, and administrative action.

---

# Rule Identification

Every business rule shall have:

- Rule ID
- Category
- Description
- Priority
- Enforcement Layer

Example

| Field | Value |
|--------|-------|
| Rule ID | BR-001 |
| Category | Reservation |
| Priority | Critical |
| Enforcement | Server |

---

# Reservation Rules

## BR-001

Reservation slots shall never overlap for the same staff member.

Priority

Critical

Enforcement

Server

---

## BR-002

Reservation slots shall exist only within business hours.

Priority

Critical

---

## BR-003

Reservations shall not be accepted on store holidays.

Priority

Critical

---

## BR-004

Only active services may be reserved.

Priority

Critical

---

## BR-005

Only active staff members may receive reservations.

Priority

Critical

---

## BR-006

Staff members may only receive reservations for assigned services.

Priority

Critical

---

## BR-007

Reservation duration shall equal the configured service duration unless explicitly overridden by business settings.

Priority

High

---

## BR-008

Reservation start time shall precede reservation end time.

Priority

Critical

---

## BR-009

Reservations in the past shall not be created.

Priority

Critical

---

## BR-010

Reservation capacity shall never exceed configured limits.

Priority

Critical

---

# Booking Rules

## BR-011

Every reservation shall belong to exactly one customer.

---

## BR-012

Every reservation shall belong to exactly one store.

---

## BR-013

Every reservation shall reference exactly one service.

---

## BR-014

Every reservation shall reference exactly one staff member.

---

## BR-015

Reservation confirmation shall occur only after all validation succeeds.

---

## BR-016

Reservation IDs shall be globally unique and immutable.

---

# Search Rules

## BR-017

Search results shall include only immediately bookable reservation slots.

---

## BR-018

Unavailable reservation slots shall never be displayed.

---

## BR-019

Search shall consider:

- Business Hours
- Holidays
- Staff Availability
- Existing Reservations
- Booking Window
- Capacity Rules

---

## BR-020

Search shall complete within target performance requirements whenever possible.

---

# Payment Rules

## BR-021

Payments shall never exceed the configured reservation amount.

---

## BR-022

Duplicate payment processing shall be prevented through idempotency.

---

## BR-023

Payment completion shall update reservation payment status immediately.

---

## BR-024

Card information shall never be stored by Yoyaku.

---

## BR-025

Refund amounts shall never exceed the paid amount.

---

## BR-026

Refund history shall remain immutable.

---

# Cancellation Rules

## BR-027

Cancellation policies shall be evaluated before cancellation is confirmed.

---

## BR-028

Cancellation fees shall be calculated automatically.

---

## BR-029

Cancelled reservations shall immediately release reservation availability.

---

## BR-030

Cancelled reservations shall remain available in reservation history.

---

# Customer Rules

## BR-031

Each email address may belong to only one customer account.

---

## BR-032

Email verification is required before full account activation.

---

## BR-033

Customers may edit only their own reservations.

---

## BR-034

Customers may cancel only their own reservations.

---

## BR-035

Customers may access only their own payment history.

---

# Store Rules

## BR-036

Store Owners may manage only their own stores.

---

## BR-037

Business hour changes shall immediately affect reservation availability.

---

## BR-038

Holiday changes shall immediately affect reservation search.

---

## BR-039

Inactive stores shall not appear in public search.

---

## BR-040

Deleted stores shall preserve historical reservations.

---

# Staff Rules

## BR-041

Staff members belong to exactly one store.

---

## BR-042

Inactive staff shall not receive new reservations.

---

## BR-043

Deleted staff shall remain referenced by historical reservations.

---

# Service Rules

## BR-044

Services belong to exactly one store.

---

## BR-045

Inactive services shall not appear in reservation search.

---

## BR-046

Service prices shall not be negative.

---

## BR-047

Deposit amounts shall not exceed service prices.

---

# Security Rules

## BR-048

Every protected request requires authentication.

---

## BR-049

Every authenticated request requires authorization.

---

## BR-050

All sensitive operations shall be logged.

---

## BR-051

Server-side validation is mandatory.

---

## BR-052

Client-side validation alone is insufficient.

---

## BR-053

Passwords shall never be stored in plain text.

---

## BR-054

HTTPS is mandatory for all production traffic.

---

# Administrative Rules

## BR-055

Administrative actions shall always generate audit logs.

---

## BR-056

Only Super Administrators may modify platform-wide configuration.

---

## BR-057

Administrative deletions shall follow configured retention policies.

---

# Audit Rules

## BR-058

Audit logs shall never be modified.

---

## BR-059

Audit logs shall never be deleted.

---

## BR-060

Audit logs shall record:

- Actor
- Action
- Entity
- Timestamp
- IP Address

---

# Notification Rules

## BR-061

Reservation creation shall generate customer notifications.

---

## BR-062

Reservation cancellation shall generate customer notifications.

---

## BR-063

Payment completion shall generate customer notifications.

---

## BR-064

Critical administrative events shall notify platform administrators.

---

# Performance Rules

## BR-065

Reservation search target response time:

```text
≤ 1 second
```

---

## BR-066

Reservation creation target:

```text
≤ 1 second
```

---

## BR-067

Authentication target:

```text
≤ 1 second
```

---

# Data Integrity Rules

## BR-068

Foreign key relationships shall remain valid.

---

## BR-069

Soft-deleted entities shall preserve historical references.

---

## BR-070

Database transactions shall satisfy ACID properties.

---

# Future Rules

Future versions may introduce additional business rules for:

- Marketplace
- Membership
- Loyalty
- Coupons
- AI Scheduling
- Dynamic Pricing
- Multi-brand Organizations
- Enterprise Administration

---

# Rule Priority

| Priority | Meaning |
|-----------|----------|
| Critical | Must never be violated |
| High | Strongly enforced |
| Medium | Operational requirement |
| Low | Recommended behavior |

---

# Enforcement Layer

| Layer | Responsibility |
|--------|----------------|
| Client | User experience only |
| API | Input validation |
| Service | Business rules |
| Database | Data integrity |
| Infrastructure | Availability and security |

---

# Business Rule Summary

This catalog defines the mandatory operational rules governing Yoyaku Version 1.0.

All application logic, APIs, database operations, administrative functions, automated tests, and future enhancements shall enforce these business rules consistently to preserve platform integrity, reliability, and security.
