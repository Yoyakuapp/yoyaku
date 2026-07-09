# API Overview

## Overview

This document defines the REST API architecture for Yoyaku Version 1.0.

All client applications communicate exclusively through HTTPS REST APIs.

The API is designed to be stateless, secure, versioned, and extensible.

Future API versions must maintain backward compatibility whenever possible.

---

# API Principles

The API follows these principles:

- RESTful Design
- Stateless
- JSON Communication
- HTTPS Only
- Versioned Endpoints
- Secure by Default
- Idempotent Operations
- Consistent Error Responses

---

# Base URL

Production

```text
https://api.yoyaku.app/v1
```

Development

```text
http://localhost:3000/api/v1
```

---

# Content Type

Request

```http
Content-Type: application/json
```

Response

```http
Content-Type: application/json
```

Character Encoding

```text
UTF-8
```

---

# Authentication

Authentication methods:

- Email Login
- Google OAuth
- Apple Sign In

Authenticated requests require:

```http
Authorization: Bearer <access_token>
```

Unauthenticated requests shall return:

```http
401 Unauthorized
```

---

# API Categories

Version 1.0 provides the following API groups.

| Category | Purpose |
|-----------|---------|
| Authentication | Login and account management |
| Users | Customer profiles |
| Stores | Store information |
| Staff | Staff management |
| Services | Service management |
| Search | Reservation search |
| Reservations | Reservation management |
| Payments | Payment processing |
| Notifications | Notifications |
| Administration | Platform management |

---

# Authentication API

Endpoints include:

```text
POST /auth/register

POST /auth/login

POST /auth/logout

POST /auth/refresh

POST /auth/password/reset

POST /auth/password/update

GET /auth/me
```

---

# User API

```text
GET /users/me

PATCH /users/me

DELETE /users/me

GET /users/me/reservations

GET /users/me/payments
```

---

# Store API

```text
GET /stores

GET /stores/{id}

POST /stores

PATCH /stores/{id}

DELETE /stores/{id}
```

---

# Staff API

```text
GET /stores/{storeId}/staff

POST /stores/{storeId}/staff

PATCH /staff/{id}

DELETE /staff/{id}
```

---

# Service API

```text
GET /stores/{storeId}/services

POST /stores/{storeId}/services

PATCH /services/{id}

DELETE /services/{id}
```

---

# Search API

```text
POST /search
```

Search request example

```json
{
  "date": "2026-08-01",
  "time": "14:00",
  "duration": 60,
  "people": 1,
  "serviceId": "svc_001",
  "area": "Tokyo"
}
```

Search response

```json
{
  "results": []
}
```

---

# Reservation API

```text
GET /reservations

GET /reservations/{id}

POST /reservations

PATCH /reservations/{id}

DELETE /reservations/{id}
```

---

# Payment API

```text
POST /payments/create-intent

POST /payments/webhook

POST /payments/refund

GET /payments/{id}
```

---

# Notification API

```text
GET /notifications

PATCH /notifications/{id}/read
```

---

# Administration API

```text
GET /admin/dashboard

GET /admin/users

GET /admin/stores

GET /admin/payments

GET /admin/logs
```

---

# HTTP Status Codes

| Code | Meaning |
|------|---------|
|200|Success|
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

# Response Format

Successful response

```json
{
  "success": true,
  "data": {}
}
```

Error response

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

# Pagination

List endpoints shall support:

```text
?page=1

?pageSize=20
```

Response

```json
{
  "page":1,
  "pageSize":20,
  "total":250,
  "items":[]
}
```

---

# Sorting

Supported query:

```text
?sort=createdAt

?order=asc

?order=desc
```

---

# Filtering

Typical filters:

```text
?status=confirmed

?storeId=xxx

?staffId=xxx

?date=2026-08-01
```

Multiple filters may be combined.

---

# Rate Limiting

Default limits:

| API | Limit |
|------|------|
|Login|10/minute|
|Search|120/minute|
|Reservation|30/minute|
|Payment|20/minute|

---

# Security

Every API shall implement:

- HTTPS
- JWT Authentication
- RBAC Authorization
- Input Validation
- Output Sanitization
- Rate Limiting
- Audit Logging

---

# Versioning

Current version:

```text
v1
```

Future versions:

```text
v2

v3
```

Backward compatibility should be maintained whenever possible.

---

# OpenAPI

A complete OpenAPI 3.1 specification shall be maintained under:

```text
/openapi
```

---

# Future APIs

Future releases may include:

- Calendar API
- Coupon API
- Membership API
- Review API
- AI Recommendation API
- Analytics API
- Marketplace API
- Webhook API

---

# API Overview Summary

The REST API provides the communication layer between all Yoyaku clients and backend services.

Every endpoint shall be secure, versioned, documented, validated, monitored, and designed for long-term scalability.
