# Screen Specification

## Overview

This document defines the screen specification for Yoyaku Version 1.0.

The purpose of this document is to provide a complete screen-level implementation reference for the customer application, store management application, and platform administration application.

Every screen must support the product philosophy:

**Book in Seconds.**

---

# Screen Groups

Yoyaku Version 1.0 consists of the following screen groups.

- Customer Screens
- Authentication Screens
- Reservation Screens
- Payment Screens
- Member Screens
- Store Management Screens
- Staff Screens
- Admin Screens
- Error Screens
- System Screens

---

# Screen Naming Convention

Each screen shall have:

- Screen ID
- Screen Name
- Route
- User Role
- Purpose
- Main Components
- Primary Action
- Secondary Actions
- Validation
- Error Handling

---

# Customer Screens

## SCR-CUS-001 Home

Route:

```text
/
```

User Role:

- Guest
- Customer

Purpose:

Provide entry point for reservation search.

Main Components:

- Header
- Search Form
- Popular Categories
- Nearby Stores
- Recommended Stores
- Footer Navigation

Primary Action:

- Search Reservation

Secondary Actions:

- Login
- Register
- View Store
- Change Area

Required Data:

- Current Location
- Categories
- Store Recommendations

Empty State:

- No recommended stores available

Error State:

- Location permission denied
- Search service unavailable

---

## SCR-CUS-002 Search Results

Route:

```text
/search
```

User Role:

- Guest
- Customer

Purpose:

Display available reservation slots based on search conditions.

Main Components:

- Search Condition Summary
- Filter Button
- Sort Button
- Reservation Slot List
- Store Card
- Available Time Card

Primary Action:

- Select Available Slot

Secondary Actions:

- Modify Search
- Apply Filter
- Change Sort
- View Store Detail

Required Data:

- Search Conditions
- Available Slots
- Store Information
- Service Information
- Staff Information
- Price Information

Empty State:

```text
No available reservations were found.
```

Suggested Actions:

- Change Date
- Change Time
- Change Duration
- Search Nearby Stores

Error State:

- Search timeout
- Invalid search condition
- Server unavailable

---

## SCR-CUS-003 Store Detail

Route:

```text
/stores/{storeId}
```

User Role:

- Guest
- Customer

Purpose:

Display store information and available reservation options.

Main Components:

- Store Header
- Store Images
- Store Description
- Business Hours
- Service List
- Staff List
- Available Time List
- Map
- Reviews Placeholder

Primary Action:

- Select Service
- Select Reservation Time

Secondary Actions:

- Favorite Store
- Share Store
- View Map
- Call Store

Required Data:

- Store Details
- Store Images
- Business Hours
- Services
- Staff
- Availability

Error State:

- Store not found
- Store unavailable
- Availability failed

---

## SCR-CUS-004 Service Detail

Route:

```text
/stores/{storeId}/services/{serviceId}
```

User Role:

- Guest
- Customer

Purpose:

Display service details before reservation.

Main Components:

- Service Name
- Service Description
- Duration
- Price
- Deposit
- Available Staff
- Available Times

Primary Action:

- Select Reservation Time

Secondary Actions:

- Back to Store
- Change Staff
- View Cancellation Policy

Required Data:

- Service
- Store
- Staff
- Availability
- Cancellation Policy

---

# Authentication Screens

## SCR-AUTH-001 Login

Route:

```text
/login
```

User Role:

- Guest

Purpose:

Allow users to authenticate.

Main Components:

- Email Field
- Password Field
- Login Button
- Google Login Button
- Apple Login Button
- Forgot Password Link
- Register Link

Primary Action:

- Login

Secondary Actions:

- Continue with Google
- Continue with Apple
- Reset Password
- Create Account

Validation:

- Email required
- Valid email format
- Password required

Error State:

- Invalid credentials
- Email not verified
- Account locked
- Network error

Success Behavior:

- Redirect to previous screen
- If no previous screen, redirect to home

---

## SCR-AUTH-002 Register

Route:

```text
/register
```

User Role:

- Guest

Purpose:

Allow new users to create an account.

