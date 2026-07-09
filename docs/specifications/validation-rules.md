# Validation Rules

## Overview

This document defines the validation rules for Yoyaku Version 1.0.

All user input, API requests, database mutations, reservation operations, payment operations, and administrative actions shall be validated on the server side.

Client-side validation may improve usability, but it shall never replace server-side validation.

---

# Validation Principles

All validation shall follow these principles.

- Server-side validation is mandatory.
- Client-side validation is supplementary.
- Validation errors must be clear.
- Invalid data must never be persisted.
- Business rules must be enforced consistently.
- Security-sensitive validation must never rely on the client.
- Validation rules must be testable.

---

# Common Validation Rules

## Required Fields

Required fields shall not be empty, null, undefined, or whitespace-only.

---

## String Length

All strings shall define minimum and maximum length.

Example:

| Field | Minimum | Maximum |
|-------|--------:|--------:|
| Name | 1 | 100 |
| Email | 5 | 255 |
| Phone | 8 | 30 |
| Description | 0 | 2000 |

---

## Email

Email addresses shall:

- Be required where specified.
- Follow valid email format.
- Be stored in lowercase.
- Be unique for user accounts.

Invalid examples:

```text
plainaddress

missing@

@example.com
```

---

## Phone Number

Phone numbers shall:

- Accept international format.
- Support country code.
- Remove unnecessary whitespace.
- Reject alphabetic characters.

Recommended format:

```text
+819012345678
```

---

## UUID

All entity identifiers shall be valid UUID values.

Invalid UUID values shall return:

```text
VALIDATION_ERROR
```

---

## Date

Dates shall use ISO 8601 format.

```text
YYYY-MM-DD
```

Example:

```text
2026-09-01
```

---

## Time

Times shall use 24-hour format.

```text
HH:mm
```

Example:

```text
14:30
```

---

## Timestamp

Timestamps shall use ISO 8601 format with timezone.

```text
2026-09-01T14:30:00Z
```

---

## Boolean

Boolean fields shall accept only:

```text
true

false
```

---

## Number

Numeric fields shall reject:

- NaN
- Infinity
- Negative values where not allowed
- Values outside configured range

---

# User Validation

## Registration

Required fields:

- firstName
- lastName
- email
- password
- phone

Rules:

- firstName must be 1–100 characters.
- lastName must be 1–100 characters.
- email must be valid and unique.
- password must satisfy password policy.
- phone must be valid.

---

## Password Policy

Password must contain:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

Password confirmation must match password.

---

## Login

Required fields:

- email
- password

Rules:

- email must be valid.
- password must not be empty.
- account must not be locked.
- email must be verified when verification is required.

---

## Profile Update

Allowed fields:

- firstName
- lastName
- phone
- language
- timezone
- avatarUrl

Rules:

- email changes require verification.
- phone must be valid.
- timezone must be supported.
- language must be supported.

---

# Store Validation

## Store Creation

Required fields:

- name
- email
- phone
- address

Rules:

- name must be 1–255 characters.
- email must be valid.
- phone must be valid.
- latitude and longitude must be valid if provided.
- status must be a valid store status.

---

## Store Status

Allowed values:

```text
ACTIVE

INACTIVE

SUSPENDED
```

---

## Business Hours

Rules:

- weekday must be between 0 and 6.
- openTime must be before closeTime.
- overlapping business periods are not allowed.
- closed days must not contain openTime or closeTime.
- business hours must belong to an existing store.

---

## Holidays

Rules:

- holidayDate must be a valid date.
- duplicate holiday dates for the same store are not allowed.
- description must not exceed 255 characters.

---

# Staff Validation

## Staff Creation

Required fields:

- storeId
- name

Rules:

- storeId must reference an existing store.
- name must be 1–255 characters.
- email must be valid if provided.
- phone must be valid if provided.
- staff must belong to one store.

---

## Staff Status

Rules:

- inactive staff shall not appear in reservation search.
- deleted staff shall remain referenced by historical reservations.

---

# Service Validation

## Service Creation

Required fields:

- storeId
- name
- duration
- price

Rules:

- storeId must reference an existing store.
- name must be 1–255 characters.
- duration must be greater than zero.
- duration must be expressed in minutes.
- price must be greater than or equal to zero.
- deposit must be greater than or equal to zero.
- deposit must not exceed price.
- service must belong to one store.

---

## Service Status

Rules:

- inactive services shall not appear in reservation search.
- deleted services shall remain referenced by historical reservations.

---

# Search Validation

Required fields:

- date
- duration
- people

Rules:

