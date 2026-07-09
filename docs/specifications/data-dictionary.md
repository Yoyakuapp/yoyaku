# Data Dictionary

## Overview

This document defines the logical data dictionary for Yoyaku Version 1.0.

It provides the canonical definition of every entity, attribute, data type, constraint, and relationship used throughout the platform.

All implementation shall conform to this document.

---

# Naming Convention

## Tables

```text
snake_case
```

Example

```text
reservation_items
```

---

## Columns

```text
snake_case
```

Example

```text
reservation_date
```

---

## Primary Key

```text
id
```

UUID Version 7

---

## Foreign Keys

```text
{table}_id
```

Example

```text
store_id

customer_id

service_id
```

---

## Timestamp Fields

Every table shall include

```text
created_at

updated_at
```

Soft-delete tables shall additionally include

```text
deleted_at
```

---

# users

Purpose

Customer accounts

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | UUID | No | Primary Key |
| email | VARCHAR(255) | No | Login Email |
| password_hash | TEXT | Yes | Password Hash |
| first_name | VARCHAR(100) | No | Given Name |
| last_name | VARCHAR(100) | No | Family Name |
| phone | VARCHAR(30) | Yes | Mobile Phone |
| language | VARCHAR(10) | No | Language Code |
| timezone | VARCHAR(50) | No | Time Zone |
| avatar_url | TEXT | Yes | Profile Image |
| email_verified | BOOLEAN | No | Verification Status |
| created_at | TIMESTAMP | No | Creation Date |
| updated_at | TIMESTAMP | No | Update Date |
| deleted_at | TIMESTAMP | Yes | Soft Delete |

---

# stores

Purpose

Business information

| Column | Type |
|---------|------|
| id | UUID |
| name | VARCHAR(255) |
| description | TEXT |
| phone | VARCHAR(30) |
| email | VARCHAR(255) |
| website | TEXT |
| address | TEXT |
| postal_code | VARCHAR(20) |
| prefecture | VARCHAR(100) |
| city | VARCHAR(100) |
| latitude | DECIMAL |
| longitude | DECIMAL |
| status | VARCHAR(30) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP |

---

# staffs

Purpose

Store employees

| Column | Type |
|---------|------|
| id | UUID |
| store_id | UUID |
| name | VARCHAR(255) |
| email | VARCHAR(255) |
| phone | VARCHAR(30) |
| profile | TEXT |
| active | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP |

---

# services

Purpose

Bookable services

| Column | Type |
|---------|------|
| id | UUID |
| store_id | UUID |
| name | VARCHAR(255) |
| description | TEXT |
| duration | INTEGER |
| price | DECIMAL(10,2) |
| deposit | DECIMAL(10,2) |
| active | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP |

---

# reservations

Purpose

Reservation records

| Column | Type |
|---------|------|
| id | UUID |
| customer_id | UUID |
| store_id | UUID |
| service_id | UUID |
| staff_id | UUID |
| reservation_date | DATE |
| start_time | TIME |
| end_time | TIME |
| people | INTEGER |
| status | VARCHAR(30) |
| payment_status | VARCHAR(30) |
| notes | TEXT |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# payments

Purpose

Payment transactions

| Column | Type |
|---------|------|
| id | UUID |
| reservation_id | UUID |
| provider | VARCHAR(50) |
| provider_payment_id | VARCHAR(255) |
| amount | DECIMAL(10,2) |
| currency | VARCHAR(10) |
| status | VARCHAR(30) |
| paid_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# refunds

Purpose

Refund history

| Column | Type |
|---------|------|
| id | UUID |
| payment_id | UUID |
| amount | DECIMAL(10,2) |
| reason | TEXT |
| refunded_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

# business_hours

Purpose

Business operating hours

| Column | Type |
|---------|------|
| id | UUID |
| store_id | UUID |
| weekday | INTEGER |
| open_time | TIME |
| close_time | TIME |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# holidays

Purpose

Holiday settings

| Column | Type |
|---------|------|
| id | UUID |
| store_id | UUID |
| holiday_date | DATE |
| description | VARCHAR(255) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# notifications

Purpose

Notification history

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| type | VARCHAR(30) |
| title | VARCHAR(255) |
| body | TEXT |
| read | BOOLEAN |
| sent_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

# audit_logs

Purpose

Immutable audit trail

| Column | Type |
|---------|------|
| id | UUID |
| actor_id | UUID |
| entity | VARCHAR(100) |
| entity_id | UUID |
| action | VARCHAR(100) |
| ip_address | VARCHAR(50) |
| user_agent | TEXT |
| created_at | TIMESTAMP |

---

# Enumeration Values

## Reservation Status

```text
PENDING

CONFIRMED

COMPLETED

CANCELLED

NO_SHOW
```

---

## Payment Status

```text
PENDING

AUTHORIZED

PAID

FAILED

REFUNDED

PARTIALLY_REFUNDED
```

---

## Store Status

```text
ACTIVE

INACTIVE

SUSPENDED
```

---

## User Roles

```text
CUSTOMER

STAFF

STORE_OWNER

ADMIN

SUPER_ADMIN
```

---

# Relationships

```text
User (1)
    │
    ├──────────────┐
    ▼              ▼
Reservation     Notification

Store (1)
    │
    ├──────────────┬──────────────┐
    ▼              ▼              ▼
Staff        Service      Business Hours
    │              │
    └──────┬───────┘
           ▼
     Reservation
           │
           ▼
       Payment
           │
           ▼
         Refund
```

---

# Default Values

| Field | Default |
|--------|---------|
| active | true |
| people | 1 |
| email_verified | false |
| read | false |
| language | en |
| timezone | UTC |

---

# Constraints

- Email must be unique.
- UUID values shall be immutable.
- Foreign keys shall enforce referential integrity.
- Reservation end time must be greater than start time.
- Duration must be greater than zero.
- Price must not be negative.
- Deposit must not exceed price.

---

# Indexes

Primary indexes

```text
email

store_id

staff_id

service_id

reservation_date

payment_status
```

Composite indexes

```text
store_id + reservation_date

staff_id + reservation_date

reservation_date + start_time
```

---

# Data Dictionary Summary

This document provides the authoritative definition of all persistent data used by Yoyaku Version 1.0.

All database schema, Prisma models, API contracts, validation rules, and future migrations shall conform to the definitions contained in this Data Dictionary.