Main Components:

- Name Fields
- Email Field
- Phone Field
- Password Field
- Password Confirmation Field
- Terms Agreement Checkbox
- Register Button
- Social Login Buttons

Primary Action:

- Create Account

Validation:

- First name required
- Last name required
- Email required
- Valid email format
- Phone required
- Password required
- Password confirmation must match
- Terms agreement required

Error State:

- Email already registered
- Invalid password
- Registration failed

Success Behavior:

- Send verification email
- Redirect to verification notice

---

## SCR-AUTH-003 Password Reset Request

Route:

```text
/password-reset
```

User Role:

- Guest

Purpose:

Allow users to request password reset.

Main Components:

- Email Field
- Submit Button
- Back to Login Link

Primary Action:

- Send Reset Email

Validation:

- Email required
- Valid email format

Success Behavior:

- Display reset email sent message

---

## SCR-AUTH-004 Password Reset

Route:

```text
/password-reset/{token}
```

User Role:

- Guest

Purpose:

Allow users to set a new password.

Main Components:

- New Password Field
- Confirm Password Field
- Submit Button

Primary Action:

- Update Password

Validation:

- Token required
- Password required
- Password confirmation must match
- Password policy must be satisfied

Error State:

- Invalid token
- Expired token

Success Behavior:

- Redirect to login

---

# Reservation Screens

## SCR-RES-001 Reservation Detail

Route:

```text
/reservations/new
```

User Role:

- Guest
- Customer

Purpose:

Display selected reservation details before confirmation.

Main Components:

- Store Summary
- Service Summary
- Staff Summary
- Date and Time
- Duration
- Price
- Deposit
- Customer Information Form
- Cancellation Policy
- Confirm Button

Primary Action:

- Confirm Reservation

Secondary Actions:

- Change Time
- Change Service
- Change Staff
- Back to Search Results

Required Data:

- Store
- Service
- Staff
- Reservation Time
- Price
- Customer

Validation:

- Reservation slot still available
- Required customer fields entered
- Cancellation policy acknowledged

Error State:

- Slot unavailable
- Validation error
- Login required

---

## SCR-RES-002 Reservation Confirmation

Route:

```text
/reservations/{reservationId}/confirm
```

User Role:

- Customer

Purpose:

Confirm reservation before payment or completion.

Main Components:

- Reservation Summary
- Payment Summary
- Cancellation Policy
- Terms Agreement
- Confirm Button

Primary Action:

- Proceed to Payment
- Complete Reservation

Validation:

- Reservation is valid
- Payment amount is correct
- Terms accepted

Error State:

- Reservation expired
- Reservation conflict
- Payment initialization failed

---

## SCR-RES-003 Reservation Complete

Route:

```text
/reservations/{reservationId}/complete
```

User Role:

- Customer

Purpose:

Display successful reservation completion.

Main Components:

- Success Message
- Reservation Number
- Store Information
- Reservation Date and Time
- Payment Summary
- Add to Calendar Button
- View Reservation Button

Primary Action:

- View Reservation

Secondary Actions:

- Add to Calendar
- Return Home

Required Data:

- Reservation
- Payment
- Store
- Service
- Staff

---

## SCR-RES-004 My Reservations

Route:

```text
/account/reservations
```

User Role:

- Customer

Purpose:

Display customer reservation history.

Main Components:

- Upcoming Reservations
- Completed Reservations
- Cancelled Reservations
- Reservation Cards

Primary Action:

- View Reservation Detail

Secondary Actions:

- Cancel Reservation
- Rebook

Empty State:

```text
You have no reservations yet.
```

---

## SCR-RES-005 Reservation History Detail

Route:

```text
/account/reservations/{reservationId}
```

User Role:

- Customer

Purpose:

Display reservation details and available actions.

Main Components:

- Reservation Status
- Store Information
- Service Information
- Staff Information
- Date and Time
- Payment Information
- Cancellation Policy
- Cancel Button

Primary Action:

- Cancel Reservation

Secondary Actions:

- Contact Store
- Rebook
- Download Receipt

Validation:

