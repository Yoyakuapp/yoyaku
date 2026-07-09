# Sequence Diagram

## Overview

This document defines the main sequence diagrams for Yoyaku Version 1.0.

Sequence diagrams describe how users, client applications, APIs, domain services, databases, and external services interact during important system workflows.

All implementations shall follow these interaction patterns.

---

# Sequence Diagram Principles

Every sequence shall follow these principles.

- Client applications never bypass APIs.
- Business logic is executed on the server side.
- Database mutations occur only through validated services.
- Critical operations use transactions.
- Payment operations use idempotency.
- External webhooks are verified.
- Every important action is logged.
- Every state transition is audited.

---

# Actors and Components

## Actors

- Guest
- Customer
- Store Owner
- Staff
- Administrator
- System

---

## System Components

- Web Client
- API Layer
- Auth Service
- User Service
- Search Service
- Reservation Service
- Payment Service
- Notification Service
- Store Service
- Admin Service
- Database
- Stripe
- Email Provider
- Push Provider
- Audit Log

---

# Customer Registration Sequence

```mermaid
sequenceDiagram
    actor Guest
    participant Client as Web Client
    participant API as API Layer
    participant Auth as Auth Service
    participant User as User Service
    participant DB as Database
    participant Mail as Email Provider
    participant Audit as Audit Log

    Guest->>Client: Submit registration form
    Client->>API: POST /auth/register
    API->>API: Validate request
    API->>Auth: Register user
    Auth->>User: Create user account
    User->>DB: Insert user
    DB-->>User: User created
    User->>Mail: Send verification email
    User->>Audit: Record registration
    User-->>Auth: Registration complete
    Auth-->>API: Success
    API-->>Client: 201 Created
    Client-->>Guest: Show verification notice
```

---

# Customer Login Sequence

```mermaid
sequenceDiagram
    actor Customer
    participant Client as Web Client
    participant API as API Layer
    participant Auth as Auth Service
    participant DB as Database
    participant Audit as Audit Log

    Customer->>Client: Submit login form
    Client->>API: POST /auth/login
    API->>API: Validate request
    API->>Auth: Authenticate credentials
    Auth->>DB: Find user by email
    DB-->>Auth: User record
    Auth->>Auth: Verify password
    Auth->>Auth: Generate tokens
    Auth->>Audit: Record login
    Auth-->>API: Access token and refresh token
    API-->>Client: 200 OK
    Client-->>Customer: Redirect to previous screen
```

---

# Reservation Search Sequence

```mermaid
sequenceDiagram
    actor Customer
    participant Client as Web Client
    participant API as API Layer
    participant Search as Search Service
    participant Store as Store Service
    participant Reservation as Reservation Service
    participant DB as Database

    Customer->>Client: Enter search conditions
    Client->>API: POST /search
    API->>API: Validate request
    API->>Search: Search availability
    Search->>Store: Load candidate stores
    Store->>DB: Query active stores
    DB-->>Store: Store list
    Store-->>Search: Candidate stores
    Search->>DB: Load business hours and holidays
    DB-->>Search: Store schedules
    Search->>DB: Load staff and services
    DB-->>Search: Staff and service data
    Search->>Reservation: Check reservation conflicts
    Reservation->>DB: Query reservations by date and staff
    DB-->>Reservation: Existing reservations
    Reservation-->>Search: Conflict result
    Search->>Search: Generate available slots
    Search-->>API: Available slots
    API-->>Client: 200 OK
    Client-->>Customer: Display search results
```

---

# Reservation Creation Sequence

```mermaid
sequenceDiagram
    actor Customer
    participant Client as Web Client
    participant API as API Layer
    participant Reservation as Reservation Service
    participant Payment as Payment Service
    participant DB as Database
    participant Audit as Audit Log

    Customer->>Client: Confirm reservation
    Client->>API: POST /reservations
    API->>API: Authenticate user
    API->>API: Validate request
    API->>Reservation: Create reservation
    Reservation->>DB: Begin transaction
    Reservation->>DB: Lock target availability
    Reservation->>DB: Check business hours
    Reservation->>DB: Check holidays
    Reservation->>DB: Check staff availability
    Reservation->>DB: Check reservation conflicts
    Reservation->>DB: Insert reservation
    Reservation->>Audit: Record reservation creation
    Reservation->>DB: Commit transaction
    Reservation-->>API: Reservation created
    API-->>Client: 201 Created
    Client-->>Customer: Show reservation confirmation
```

---

# Reservation With Payment Sequence

