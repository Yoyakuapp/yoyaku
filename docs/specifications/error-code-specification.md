# Error Code Specification

## Overview

This document defines the standard error codes for Yoyaku Version 1.0.

All APIs, services, background jobs, and administrative tools shall use consistent error codes and response formats.

Error codes must be stable, machine-readable, documented, and suitable for frontend handling, logging, monitoring, and support operations.

---

# Error Response Format

All API errors shall follow the standard response format.

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message.",
    "fields": {}
  }
}
```

---

# Error Code Principles

Error codes shall be:

- Stable
- Unique
- Uppercase
- Machine-readable
- Human-understandable
- Documented
- Logged
- Monitorable

---

# Common Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| UNKNOWN_ERROR | 500 | Unexpected system error |
| INTERNAL_SERVER_ERROR | 500 | Internal server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |
| BAD_REQUEST | 400 | Invalid request |
| VALIDATION_ERROR | 422 | Validation failed |
| REQUIRED_FIELD_MISSING | 422 | Required field missing |
| INVALID_FORMAT | 422 | Invalid format |
| INVALID_PARAMETER | 400 | Invalid parameter |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict |
| TOO_MANY_REQUESTS | 429 | Rate limit exceeded |

---

# Authentication Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| AUTH_REQUIRED | 401 | Authentication required |
| INVALID_CREDENTIALS | 401 | Invalid email or password |
| TOKEN_EXPIRED | 401 | Access token expired |
| TOKEN_INVALID | 401 | Access token invalid |
| REFRESH_TOKEN_INVALID | 401 | Refresh token invalid |
| EMAIL_NOT_VERIFIED | 403 | Email address not verified |
| ACCOUNT_LOCKED | 403 | Account is locked |
| ACCOUNT_SUSPENDED | 403 | Account is suspended |
| LOGIN_RATE_LIMITED | 429 | Too many login attempts |

---

# Authorization Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| FORBIDDEN | 403 | Access forbidden |
| INSUFFICIENT_PERMISSION | 403 | Permission is insufficient |
| ROLE_REQUIRED | 403 | Required role missing |
| STORE_ACCESS_DENIED | 403 | User cannot access store |
| ADMIN_ACCESS_REQUIRED | 403 | Administrator access required |
| SUPER_ADMIN_REQUIRED | 403 | Super administrator access required |
| RESOURCE_OWNER_REQUIRED | 403 | Resource ownership required |

---

# User Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| USER_NOT_FOUND | 404 | User not found |
| USER_ALREADY_EXISTS | 409 | User already exists |
| EMAIL_ALREADY_REGISTERED | 409 | Email already registered |
| INVALID_EMAIL | 422 | Invalid email address |
| INVALID_PHONE | 422 | Invalid phone number |
| INVALID_PASSWORD | 422 | Invalid password |
| PASSWORD_POLICY_VIOLATION | 422 | Password does not satisfy policy |
| PASSWORD_CONFIRMATION_MISMATCH | 422 | Password confirmation does not match |
| PROFILE_UPDATE_FAILED | 500 | Profile update failed |
| ACCOUNT_DELETE_FAILED | 500 | Account deletion failed |

---

# Store Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| STORE_NOT_FOUND | 404 | Store not found |
| STORE_INACTIVE | 409 | Store is inactive |
| STORE_SUSPENDED | 403 | Store is suspended |
| STORE_ALREADY_EXISTS | 409 | Store already exists |
| STORE_CREATE_FAILED | 500 | Store creation failed |
| STORE_UPDATE_FAILED | 500 | Store update failed |
| STORE_DELETE_FAILED | 500 | Store deletion failed |
| INVALID_STORE_STATUS | 422 | Invalid store status |
| STORE_NOT_PUBLIC | 403 | Store is not publicly visible |

---

# Business Hours Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| BUSINESS_HOURS_NOT_FOUND | 404 | Business hours not found |
| INVALID_BUSINESS_HOURS | 422 | Invalid business hours |
| BUSINESS_HOURS_OVERLAP | 422 | Business hours overlap |
| OPEN_TIME_AFTER_CLOSE_TIME | 422 | Open time must be before close time |
| STORE_CLOSED | 409 | Store is closed at requested time |
| HOLIDAY_DATE_DUPLICATED | 409 | Holiday date already exists |
| STORE_HOLIDAY | 409 | Store is closed for holiday |

---

# Staff Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| STAFF_NOT_FOUND | 404 | Staff not found |
| STAFF_INACTIVE | 409 | Staff is inactive |
| STAFF_NOT_AVAILABLE | 409 | Staff is not available |
| STAFF_NOT_ASSIGNED_TO_SERVICE | 409 | Staff is not assigned to service |
| STAFF_STORE_MISMATCH | 409 | Staff does not belong to store |
| STAFF_CREATE_FAILED | 500 | Staff creation failed |
| STAFF_UPDATE_FAILED | 500 | Staff update failed |
| STAFF_DELETE_FAILED | 500 | Staff deletion failed |

---

# Service Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| SERVICE_NOT_FOUND | 404 | Service not found |
| SERVICE_INACTIVE | 409 | Service is inactive |
| SERVICE_STORE_MISMATCH | 409 | Service does not belong to store |
| INVALID_SERVICE_DURATION | 422 | Invalid service duration |
| INVALID_SERVICE_PRICE | 422 | Invalid service price |
| INVALID_SERVICE_DEPOSIT | 422 | Invalid service deposit |
| DEPOSIT_EXCEEDS_PRICE | 422 | Deposit exceeds service price |
| SERVICE_CREATE_FAILED | 500 | Service creation failed |
| SERVICE_UPDATE_FAILED | 500 | Service update failed |
| SERVICE_DELETE_FAILED | 500 | Service deletion failed |

---

# Search Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| SEARCH_FAILED | 500 | Reservation search failed |
| SEARCH_TIMEOUT | 504 | Reservation search timed out |
| INVALID_SEARCH_DATE | 422 | Invalid search date |
| INVALID_SEARCH_TIME | 422 | Invalid search time |
| INVALID_SEARCH_DURATION | 422 | Invalid search duration |
| INVALID_PEOPLE_COUNT | 422 | Invalid number of people |
| NO_AVAILABLE_SLOTS | 200 | No available reservation slots |
| SEARCH_RATE_LIMITED | 429 | Search rate limit exceeded |

---

# Reservation Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| RESERVATION_NOT_FOUND | 404 | Reservation not found |
| RESERVATION_CONFLICT | 409 | Reservation conflicts with existing booking |
| RESERVATION_UNAVAILABLE | 409 | Reservation slot is unavailable |
| RESERVATION_EXPIRED | 409 | Reservation hold expired |
| RESERVATION_ALREADY_CANCELLED | 409 | Reservation already cancelled |
| RESERVATION_ALREADY_COMPLETED | 409 | Reservation already completed |
| RESERVATION_NOT_CANCELLABLE | 409 | Reservation cannot be cancelled |
| RESERVATION_NOT_MODIFIABLE | 409 | Reservation cannot be modified |
| INVALID_RESERVATION_STATUS | 422 | Invalid reservation status |
| INVALID_STATUS_TRANSITION | 422 | Invalid reservation status transition |
| BOOKING_DEADLINE_EXCEEDED | 409 | Booking deadline exceeded |
| ADVANCE_BOOKING_LIMIT_EXCEEDED | 409 | Maximum advance booking limit exceeded |
| RESERVATION_CREATE_FAILED | 500 | Reservation creation failed |
| RESERVATION_UPDATE_FAILED | 500 | Reservation update failed |
| RESERVATION_CANCEL_FAILED | 500 | Reservation cancellation failed |

---

# Payment Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| PAYMENT_NOT_FOUND | 404 | Payment not found |
| PAYMENT_REQUIRED | 402 | Payment required |
| PAYMENT_FAILED | 402 | Payment failed |
| PAYMENT_CANCELLED | 409 | Payment cancelled |
| PAYMENT_ALREADY_COMPLETED | 409 | Payment already completed |
| PAYMENT_AMOUNT_MISMATCH | 422 | Payment amount mismatch |
| PAYMENT_CURRENCY_UNSUPPORTED | 422 | Unsupported currency |
| PAYMENT_PROVIDER_ERROR | 502 | Payment provider error |
| PAYMENT_WEBHOOK_INVALID | 400 | Invalid payment webhook |
| PAYMENT_WEBHOOK_SIGNATURE_INVALID | 400 | Invalid webhook signature |
| PAYMENT_INTENT_CREATE_FAILED | 500 | Payment intent creation failed |
| DUPLICATE_PAYMENT_REQUEST | 409 | Duplicate payment request |

---

# Refund Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| REFUND_NOT_FOUND | 404 | Refund not found |
| REFUND_FAILED | 500 | Refund failed |
| REFUND_AMOUNT_INVALID | 422 | Invalid refund amount |
| REFUND_AMOUNT_EXCEEDED | 422 | Refund exceeds paid amount |
| REFUND_NOT_ALLOWED | 409 | Refund is not allowed |
| REFUND_ALREADY_COMPLETED | 409 | Refund already completed |
| REFUND_PROVIDER_ERROR | 502 | Refund provider error |

---

# Cancellation Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| CANCELLATION_NOT_ALLOWED | 409 | Cancellation is not allowed |
| CANCELLATION_DEADLINE_EXCEEDED | 409 | Cancellation deadline exceeded |
| CANCELLATION_POLICY_NOT_FOUND | 404 | Cancellation policy not found |
| CANCELLATION_FEE_CALCULATION_FAILED | 500 | Cancellation fee calculation failed |
| CANCELLATION_ALREADY_COMPLETED | 409 | Cancellation already completed |
| CANCELLATION_FAILED | 500 | Cancellation failed |

---

# Notification Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| NOTIFICATION_NOT_FOUND | 404 | Notification not found |
| NOTIFICATION_SEND_FAILED | 500 | Notification delivery failed |
| EMAIL_SEND_FAILED | 502 | Email delivery failed |
| PUSH_SEND_FAILED | 502 | Push notification delivery failed |
| INVALID_NOTIFICATION_TYPE | 422 | Invalid notification type |

---

# File Upload Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| FILE_REQUIRED | 422 | File is required |
| FILE_TOO_LARGE | 413 | File size exceeds limit |
| FILE_TYPE_UNSUPPORTED | 415 | Unsupported file type |
| FILE_UPLOAD_FAILED | 500 | File upload failed |
| FILE_DELETE_FAILED | 500 | File deletion failed |
| INVALID_FILE_NAME | 422 | Invalid file name |

---

# Admin Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| ADMIN_OPERATION_FAILED | 500 | Administrative operation failed |
| ADMIN_ACTION_NOT_ALLOWED | 403 | Administrative action not allowed |
| AUDIT_LOG_NOT_FOUND | 404 | Audit log not found |
| AUDIT_LOG_IMMUTABLE | 409 | Audit log cannot be modified |
| PLATFORM_CONFIG_UPDATE_FAILED | 500 | Platform configuration update failed |

---

# Infrastructure Error Codes

| Code | HTTP Status | Description |
|------|------------:|-------------|
| DATABASE_ERROR | 500 | Database error |
| DATABASE_TIMEOUT | 504 | Database timeout |
| CACHE_ERROR | 500 | Cache error |
| EXTERNAL_SERVICE_ERROR | 502 | External service error |
| EXTERNAL_SERVICE_TIMEOUT | 504 | External service timeout |
| RATE_LIMIT_EXCEEDED | 429 | Rate limit exceeded |
| MAINTENANCE_MODE | 503 | System is under maintenance |

---

# Error Severity

| Severity | Meaning |
|----------|---------|
| Critical | System or payment failure |
| High | Business operation failure |
| Medium | User-correctable failure |
| Low | Informational or minor issue |

---

# Logging Requirements

Every error log shall include:

- Error Code
- Error Message
- HTTP Status
- Request ID
- User ID if available
- Endpoint
- Method
- Timestamp
- Stack Trace for server errors

Sensitive information shall never be logged.

---

# Frontend Handling

Frontend shall use error codes to:

- Display user-friendly messages.
- Highlight fields.
- Trigger retry behavior.
- Redirect users.
- Display fallback screens.
- Report serious errors.

---

# Monitoring Requirements

The following error categories shall trigger alerts:

- INTERNAL_SERVER_ERROR
- DATABASE_ERROR
- PAYMENT_PROVIDER_ERROR
- PAYMENT_WEBHOOK_SIGNATURE_INVALID
- RESERVATION_CREATE_FAILED
- RESERVATION_CONFLICT spikes
- SERVICE_UNAVAILABLE
- MAINTENANCE_MODE

---

# Error Code Specification Summary

This specification defines the standard error code system for Yoyaku Version 1.0.

All backend services, frontend applications, logs, monitoring systems, automated tests, and operational procedures shall use these codes consistently.