- Cancellation eligibility

Error State:

- Reservation not found
- Unauthorized access

---

# Cancellation Screens

## SCR-CAN-001 Cancellation Confirmation

Route:

```text
/account/reservations/{reservationId}/cancel
```

User Role:

- Customer

Purpose:

Confirm reservation cancellation and display cancellation fee.

Main Components:

- Reservation Summary
- Cancellation Policy
- Cancellation Fee
- Refund Amount
- Cancellation Reason
- Confirm Cancel Button

Primary Action:

- Confirm Cancellation

Secondary Actions:

- Back to Reservation

Validation:

- Reservation cancellable
- Cancellation reason selected if required

Error State:

- Cancellation deadline exceeded
- Refund calculation failed
- Reservation already cancelled

---

## SCR-CAN-002 Cancellation Complete

Route:

```text
/account/reservations/{reservationId}/cancelled
```

User Role:

- Customer

Purpose:

Display cancellation completion.

Main Components:

- Completion Message
- Cancelled Reservation Summary
- Refund Summary
- Return Button

Primary Action:

- Return to Reservations

Required Data:

- Reservation
- Cancellation
- Refund

---

# Payment Screens

## SCR-PAY-001 Payment Checkout

Route:

```text
/payments/checkout/{reservationId}
```

User Role:

- Customer

Purpose:

Process payment through Stripe Checkout.

Main Components:

- Reservation Summary
- Payment Amount
- Payment Method
- Stripe Checkout
- Payment Button

Primary Action:

- Pay

Validation:

- Reservation exists
- Payment amount valid
- Payment intent created

Error State:

- Payment initialization failed
- Payment provider unavailable

---

## SCR-PAY-002 Payment Success

Route:

