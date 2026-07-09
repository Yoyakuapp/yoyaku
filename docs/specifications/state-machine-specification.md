# State Machine Specification

## Overview

This document defines the state machines for Yoyaku Version 1.0.

State machines describe the valid lifecycle states and transitions for reservations, payments, refunds, cancellations, users, stores, staff, services, notifications, and administrative incidents.

All state transitions shall be enforced on the server side.

---

# State Machine Principles

Every state machine shall satisfy the following principles.

- Valid transitions only.
- Server-side enforcement.
- Immutable audit logging.
- No silent state changes.
- Idempotent transition handling.
- Clear error response for invalid transitions.
- Transactional consistency.

---

# Reservation State Machine

## Reservation States

```text
PENDING

CONFIRMED

COMPLETED

CANCELLED

NO_SHOW
```

---

## Reservation State Diagram

```mermaid
stateDiagram-v2
    [*] --> PENDING

    PENDING --> CONFIRMED : payment_success / confirmation
    PENDING --> CANCELLED : customer_cancel / timeout / admin_cancel

    CONFIRMED --> COMPLETED : service_completed
    CONFIRMED --> CANCELLED : customer_cancel / store_cancel / admin_cancel
    CONFIRMED --> NO_SHOW : mark_no_show

    COMPLETED --> [*]
    CANCELLED --> [*]
    NO_SHOW --> [*]
```

---

## Reservation Transition Table

| Current State | Event | Next State | Allowed Actor |
|---------------|-------|------------|---------------|
| PENDING | payment_success | CONFIRMED | System |
| PENDING | confirmation | CONFIRMED | System |
| PENDING | customer_cancel | CANCELLED | Customer |
| PENDING | timeout | CANCELLED | System |
| PENDING | admin_cancel | CANCELLED | Administrator |
| CONFIRMED | service_completed | COMPLETED | Staff / Store Owner |
| CONFIRMED | customer_cancel | CANCELLED | Customer |
| CONFIRMED | store_cancel | CANCELLED | Store Owner |
| CONFIRMED | admin_cancel | CANCELLED | Administrator |
| CONFIRMED | mark_no_show | NO_SHOW | Staff / Store Owner |
| COMPLETED | any | invalid | None |
| CANCELLED | any | invalid | None |
| NO_SHOW | any | invalid | None |

---

## Reservation Invalid Transitions

The following transitions are invalid.

- COMPLETED to CANCELLED
- CANCELLED to CONFIRMED
- CANCELLED to COMPLETED
- NO_SHOW to COMPLETED
- NO_SHOW to CANCELLED
- CONFIRMED to PENDING

Invalid transitions shall return:

```text
INVALID_STATUS_TRANSITION
```

---

# Payment State Machine

## Payment States

```text
PENDING

AUTHORIZED

PAID

FAILED

CANCELLED

REFUNDED

PARTIALLY_REFUNDED
```

---

## Payment State Diagram

```mermaid
stateDiagram-v2
    [*] --> PENDING

    PENDING --> AUTHORIZED : authorization_success
    PENDING --> PAID : payment_success
    PENDING --> FAILED : payment_failed
    PENDING --> CANCELLED : payment_cancelled

    AUTHORIZED --> PAID : capture_success
    AUTHORIZED --> CANCELLED : authorization_cancelled
    AUTHORIZED --> FAILED : capture_failed

    PAID --> PARTIALLY_REFUNDED : partial_refund
    PAID --> REFUNDED : full_refund

    PARTIALLY_REFUNDED --> REFUNDED : remaining_refund

    FAILED --> [*]
    CANCELLED --> [*]
    REFUNDED --> [*]
```

---

## Payment Transition Table

| Current State | Event | Next State | Allowed Actor |
|---------------|-------|------------|---------------|
| PENDING | authorization_success | AUTHORIZED | Payment Provider |
| PENDING | payment_success | PAID | Payment Provider |
| PENDING | payment_failed | FAILED | Payment Provider |
| PENDING | payment_cancelled | CANCELLED | Customer / Provider |
| AUTHORIZED | capture_success | PAID | Payment Provider |
| AUTHORIZED | authorization_cancelled | CANCELLED | Payment Provider |
| AUTHORIZED | capture_failed | FAILED | Payment Provider |
| PAID | partial_refund | PARTIALLY_REFUNDED | System / Administrator |
| PAID | full_refund | REFUNDED | System / Administrator |
| PARTIALLY_REFUNDED | remaining_refund | REFUNDED | System / Administrator |

---

# Refund State Machine

## Refund States

```text
REQUESTED

PROCESSING

SUCCEEDED

FAILED

CANCELLED
```

---

## Refund State Diagram

```mermaid
stateDiagram-v2
    [*] --> REQUESTED

    REQUESTED --> PROCESSING : provider_request_created
    REQUESTED --> CANCELLED : refund_cancelled

    PROCESSING --> SUCCEEDED : provider_refund_success
    PROCESSING --> FAILED : provider_refund_failed

    FAILED --> PROCESSING : retry_refund

    SUCCEEDED --> [*]
    CANCELLED --> [*]
```

---

## Refund Transition Table

| Current State | Event | Next State | Allowed Actor |
|---------------|-------|------------|---------------|
| REQUESTED | provider_request_created | PROCESSING | System |
| REQUESTED | refund_cancelled | CANCELLED | Administrator |
| PROCESSING | provider_refund_success | SUCCEEDED | Payment Provider |
| PROCESSING | provider_refund_failed | FAILED | Payment Provider |
| FAILED | retry_refund | PROCESSING | Administrator |

---

# Cancellation State Machine

## Cancellation States

