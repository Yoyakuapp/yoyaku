# API Detailed Specification

## Overview

This document defines the detailed REST API specification for Yoyaku Version 1.0.

All APIs shall conform to REST principles, communicate using JSON over HTTPS, and be fully documented through OpenAPI 3.1.

Every endpoint shall implement authentication, authorization, validation, logging, monitoring, and standardized error handling.

---

# Common Specifications

## Base URL

Production

```text
https://api.yoyaku.app/v1
```

Development

```text
http://localhost:3000/api/v1
```

---

## Protocol

```text
HTTPS
```

HTTP requests shall be redirected to HTTPS.

---

## Request Format

```http
Content-Type: application/json
```

---

## Response Format

```http
Content-Type: application/json
```

---

## Character Encoding

```text
UTF-8
```

---

## Authentication

Protected endpoints require:

```http
Authorization: Bearer {access_token}
```

---

# Standard Response

## Success

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

---

## Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed."
  }
}
```

---

# Authentication API

## Register

```http
POST /auth/register
```

Request

```json
{
  "firstName":"John",
  "lastName":"Smith",
  "email":"john@example.com",
  "password":"********",
  "phone":"+819012345678"
}
```

Response

```http
201 Created
```

---

## Login

```http
POST /auth/login
```

Request

```json
{
  "email":"john@example.com",
  "password":"********"
}
```

Response

```json
{
  "accessToken":"",
  "refreshToken":""
}
```

---

## Logout

```http
POST /auth/logout
```

---

## Refresh Token

```http
POST /auth/refresh
```

---

## Current User

```http
GET /auth/me
```

---

# User API

## Get Profile

```http
GET /users/me
```

---

## Update Profile

```http
PATCH /users/me
```

Allowed fields

- firstName
- lastName
- phone
- language
- timezone

---

## Delete Account

```http
DELETE /users/me
```

Soft delete only.

---

# Store API

## List Stores

```http
GET /stores
```

Query Parameters

```text
page
pageSize
keyword
category
area
```

---

## Store Detail

```http
GET /stores/{storeId}
```

---

## Create Store

```http
POST /stores
```

Store Owner only.

---

## Update Store

```http
PATCH /stores/{storeId}
```

---

## Delete Store

```http
DELETE /stores/{storeId}
```

Soft delete.

---

# Service API

## List Services

```http
GET /stores/{storeId}/services
```

---

## Create Service

```http
POST /stores/{storeId}/services
```

---

## Update Service

```http
PATCH /services/{serviceId}
```

---

## Delete Service

```http
DELETE /services/{serviceId}
```

---

# Staff API

## List Staff

```http
GET /stores/{storeId}/staff
```

---

## Create Staff

```http
POST /stores/{storeId}/staff
```

---

## Update Staff

```http
PATCH /staff/{staffId}
```

---

## Delete Staff

```http
DELETE /staff/{staffId}
```

---

# Reservation Search API

## Search Reservations

```http
POST /search
```

Request

```json
{
  "date":"2026-09-01",
  "time":"14:00",
  "duration":60,
  "people":1,
  "serviceId":"uuid",
  "staffId":"uuid",
  "area":"Tokyo"
}
```

Response

```json
{
  "results":[]
}
```

Search Processing

1. Validate request
2. Validate store
3. Validate business hours
4. Validate holidays
5. Validate staff
6. Validate conflicts
7. Return available slots

---

# Reservation API

## Create Reservation

```http
POST /reservations
```

Request

```json
{
  "storeId":"uuid",
  "serviceId":"uuid",
  "staffId":"uuid",
  "reservationDate":"2026-09-01",
  "startTime":"14:00",
  "people":1,
  "notes":""
}
```

Response

```http
201 Created
```

---

## Reservation Detail

```http
GET /reservations/{reservationId}
```

---

## Update Reservation

```http
PATCH /reservations/{reservationId}
```

Allowed updates

- date
- time
- notes

---

## Cancel Reservation

```http
DELETE /reservations/{reservationId}
```

---

## Reservation History

```http
GET /users/me/reservations
```

---

# Payment API

## Create Payment Intent

```http
POST /payments/create-intent
```

---

## Stripe Webhook

```http
POST /payments/webhook
```

---

## Payment Detail

```http
GET /payments/{paymentId}
```

---

## Refund

```http
POST /payments/refund
```

---

# Notification API

## Notification List

```http
GET /notifications
```

---

## Read Notification

```http
PATCH /notifications/{notificationId}
```

---

# Dashboard API

## Store Dashboard

```http
GET /dashboard
```

---

## Analytics

```http
GET /analytics
```

Query

```text
from

to
```

---

# Administration API

## User List

```http
GET /admin/users
```

---

## Store List

```http
GET /admin/stores
```

---

## Reservation List

```http
GET /admin/reservations
```

---

## Payment List

```http
GET /admin/payments
```

---

## Audit Logs

```http
GET /admin/audit-logs
```

---

## Monitoring

```http
GET /admin/monitoring
```

---

# Pagination

Supported by all list APIs.

Parameters

```text
page

pageSize
```

Response

```json
{
  "page":1,
  "pageSize":20,
  "total":320,
  "items":[]
}
```

---

# Sorting

Example

```text
?sort=createdAt

&order=desc
```

---

# Filtering

Supported filters

- status
- storeId
- customerId
- serviceId
- staffId
- reservationDate

---

# Validation

Every request shall validate:

- Required fields
- Data types
- String length
- UUID format
- Business rules
- Authorization

---

# HTTP Status Codes

| Code | Meaning |
|------|---------|
|200|OK|
|201|Created|
|204|No Content|
|400|Bad Request|
|401|Unauthorized|
|403|Forbidden|
|404|Not Found|
|409|Conflict|
|422|Validation Error|
|429|Too Many Requests|
|500|Internal Server Error|

---

# Rate Limiting

| Endpoint | Limit |
|-----------|--------|
| Login | 10/min |
| Search | 120/min |
| Reservation | 30/min |
| Payment | 20/min |

---

# Idempotency

The following endpoints shall support idempotency.

- Create Reservation
- Create Payment Intent
- Refund

Clients shall provide

```http
Idempotency-Key
```

---

# Security

Every endpoint shall implement:

- HTTPS
- JWT Authentication
- RBAC Authorization
- Input Validation
- Output Sanitization
- Rate Limiting
- Audit Logging

---

# Logging

Every request shall record:

- Request ID
- User ID
- Endpoint
- Method
- Response Code
- Duration
- Timestamp

---

# Monitoring

Every endpoint shall expose metrics for:

- Request Count
- Error Count
- Average Latency
- P95 Latency
- P99 Latency

---

# OpenAPI

The complete machine-readable API definition shall be maintained as:

```text
/openapi/openapi.yaml
```

OpenAPI Version

```text
3.1.0
```

---

# API Versioning

Current

```text
v1
```

Future

```text
v2

v3
```

Backward compatibility shall be preserved whenever possible.

---

# API Detailed Specification Summary

This document defines the complete REST API contract for Yoyaku Version 1.0.

All backend services, frontend applications, mobile clients, third-party integrations, automated tests, and API documentation shall conform to the interfaces, validation rules, security requirements, and operational standards defined in this specification.
