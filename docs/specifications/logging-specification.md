# Logging Specification

## Overview

This document defines the logging architecture and operational requirements for Yoyaku Version 1.0.

Logging provides observability, troubleshooting, auditing, security monitoring, and operational analysis.

Every service, API, background job, scheduled task, and infrastructure component shall produce structured logs.

---

# Logging Principles

Logging shall satisfy the following principles.

- Structured Logging
- Machine Readable
- Immutable
- Timestamped
- Searchable
- Correlatable
- Secure
- Privacy Aware

---

# Objectives

Logging shall support:

- Error Investigation
- Performance Analysis
- Security Monitoring
- Audit Trail
- Operational Monitoring
- Incident Response
- Capacity Planning

---

# Log Levels

## TRACE

Very detailed diagnostic information.

Development only.

---

## DEBUG

Developer troubleshooting information.

Disabled in production.

---

## INFO

Normal application events.

Examples:

- User Login
- Reservation Created
- Payment Completed
- Store Updated

---

## WARN

Unexpected but recoverable situations.

Examples:

- Slow Query
- Retry Attempt
- Invalid User Input
- Third-party Delay

---

## ERROR

Application errors requiring attention.

Examples:

- Database Failure
- Payment Failure
- API Exception
- Reservation Failure

---

## FATAL

Critical failures requiring immediate response.

Examples:

- Database Unavailable
- Payment Provider Outage
- Data Corruption
- Startup Failure

---

# Log Format

All logs shall be JSON.

Example

```json
{
  "timestamp":"2026-09-01T12:00:00Z",
  "level":"INFO",
  "service":"reservation-service",
  "requestId":"req_123",
  "userId":"user_456",
  "message":"Reservation created."
}
```

---

# Required Fields

Every log shall contain:

| Field | Required |
|---------|----------|
| timestamp | Yes |
| level | Yes |
| service | Yes |
| message | Yes |
| requestId | Yes |
| correlationId | Yes |
| environment | Yes |
| hostname | Yes |

---

# Optional Fields

Where applicable:

- userId
- storeId
- reservationId
- paymentId
- endpoint
- method
- responseCode
- duration
- ipAddress
- userAgent
- stackTrace
- exceptionType

---

# Correlation IDs

Every request shall generate:

```text
requestId
```

Distributed operations shall additionally include:

```text
correlationId
```

These values shall propagate across services.

---

# API Logging

Every API request shall log:

- Request Start
- Request Completion
- Processing Time
- HTTP Method
- URL
- Status Code
- User
- IP Address

Example

```json
{
  "method":"POST",
  "path":"/reservations",
  "status":201,
  "duration":152
}
```

---

# Authentication Logging

Log:

- Login Success
- Login Failure
- Logout
- Password Reset
- Token Refresh
- Account Lock
- Account Suspension

Passwords shall never be logged.

---

# Reservation Logging

Log:

- Reservation Search
- Reservation Creation
- Reservation Update
- Reservation Cancellation
- Reservation Completion
- Reservation Conflict

---

# Payment Logging

Log:

- Payment Intent Created
- Payment Authorized
- Payment Completed
- Payment Failed
- Refund Requested
- Refund Completed
- Webhook Received

Card data shall never be logged.

---

# Notification Logging

Log:

- Email Sent
- Push Sent
- SMS Sent
- Delivery Failure
- Retry Attempt

---

# Administrative Logging

Log:

- User Suspension
- Store Suspension
- Role Change
- Configuration Change
- Manual Refund
- Manual Reservation Update

Administrative actions shall always include actor information.

---

# Database Logging

Log:

- Migration Started
- Migration Completed
- Migration Failed
- Connection Failure
- Slow Query
- Transaction Rollback

---

# Background Job Logging

Every scheduled job shall log:

- Start
- Finish
- Duration
- Success
- Failure
- Retry Count

---

# Performance Logging

Record:

- Response Time
- Database Query Time
- External API Time
- Cache Hit Ratio
- Queue Processing Time

---

# Error Logging

Every exception shall log:

- Error Code
- Message
- Stack Trace
- Request ID
- User ID
- Timestamp

Handled errors and unexpected exceptions shall both be recorded.

---

# Security Logging

Log:

- Failed Login Attempts
- Permission Denied
- Invalid Token
- Rate Limit Exceeded
- Suspicious Activity
- Administrator Login

---

# Sensitive Data

The following shall never be logged:

- Passwords
- Payment Card Numbers
- CVV
- Authentication Tokens
- Session Cookies
- Private Encryption Keys
- Personal Secrets

Sensitive values shall be masked.

Example

```text
john@example.com

↓

jo***@example.com
```

---

# Log Retention

| Log Type | Retention |
|----------|-----------|
| Application | 90 Days |
| Security | 365 Days |
| Audit | 7 Years |
| Payment | 7 Years |
| Infrastructure | 180 Days |

---

# Log Rotation

Production logs shall rotate automatically.

Maximum file size

```text
100MB
```

Compression

```text
gzip
```

---

# Centralized Logging

Production logs shall be aggregated into a centralized logging platform.

Supported examples:

- OpenSearch
- Elasticsearch
- Grafana Loki
- Cloud Logging

---

# Search Requirements

Logs shall support searching by:

- Request ID
- Correlation ID
- User ID
- Store ID
- Reservation ID
- Payment ID
- Error Code
- Log Level
- Time Range

---

# Alerting

Immediate alerts shall be generated for:

- FATAL logs
- Payment failures
- Database failures
- Authentication attacks
- Service outages
- Excessive ERROR logs

---

# Audit Logging

Audit logs shall be immutable.

Every audit log shall include:

- Actor
- Action
- Entity
- Previous Value
- New Value
- Timestamp

Audit logs shall never be modified or deleted.

---

# Logging Standards

All services shall use:

- UTC timestamps
- ISO 8601 format
- JSON structure
- Consistent field names
- Consistent severity levels

---

# Development Rules

Development builds may include:

- DEBUG
- TRACE

Production shall disable:

- TRACE
- DEBUG

---

# Logging Performance

Logging shall:

- Never block user requests.
- Use asynchronous writes where possible.
- Support batching.
- Avoid duplicate log records.

---

# Compliance

Logging shall comply with:

- GDPR
- PCI DSS
- Local privacy regulations

Personally identifiable information shall be minimized.

---

# Future Enhancements

Future versions may include:

- AI Log Analysis
- Automatic Incident Detection
- Root Cause Analysis
- Log Anomaly Detection
- Predictive Alerting
- Distributed Tracing Integration

---

# Logging Specification Summary

This specification defines the logging standards for Yoyaku Version 1.0.

All services, APIs, background jobs, infrastructure components, and operational tools shall produce structured, secure, searchable, and auditable logs in accordance with this specification.