- date must be valid.
- date must not be in the past.
- duration must be positive.
- people must be at least 1.
- serviceId must reference an active service if provided.
- storeId must reference an active store if provided.
- staffId must reference active staff if provided.
- time must be valid if provided.

---

# Reservation Validation

## Reservation Creation

Required fields:

- customerId
- storeId
- serviceId
- staffId
- reservationDate
- startTime
- people

Rules:

- customer must exist.
- store must exist and be active.
- service must exist and be active.
- staff must exist and be active.
- staff must belong to the selected store.
- service must belong to the selected store.
- staff must be assigned to the selected service.
- reservationDate must not be in the past.
- startTime must be valid.
- endTime must be calculated from service duration.
- people must be at least 1.
- reservation must fit within business hours.
- reservation must not fall on a holiday.
- reservation must not conflict with existing reservations.
- reservation must satisfy minimum booking notice.
- reservation must satisfy maximum advance booking window.

---

## Reservation Update

Rules:

- reservation must exist.
- user must have permission.
- cancelled reservations cannot be modified.
- completed reservations cannot be modified.
- all availability checks must be repeated.
- updated reservation must not conflict with existing reservations.

---

## Reservation Cancellation

Rules:

- reservation must exist.
- reservation must not already be cancelled.
- reservation must be cancellable.
- user must have permission.
- cancellation deadline must be evaluated.
- cancellation fee must be calculated before confirmation.

---

# Reservation Status Validation

Allowed values:

```text
PENDING

CONFIRMED

COMPLETED

CANCELLED

NO_SHOW
```

Valid transitions:

| From | To |
|------|----|
| PENDING | CONFIRMED |
| PENDING | CANCELLED |
| CONFIRMED | COMPLETED |
| CONFIRMED | CANCELLED |
| CONFIRMED | NO_SHOW |

Invalid transitions shall return:

```text
INVALID_STATUS_TRANSITION
```

---

# Payment Validation

## Create Payment Intent

Required fields:

- reservationId
- amount
- currency

Rules:

- reservation must exist.
- reservation must be payable.
- amount must match reservation payment amount.
- currency must be supported.
- payment must not already be completed.
- idempotency key must be honored.

---

## Payment Status

Allowed values:

```text
PENDING

AUTHORIZED

PAID

FAILED

REFUNDED

PARTIALLY_REFUNDED
```

---

## Refund Validation

Required fields:

- paymentId
- amount
- reason

Rules:

- payment must exist.
- payment must be paid.
- amount must be greater than zero.
- refund amount must not exceed paid amount.
- cumulative refunds must not exceed paid amount.
- reason must be provided.

---

# Notification Validation

Rules:

- userId must reference an existing user.
- notification type must be valid.
- title must be 1–255 characters.
- body must not be empty.
- read must be boolean.

---

# Admin Validation

Administrative operations require:

- authenticated administrator
- sufficient role permission
- audit log creation
- server-side authorization

Super Administrator privileges are required for:

- platform configuration changes
- administrator role changes
- system-wide destructive actions

---

# File Upload Validation

Allowed image formats:

```text
jpg

jpeg

png

webp
```

Maximum file size:

```text
5MB
```

Rules:

- file type must be validated by MIME type.
- file extension alone is insufficient.
- uploaded file must be scanned where supported.
- file path must not be user-controlled.

---

# Error Response Format

Validation errors shall follow the standard error response.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "fields": {
      "email": "Invalid email format."
    }
  }
}
```

---

# Validation Error Codes

| Code | Meaning |
|------|---------|
| VALIDATION_ERROR | Generic validation failure |
| REQUIRED_FIELD_MISSING | Required field missing |
| INVALID_FORMAT | Invalid format |
| INVALID_EMAIL | Invalid email |
| INVALID_PHONE | Invalid phone |
| INVALID_UUID | Invalid UUID |
| INVALID_DATE | Invalid date |
| INVALID_TIME | Invalid time |
| INVALID_STATUS_TRANSITION | Invalid status transition |
| RESERVATION_CONFLICT | Reservation conflicts with existing booking |
| PAYMENT_AMOUNT_MISMATCH | Payment amount does not match |
| REFUND_AMOUNT_EXCEEDED | Refund exceeds paid amount |
| UNAUTHORIZED_OPERATION | User lacks permission |

---

# Validation Testing

Every validation rule shall have automated tests.

Required tests:

- Required field tests
- Invalid format tests
- Boundary value tests
- Authorization tests
- Business rule tests
- Conflict tests
- Status transition tests

---

# Validation Rules Summary

Validation protects the integrity, security, and reliability of the Yoyaku platform.

All validation shall be enforced on the server side, tested automatically, and applied consistently across APIs, database operations, user interfaces, and administrative workflows.