```text
REQUESTED

POLICY_CHECKED

FEE_CALCULATED

CONFIRMED

COMPLETED

FAILED
```

---

## Cancellation State Diagram

```mermaid
stateDiagram-v2
    [*] --> REQUESTED

    REQUESTED --> POLICY_CHECKED : validate_policy
    POLICY_CHECKED --> FEE_CALCULATED : calculate_fee
    FEE_CALCULATED --> CONFIRMED : user_confirm
    CONFIRMED --> COMPLETED : cancel_reservation_success
    CONFIRMED --> FAILED : cancellation_failed

    FAILED --> REQUESTED : retry

    COMPLETED --> [*]
```

---

# User Account State Machine

## User States

```text
REGISTERED

EMAIL_VERIFICATION_PENDING

ACTIVE

SUSPENDED

DELETED
```

---

## User State Diagram

```mermaid
stateDiagram-v2
    [*] --> REGISTERED

    REGISTERED --> EMAIL_VERIFICATION_PENDING : verification_required
    REGISTERED --> ACTIVE : verification_not_required

    EMAIL_VERIFICATION_PENDING --> ACTIVE : email_verified
    EMAIL_VERIFICATION_PENDING --> DELETED : account_delete

    ACTIVE --> SUSPENDED : admin_suspend
    ACTIVE --> DELETED : account_delete

    SUSPENDED --> ACTIVE : admin_restore
    SUSPENDED --> DELETED : admin_delete

    DELETED --> [*]
```

---

# Store State Machine

## Store States

```text
DRAFT

PENDING_APPROVAL

ACTIVE

INACTIVE

SUSPENDED

DELETED
```

---

## Store State Diagram

```mermaid
stateDiagram-v2
    [*] --> DRAFT

    DRAFT --> PENDING_APPROVAL : submit_for_review
    PENDING_APPROVAL --> ACTIVE : approve
    PENDING_APPROVAL --> DRAFT : reject

    ACTIVE --> INACTIVE : owner_deactivate
    ACTIVE --> SUSPENDED : admin_suspend
    ACTIVE --> DELETED : delete_store

    INACTIVE --> ACTIVE : owner_reactivate
    INACTIVE --> DELETED : delete_store

    SUSPENDED --> ACTIVE : admin_restore
    SUSPENDED --> DELETED : admin_delete

    DELETED --> [*]
```

---

# Staff State Machine

## Staff States

```text
ACTIVE

INACTIVE

DELETED
```

---

## Staff State Diagram

```mermaid
stateDiagram-v2
    [*] --> ACTIVE

    ACTIVE --> INACTIVE : deactivate
    INACTIVE --> ACTIVE : reactivate

    ACTIVE --> DELETED : delete
    INACTIVE --> DELETED : delete

    DELETED --> [*]
```

---

# Service State Machine

## Service States

```text
ACTIVE

INACTIVE

ARCHIVED

DELETED
```

---

## Service State Diagram

```mermaid
stateDiagram-v2
    [*] --> ACTIVE

    ACTIVE --> INACTIVE : deactivate
    INACTIVE --> ACTIVE : reactivate

    ACTIVE --> ARCHIVED : archive
    INACTIVE --> ARCHIVED : archive

    ARCHIVED --> ACTIVE : restore

    ACTIVE --> DELETED : delete
    INACTIVE --> DELETED : delete
    ARCHIVED --> DELETED : delete

    DELETED --> [*]
```

---

# Notification State Machine

## Notification States

```text
PENDING

SENT

FAILED

READ

ARCHIVED
```

---

## Notification State Diagram

```mermaid
stateDiagram-v2
    [*] --> PENDING

    PENDING --> SENT : send_success
    PENDING --> FAILED : send_failed

    FAILED --> PENDING : retry

    SENT --> READ : user_read
    SENT --> ARCHIVED : archive

    READ --> ARCHIVED : archive

    ARCHIVED --> [*]
```

---

# Incident State Machine

## Incident States

```text
OPEN

INVESTIGATING

MITIGATED

RESOLVED

CLOSED
```

---

## Incident State Diagram

```mermaid
stateDiagram-v2
    [*] --> OPEN

    OPEN --> INVESTIGATING : assign
    INVESTIGATING --> MITIGATED : mitigation_applied
    MITIGATED --> RESOLVED : root_cause_fixed
    RESOLVED --> CLOSED : postmortem_complete

    INVESTIGATING --> RESOLVED : issue_fixed
    OPEN --> RESOLVED : false_alarm

    CLOSED --> [*]
```

---

# Transition Enforcement

All state transitions shall be enforced by:

- Domain service layer
- Server-side validation
- Database transaction
- Audit log creation

Client applications shall never directly set final states without server validation.

---

# Transition Audit Logging

Every state transition shall record:

- Entity Type
- Entity ID
- Previous State
- Next State
- Event
- Actor ID
- Timestamp
- Request ID
- IP Address

---

# Transition Error Response

Invalid transitions shall return:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "The requested state transition is not allowed."
  }
}
```

---

# Idempotency

The following transition events shall be idempotent.

- payment_success
- provider_refund_success
- reservation_confirmation
- notification_send_success
- cancellation_completed

Duplicate events shall not create duplicate records or inconsistent states.

---

# State Machine Testing

Every state machine shall include automated tests for:

- Valid transitions
- Invalid transitions
- Idempotent events
- Permission enforcement
- Audit log creation
- Transaction rollback

---

# State Machine Specification Summary

This document defines the valid lifecycle states and transitions for all major Yoyaku Version 1.0 entities.

All application logic, API endpoints, database updates, background jobs, administrative tools, and automated tests shall conform to these state machines.