```mermaid
sequenceDiagram
    actor Customer
    participant Client as Web Client
    participant API as API Layer
    participant Reservation as Reservation Service
    participant Payment as Payment Service
    participant DB as Database
    participant Stripe as Stripe
    participant Audit as Audit Log

    Customer->>Client: Confirm reservation requiring payment
    Client->>API: POST /reservations
    API->>Reservation: Validate and create pending reservation
    Reservation->>DB: Begin transaction
    Reservation->>DB: Insert reservation with PENDING status
    Reservation->>DB: Commit transaction
    Reservation-->>API: Pending reservation
    API->>Payment: Create payment intent
    Payment->>Stripe: Create PaymentIntent
    Stripe-->>Payment: PaymentIntent created
    Payment->>DB: Insert payment record
    Payment->>Audit: Record payment intent creation
    Payment-->>API: Checkout information
    API-->>Client: Checkout response
    Client->>Stripe: Complete payment
    Stripe-->>Client: Payment redirect
    Client-->>Customer: Show payment processing
```

---

# Stripe Webhook Payment Success Sequence

```mermaid
sequenceDiagram
    participant Stripe as Stripe
    participant API as API Layer
    participant Payment as Payment Service
    participant Reservation as Reservation Service
    participant Notify as Notification Service
    participant DB as Database
    participant Mail as Email Provider
    participant Audit as Audit Log

    Stripe->>API: POST /payments/webhook
    API->>API: Verify webhook signature
    API->>Payment: Process payment success
    Payment->>DB: Begin transaction
    Payment->>DB: Update payment status to PAID
    Payment->>Reservation: Confirm reservation
    Reservation->>DB: Update reservation status to CONFIRMED
    Payment->>Audit: Record payment success
    Payment->>DB: Commit transaction
    Payment->>Notify: Send confirmation notification
    Notify->>Mail: Send confirmation email
    Notify->>DB: Insert notification record
    API-->>Stripe: 200 OK
```

---

# Payment Failure Sequence

```mermaid
sequenceDiagram
    participant Stripe as Stripe
    participant API as API Layer
    participant Payment as Payment Service
    participant Reservation as Reservation Service
    participant DB as Database
    participant Audit as Audit Log

    Stripe->>API: POST /payments/webhook
    API->>API: Verify webhook signature
    API->>Payment: Process payment failure
    Payment->>DB: Begin transaction
    Payment->>DB: Update payment status to FAILED
    Payment->>Reservation: Cancel or keep pending reservation
    Reservation->>DB: Update reservation according to timeout policy
    Payment->>Audit: Record payment failure
    Payment->>DB: Commit transaction
    API-->>Stripe: 200 OK
```

---

# Reservation Cancellation Sequence

```mermaid
sequenceDiagram
    actor Customer
    participant Client as Web Client
    participant API as API Layer
    participant Reservation as Reservation Service
    participant Payment as Payment Service
    participant Notify as Notification Service
    participant DB as Database
    participant Stripe as Stripe
    participant Mail as Email Provider
    participant Audit as Audit Log

    Customer->>Client: Request cancellation
    Client->>API: DELETE /reservations/{reservationId}
    API->>API: Authenticate and authorize
    API->>Reservation: Cancel reservation
    Reservation->>DB: Begin transaction
    Reservation->>DB: Load reservation
    Reservation->>Reservation: Validate cancellation policy
    Reservation->>Reservation: Calculate cancellation fee
    Reservation->>DB: Update reservation status to CANCELLED
    Reservation->>Audit: Record cancellation
    alt Refund required
        Reservation->>Payment: Request refund
        Payment->>Stripe: Create refund
        Stripe-->>Payment: Refund accepted
        Payment->>DB: Insert refund record
        Payment->>DB: Update payment status
    end
    Reservation->>DB: Commit transaction
    Reservation->>Notify: Send cancellation notification
    Notify->>Mail: Send cancellation email
    Notify->>DB: Insert notification record
    API-->>Client: 200 OK
    Client-->>Customer: Show cancellation complete
```

---

# Store Business Hours Update Sequence

```mermaid
sequenceDiagram
    actor StoreOwner
    participant Client as Store Management UI
    participant API as API Layer
    participant Store as Store Service
    participant DB as Database
    participant Audit as Audit Log

    StoreOwner->>Client: Update business hours
    Client->>API: PATCH /stores/{storeId}/business-hours
    API->>API: Authenticate and authorize
    API->>API: Validate request
    API->>Store: Update business hours
    Store->>DB: Begin transaction
    Store->>DB: Validate no overlapping time periods
    Store->>DB: Update business hours
    Store->>Audit: Record business hour change
    Store->>DB: Commit transaction
    Store-->>API: Update complete
    API-->>Client: 200 OK
    Client-->>StoreOwner: Show success message
```

---

# Service Creation Sequence

```mermaid
sequenceDiagram
    actor StoreOwner
    participant Client as Store Management UI
    participant API as API Layer
    participant Store as Store Service
    participant DB as Database
    participant Audit as Audit Log

    StoreOwner->>Client: Submit service form
    Client->>API: POST /stores/{storeId}/services
    API->>API: Authenticate and authorize
    API->>API: Validate request
    API->>Store: Create service
    Store->>DB: Insert service
    Store->>Audit: Record service creation
    Store-->>API: Service created
    API-->>Client: 201 Created
    Client-->>StoreOwner: Show service list
```