```text
/payments/success`
```

User Role:

- Customer

Purpose:

Handle successful payment redirect.

Main Components:

- Processing Indicator
- Success Message
- Redirect Notice

Primary Action:

- Continue to Reservation Complete

System Behavior:

- Verify payment status
- Update reservation status
- Redirect to completion screen

---

## SCR-PAY-003 Payment Failure

Route:

```text
/payments/failure
```

User Role:

- Customer

Purpose:

Display payment failure and allow retry.

Main Components:

- Error Message
- Reservation Summary
- Retry Button
- Change Payment Method Button

Primary Action:

- Retry Payment

Secondary Actions:

- Cancel Reservation
- Contact Support

---

# Member Screens

## SCR-MEM-001 Account Home

Route:

```text
/account
```

User Role:

- Customer

Purpose:

Provide account menu and profile summary.

Main Components:

- Profile Summary
- Reservation Link
- Payment History Link
- Favorite Stores Link
- Notification Settings Link
- Logout Button

Primary Action:

- View Reservations

Secondary Actions:

- Edit Profile
- Logout

---

## SCR-MEM-002 Profile Edit

Route:

```text
/account/profile
```

User Role:

- Customer

Purpose:

Allow customer to edit personal information.

Main Components:

- Name Fields
- Email Field
- Phone Field
- Language Setting
- Timezone Setting
- Save Button

Primary Action:

- Save Profile

Validation:

- Name required
- Email valid
- Phone valid

Error State:

- Duplicate email
- Invalid phone
- Save failed

---

## SCR-MEM-003 Notification Settings

Route:

```text
/account/notifications
```

User Role:

- Customer

Purpose:

Allow customer to manage notification preferences.

Main Components:

- Email Notification Toggle
- Push Notification Toggle
- Promotional Message Toggle
- Reservation Reminder Toggle
- Save Button

Primary Action:

- Save Preferences

---

## SCR-MEM-004 Favorite Stores

Route:

```text
/account/favorites
```

User Role:

- Customer

Purpose:

Display customer's favorite stores.

Main Components:

- Favorite Store List
- Store Cards
- Remove Favorite Button

Primary Action:

- View Store

Secondary Actions:

- Remove Favorite

Empty State:

```text
No favorite stores yet.
```

---

# Store Management Screens

## SCR-STORE-001 Store Dashboard

Route:

```text
/store/dashboard
```

User Role:

- Store Owner
- Staff

Purpose:

Display store operational summary.

Main Components:

- Today's Reservations
- Revenue Summary
- Upcoming Reservations
- Staff Utilization
- Alerts
- Quick Actions

Primary Action:

- View Reservations

Secondary Actions:

- Add Reservation
- Manage Staff
- Manage Services

---

## SCR-STORE-002 Reservation Calendar

Route:

```text
/store/reservations
```

User Role:

- Store Owner
- Staff

Purpose:

Display reservation calendar.

Main Components:

- Calendar View
- Reservation List
- Date Selector
- Staff Filter
- Status Filter

Primary Action:

- View Reservation

Secondary Actions:

- Change Date
- Filter Staff
- Filter Status

Views:

- Day
- Week
- Month

---

## SCR-STORE-003 Store Reservation Detail

Route:

```text
/store/reservations/{reservationId}
```

User Role:

- Store Owner
- Staff

Purpose:

Display reservation detail for business operations.

Main Components:

- Reservation Status
- Customer Information
- Service Information
- Staff Information
- Payment Status
- Notes
- Action Buttons

Primary Action:

- Update Reservation Status

Secondary Actions:

- Cancel Reservation
- Add Note
- Contact Customer

---

## SCR-STORE-004 Store Settings

Route:

```text
/store/settings
```

User Role:

- Store Owner

Purpose:

Manage store information and configuration.

Main Components:

- Store Information Form
- Contact Information
- Location Information
- Business Hours Link
- Holiday Settings Link
- Payment Settings Link

Primary Action:

- Save Store Settings

Validation:

- Store name required
- Email valid
- Phone valid
- Address required

---

## SCR-STORE-005 Business Hours

Route:

```text
/store/settings/business-hours
```

User Role:

- Store Owner

Purpose:

Configure regular business hours.

Main Components:

- Weekday List
- Open Time
- Close Time
- Closed Toggle
- Add Time Period Button
- Save Button

Primary Action:

- Save Business Hours

Validation:

- Open time before close time
- No overlapping periods

---

## SCR-STORE-006 Holiday Settings

Route:

```text
/store/settings/holidays
```

User Role:

- Store Owner

Purpose:

Configure store holidays and temporary closures.

Main Components:

- Holiday Calendar
- Holiday List
- Add Holiday Button
- Description Field

Primary Action:

- Add Holiday

Secondary Actions:

- Delete Holiday
- Edit Holiday

---

## SCR-STORE-007 Service Management

Route:

```text
/store/services
```

User Role:

- Store Owner

Purpose:

Manage store services.

Main Components:

- Service List
- Add Service Button
- Service Status Toggle
- Edit Button

Primary Action:

- Add Service

Secondary Actions:

- Edit Service
- Archive Service

---

## SCR-STORE-008 Service Edit

Route:

```text
/store/services/{serviceId}
```

User Role:

- Store Owner

Purpose:

Create or edit service information.

Main Components:

- Service Name
- Description
- Duration
- Price
- Deposit
- Assigned Staff
- Active Toggle
- Save Button

Primary Action:

- Save Service

Validation:

- Service name required
- Duration required
- Price required
- Duration must be positive
- Price must be non-negative

---

## SCR-STORE-009 Staff Management

Route:

```text
/store/staff`
```

User Role:

- Store Owner

Purpose:

Manage staff members.

Main Components:

- Staff List
- Add Staff Button
- Staff Status
- Edit Button

Primary Action:

- Add Staff

Secondary Actions:

- Edit Staff
- Disable Staff

---

## SCR-STORE-010 Staff Edit

Route:

```text
/store/staff/{staffId}
```

User Role:

- Store Owner

Purpose:

Create or edit staff information.

Main Components:

- Staff Name
- Email
- Phone
- Assigned Services
- Working Hours
- Active Status
- Save Button

Primary Action:

- Save Staff

Validation:

- Staff name required
- Email valid
- Phone valid

---

## SCR-STORE-011 Customer Management

Route:

```text
/store/customers
```

User Role:

- Store Owner
- Staff

