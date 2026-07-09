# Database Design

## Overview

This document defines the logical database design for Yoyaku Version 1.0.

The database is designed using PostgreSQL with Prisma ORM and follows normalization principles while maintaining high performance for reservation searches and booking transactions.

The design supports future scalability, multi-store operation, and international expansion.

---

# Design Principles

The database shall satisfy the following principles:

- Data Integrity
- Referential Integrity
- ACID Transactions
- Normalization (3NF)
- High Performance
- Scalability
- Auditability
- Extensibility

---

# Database Engine

| Item | Value |
|------|-------|
| Database | PostgreSQL |
| ORM | Prisma |
| Character Set | UTF-8 |
| Time Zone | UTC |
| ID Type | UUID |

---

# Core Tables

Version 1.0 consists of the following primary entities.

| Table | Purpose |
|--------|---------|
| users | Customer accounts |
| stores | Store information |
| staffs | Staff members |
| services | Services offered |
| reservations | Reservation records |
| reservation_statuses | Reservation status master |
| payments | Payment transactions |
| refunds | Refund history |
| business_hours | Store business hours |
| holidays | Store holidays |
| notifications | Notification history |
| audit_logs | Audit trail |

---

# users

Stores customer account information.

Primary fields:

- id
- email
- password_hash
- first_name
- last_name
- phone
- language
- timezone
- created_at
- updated_at

---

# stores

Stores business information.

Primary fields:

- id
- name
- description
- phone
- email
- address
- latitude
- longitude
- status
- created_at
- updated_at

---

# staffs

Stores employee information.

Primary fields:

- id
- store_id
- name
- email
- phone
- status
- created_at
- updated_at

Relationship:

One Store

↓

Many Staff

---

# services

Stores reservation services.

Primary fields:

- id
- store_id
- name
- duration
- price
- deposit
- description
- active
- created_at
- updated_at

Relationship:

One Store

↓

Many Services

---

# reservations

Stores reservation information.

Primary fields:

- id
- customer_id
- store_id
- staff_id
- service_id
- reservation_date
- start_time
- end_time
- people
- status
- payment_status
- notes
- created_at
- updated_at

Relationship:

Customer

↓

Reservation

↓

Store

↓

Staff

↓

Service

---

# payments

Stores payment records.

Primary fields:

- id
- reservation_id
- stripe_payment_id
- amount
- currency
- status
- paid_at
- created_at
- updated_at

---

# refunds

Stores refund history.

Primary fields:

- id
- payment_id
- amount
- reason
- refunded_at

---

# business_hours

Stores business operating hours.

Primary fields:

- id
- store_id
- weekday
- open_time
- close_time

---

# holidays

Stores holidays.

Primary fields:

- id
- store_id
- holiday_date
- description

---

# notifications

Stores notification history.

Primary fields:

- id
- user_id
- type
- title
- body
- sent_at
- status

---

# audit_logs

Stores immutable audit records.

Primary fields:

- id
- actor_id
- action
- entity
- entity_id
- ip_address
- user_agent
- created_at

Audit records shall never be updated or deleted.

---

# Relationships

```text
Users
   │
   ├──────────────┐
   ▼              ▼
Reservations   Notifications
   │
   ▼
Stores
   │
   ├──────────────┐
   ▼              ▼
Staffs        Services
   │              │
   └──────┬───────┘
          ▼
Reservations
          │
          ▼
Payments
          │
          ▼
Refunds
```

---

# Indexes

Indexes shall exist on:

- email
- reservation_date
- start_time
- store_id
- staff_id
- service_id
- payment_status
- reservation_status

Composite indexes:

- store_id + reservation_date
- staff_id + reservation_date
- reservation_date + start_time

---

# Constraints

The database shall enforce:

- Primary Keys
- Foreign Keys
- Unique Email
- Non-null Required Fields
- Check Constraints
- Cascading Rules where appropriate

---

# Transactions

The following operations shall use database transactions:

- Reservation Creation
- Reservation Update
- Reservation Cancellation
- Payment Completion
- Refund Processing

All transactions shall satisfy ACID properties.

---

# Soft Delete

The following entities shall support soft deletion:

- Users
- Stores
- Staffs
- Services

Deleted records shall retain historical relationships.

---

# Backup Strategy

Database backups:

- Daily Full Backup
- Point-in-Time Recovery
- Encrypted Storage
- Automated Verification

---

# Future Tables

Future versions may introduce:

- coupons
- memberships
- loyalty_points
- waitlists
- reviews
- campaigns
- invoices
- subscriptions
- calendars
- ai_recommendations

---

# Database Design Summary

The database design provides a normalized, scalable, and transaction-safe foundation for Yoyaku Version 1.0.

The schema is optimized for high-speed reservation searches, reliable booking transactions, secure payment processing, and future platform expansion while preserving data integrity and auditability.