---

# Staff Creation Sequence

```mermaid
sequenceDiagram
    actor StoreOwner
    participant Client as Store Management UI
    participant API as API Layer
    participant Store as Store Service
    participant DB as Database
    participant Audit as Audit Log

    StoreOwner->>Client: Submit staff form
    Client->>API: POST /stores/{storeId}/staff
    API->>API: Authenticate and authorize
    API->>API: Validate request
    API->>Store: Create staff
    Store->>DB: Insert staff
    Store->>Audit: Record staff creation
    Store-->>API: Staff created
    API-->>Client: 201 Created
    Client-->>StoreOwner: Show staff list
```

---

# Customer Profile Update Sequence

```mermaid
sequenceDiagram
    actor Customer
    participant Client as Web Client
    participant API as API Layer
    participant User as User Service
    participant DB as Database
    participant Audit as Audit Log

    Customer->>Client: Update profile
    Client->>API: PATCH /users/me
    API->>API: Authenticate user
    API->>API: Validate request
    API->>User: Update profile
    User->>DB: Update user record
    User->>Audit: Record profile update
    User-->>API: Updated profile
    API-->>Client: 200 OK
    Client-->>Customer: Show success message
```

---

# Notification Delivery Sequence

```mermaid
sequenceDiagram
    participant System as System Event
    participant Notify as Notification Service
    participant DB as Database
    participant Mail as Email Provider
    participant Push as Push Provider

    System->>Notify: Trigger notification event
    Notify->>DB: Create notification record
    alt Email enabled
        Notify->>Mail: Send email
        Mail-->>Notify: Delivery accepted
    end
    alt Push enabled
        Notify->>Push: Send push notification
        Push-->>Notify: Delivery accepted
    end
    Notify->>DB: Update notification status
```

---

# Admin User Suspension Sequence

```mermaid
sequenceDiagram
    actor Admin
    participant Client as Admin UI
    participant API as API Layer
    participant AdminSvc as Admin Service
    participant DB as Database
    participant Audit as Audit Log

    Admin->>Client: Suspend user
    Client->>API: PATCH /admin/users/{userId}/suspend
    API->>API: Authenticate administrator
    API->>API: Authorize role
    API->>AdminSvc: Suspend user
    AdminSvc->>DB: Update user status
    AdminSvc->>Audit: Record suspension
    AdminSvc-->>API: Suspension complete
    API-->>Client: 200 OK
    Client-->>Admin: Show success message
```

---

# Admin Store Suspension Sequence

```mermaid
sequenceDiagram
    actor Admin
    participant Client as Admin UI
    participant API as API Layer
    participant AdminSvc as Admin Service
    participant DB as Database
    participant Audit as Audit Log

    Admin->>Client: Suspend store
    Client->>API: PATCH /admin/stores/{storeId}/suspend
    API->>API: Authenticate administrator
    API->>API: Authorize role
    API->>AdminSvc: Suspend store
    AdminSvc->>DB: Update store status
    AdminSvc->>Audit: Record store suspension
    AdminSvc-->>API: Suspension complete
    API-->>Client: 200 OK
    Client-->>Admin: Show success message
```

---

# Audit Logging Sequence

```mermaid
sequenceDiagram
    participant Service as Domain Service
    participant Audit as Audit Log
    participant DB as Database

    Service->>Audit: Record auditable action
    Audit->>DB: Insert audit log
    DB-->>Audit: Insert complete
    Audit-->>Service: Audit recorded
```

---

# Error Handling Sequence

```mermaid
sequenceDiagram
    actor User
    participant Client as Web Client
    participant API as API Layer
    participant Service as Domain Service
    participant Logger as Logging Service

    User->>Client: Submit request
    Client->>API: API request
    API->>Service: Execute operation
    Service-->>API: Error
    API->>Logger: Log error with request ID
    API-->>Client: Standard error response
    Client-->>User: Display user-friendly error
```

---

# Idempotent Reservation Creation Sequence

```mermaid
sequenceDiagram
    actor Customer
    participant Client as Web Client
    participant API as API Layer
    participant Reservation as Reservation Service
    participant DB as Database

    Customer->>Client: Confirm reservation
    Client->>API: POST /reservations with Idempotency-Key
    API->>Reservation: Create reservation
    Reservation->>DB: Check idempotency key
    alt Existing request found
        DB-->>Reservation: Existing result
        Reservation-->>API: Return existing result
    else New request
        Reservation->>DB: Begin transaction
        Reservation->>DB: Create reservation
        Reservation->>DB: Store idempotency result
        Reservation->>DB: Commit transaction
        Reservation-->>API: New reservation result
    end
    API-->>Client: Response
```

---

# Sequence Diagram Summary

This document defines the primary system interaction sequences for Yoyaku Version 1.0.

All implementation shall follow these sequences to ensure consistency, security, transactional integrity, auditable operations, and reliable user experience.