Purpose:

Display store customers.

Main Components:

- Customer List
- Search Field
- Reservation Count
- Last Visit
- Customer Status

Primary Action:

- View Customer Detail

---

## SCR-STORE-012 Store Analytics

Route:

```text
/store/analytics
```

User Role:

- Store Owner

Purpose:

Display business analytics.

Main Components:

- Revenue Chart
- Reservation Chart
- Cancellation Rate
- Popular Services
- Staff Utilization
- Date Range Selector

Primary Action:

- Change Date Range

---

# Admin Screens

## SCR-ADM-001 Admin Dashboard

Route:

```text
/admin
```

User Role:

- Platform Administrator
- Super Administrator

Purpose:

Display platform-wide operational overview.

Main Components:

- Total Users
- Total Stores
- Reservations Today
- Revenue
- Failed Payments
- System Health
- Alerts

Primary Action:

- View System Alerts

---

## SCR-ADM-002 User Administration

Route:

```text
/admin/users
```

User Role:

- Platform Administrator
- Super Administrator

Purpose:

Manage platform users.

Main Components:

- User List
- Search Field
- Role Filter
- Status Filter
- User Detail Link

Primary Action:

- View User

Secondary Actions:

- Suspend User
- Restore User

---

## SCR-ADM-003 Store Administration

Route:

```text
/admin/stores
```

User Role:

- Platform Administrator
- Super Administrator

Purpose:

Manage all stores on platform.

Main Components:

- Store List
- Search Field
- Status Filter
- Approval Status
- Store Detail Link

Primary Action:

- View Store

Secondary Actions:

- Approve Store
- Suspend Store

---

## SCR-ADM-004 Payment Administration

Route:

```text
/admin/payments
```

User Role:

- Platform Administrator
- Super Administrator

Purpose:

Monitor payment activity.

Main Components:

- Payment List
- Status Filter
- Amount
- Store
- Customer
- Payment Provider ID

Primary Action:

- View Payment Detail

---

## SCR-ADM-005 Audit Logs

Route:

```text
/admin/audit-logs
```

User Role:

- Platform Administrator
- Super Administrator

Purpose:

Review immutable audit logs.

Main Components:

- Audit Log List
- Actor Filter
- Entity Filter
- Action Filter
- Date Range Filter

Primary Action:

- Search Logs

---

## SCR-ADM-006 Monitoring

Route:

```text
/admin/monitoring
```

User Role:

- Platform Administrator
- Super Administrator

Purpose:

Display operational health.

Main Components:

- API Status
- Database Status
- Payment Status
- Error Rate
- Latency
- Recent Incidents

Primary Action:

- View Incident

---

# Error Screens

## SCR-ERR-001 Not Found

Route:

```text
/404
```

Purpose:

Display when requested page does not exist.

Primary Action:

- Return Home

---

## SCR-ERR-002 Unauthorized

Route:

```text
/401
```

Purpose:

Display when authentication is required.

Primary Action:

- Login

---

## SCR-ERR-003 Forbidden

Route:

```text
/403
```

Purpose:

Display when user lacks permission.

Primary Action:

- Return Home

---

## SCR-ERR-004 Server Error

Route:

```text
/500
```

Purpose:

Display unexpected system error.

Primary Action:

- Try Again

Secondary Action:

- Contact Support

---

# System Screens

## SCR-SYS-001 Maintenance

Route:

```text
/maintenance
```

Purpose:

Display during scheduled maintenance.

Main Components:

- Maintenance Message
- Estimated Recovery Time
- Support Link

---

# Global Screen Requirements

All screens shall implement:

- Responsive layout
- Server-side validation
- Client-side validation where appropriate
- Loading state
- Empty state
- Error state
- Success state
- Accessibility support
- Audit logging where applicable

---

# Screen Specification Summary

This screen specification defines the initial complete screen inventory for Yoyaku Version 1.0.

Every implementation screen shall follow the IDs, routes, roles, validation rules, and behavior defined in this document.

Future screen additions shall preserve the same naming convention, routing clarity, and mobile-first interaction model.
