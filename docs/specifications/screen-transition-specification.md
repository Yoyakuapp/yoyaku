# Screen Transition Specification

## Overview

This document defines every screen transition within Yoyaku Version 1.0.

Each transition describes how users move through the application while maintaining the "Book in Seconds" philosophy.

All transitions shall be deterministic and predictable.

---

# Transition Principles

Every transition shall:

- Minimize user actions
- Preserve entered data
- Prevent unnecessary navigation
- Provide immediate feedback
- Support browser Back navigation
- Be mobile-first

---

# Customer Reservation Flow

```text
Home
 │
 ▼
Search Results
 │
 ▼
Store Detail
 │
 ▼
Service Detail
 │
 ▼
Reservation Detail
 │
 ▼
Login (if required)
 │
 ▼
Payment (if required)
 │
 ▼
Reservation Complete
```

---

# Authentication Flow

```text
Home
 │
 ▼
Login
 ├───────────────┐
 │               │
 ▼               ▼
Register     Password Reset
 │               │
 └──────┬────────┘
        ▼
     Login
        │
        ▼
Previous Screen
```

---

# Reservation Flow

| Current Screen | Action | Next Screen |
|---------------|--------|-------------|
| Home | Search | Search Results |
| Search Results | Select Store | Store Detail |
| Store Detail | Select Service | Service Detail |
| Service Detail | Select Time | Reservation Detail |
| Reservation Detail | Confirm | Login or Payment |
| Login | Success | Payment or Complete |
| Payment | Success | Reservation Complete |

---

# Payment Flow

```text
Reservation Detail
 │
 ▼
Stripe Checkout
 │
 ├─────────────┐
 │             │
 ▼             ▼
Success      Failure
 │             │
 ▼             ▼
Complete   Retry Payment
```

---

# Reservation Management Flow

```text
My Reservations
 │
 ▼
Reservation Detail
 │
 ├─────────────┐
 │             │
 ▼             ▼
Cancel     Rebook
 │             │
 ▼             ▼
Cancel Complete
```

---

# Store Management Flow

```text
Dashboard
 │
 ├────────────┬─────────────┬─────────────┐
 ▼            ▼             ▼             ▼
Reservations Services     Staff      Settings
 │            │             │             │
 ▼            ▼             ▼             ▼
Detail      Edit         Edit      Business Hours
```

---

# Administration Flow

```text
Admin Dashboard
 │
 ├────────────┬────────────┬────────────┬────────────┐
 ▼            ▼            ▼            ▼
Users      Stores     Payments    Monitoring
 │            │            │            │
 ▼            ▼            ▼            ▼
Detail      Detail     Detail     Incident
```

---

# Error Transitions

| Error | Destination |
|--------|-------------|
| Unauthorized | Login |
| Forbidden | Home |
| Not Found | Home |
| Payment Failed | Payment Retry |
| Session Expired | Login |
| Reservation Conflict | Search Results |

---

# Global Navigation

Customer Navigation

```text
Home

Search

Reservations

Account
```

Store Navigation

```text
Dashboard

Reservations

Services

Staff

Customers

Analytics

Settings
```

Administrator Navigation

```text
Dashboard

Users

Stores

Reservations

Payments

Logs

Monitoring
```

---

# Browser Navigation

The application shall support:

- Browser Back
- Browser Forward
- Deep Linking
- Page Refresh
- Bookmarkable URLs

---

# Protected Routes

Authentication required:

```text
/account/*
/payments/*
/store/*
/admin/*
```

Unauthenticated users shall be redirected to:

```text
/login
```

---

# Route Guards

Before entering protected screens, the system shall verify:

- Authentication
- Authorization
- Resource Availability
- Reservation Ownership
- Store Permission
- Administrator Role

---

# Transition Animations

Maximum animation duration:

```text
300ms
```

Animations shall never block interaction.

---

# Loading Transitions

During API requests the system shall display:

- Skeleton Screens
- Loading Indicators
- Disabled Primary Actions

---

# Session Timeout Transition

```text
Authenticated Screen
        │
Inactive Session
        │
        ▼
Login
        │
        ▼
Return Previous Screen
```

---

# Reservation State Transitions

```text
Available
    │
    ▼
Reserved
    │
    ▼
Confirmed
    │
 ┌──┴─────┐
 ▼        ▼
Completed Cancelled
             │
             ▼
         Refunded
```

---

# Screen Transition Rules

- One primary destination per action.
- No circular navigation without purpose.
- Preserve entered data whenever possible.
- Confirmation required before destructive actions.
- Successful operations always navigate to a success screen.
- Failed operations remain on the current screen with validation feedback.

---

# Screen Transition Summary

This specification defines all primary navigation paths for Yoyaku Version 1.0.

Every screen transition shall remain consistent, predictable, and optimized for the fastest possible reservation experience.
