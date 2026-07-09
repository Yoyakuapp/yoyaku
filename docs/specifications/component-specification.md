# Component Specification

## Overview

This document defines the reusable UI and application components for Yoyaku Version 1.0.

The component architecture follows a design system approach to maximize consistency, maintainability, scalability, and development efficiency.

All components shall be reusable, accessible, responsive, and independent whenever practical.

---

# Design Principles

Every component shall satisfy the following principles.

- Reusable
- Stateless whenever possible
- Accessible
- Responsive
- Type-safe
- Testable
- Documented

---

# Component Categories

The application consists of the following component groups.

- Layout Components
- Navigation Components
- Form Components
- Input Components
- Display Components
- Reservation Components
- Payment Components
- Feedback Components
- Modal Components
- Utility Components

---

# Layout Components

## AppLayout

Purpose

Provides the application layout.

Children

- Header
- Main Content
- Footer
- Bottom Navigation

Props

| Property | Type | Required |
|-----------|------|----------|
| children | ReactNode | Yes |

---

## PageContainer

Purpose

Controls page width and spacing.

Props

| Property | Type |
|-----------|------|
| maxWidth | string |
| padding | number |

---

## Section

Purpose

Displays grouped content.

Props

| Property | Type |
|-----------|------|
| title | string |
| description | string |

---

# Navigation Components

## Header

Displays:

- Logo
- Search
- Notifications
- Profile

---

## BottomNavigation

Items

- Home
- Search
- Reservations
- Account

Visible only on mobile.

---

## Breadcrumb

Desktop navigation helper.

---

# Button Components

## PrimaryButton

Usage

Primary user action.

Variants

- Default
- Loading
- Disabled

Props

| Property | Type |
|-----------|------|
| text | string |
| loading | boolean |
| disabled | boolean |
| onClick | function |

---

## SecondaryButton

Used for secondary actions.

---

## DangerButton

Used for destructive operations.

Examples

- Delete
- Cancel Reservation

---

## IconButton

Button containing only an icon.

---

# Form Components

## Form

Wrapper component.

Responsibilities

- Validation
- Submission
- Error handling

---

## FormField

Displays:

- Label
- Input
- Error
- Helper Text

---

## FormSection

Groups related fields.

---

# Input Components

## TextInput

Props

- value
- placeholder
- required
- disabled
- error

---

## PasswordInput

Features

- Show Password
- Hide Password

---

## SearchInput

Supports:

- Search Icon
- Clear Button

---

## PhoneInput

Phone number formatting.

---

## EmailInput

Email validation.

---

## NumberInput

Supports:

- Min
- Max
- Step

---

## DatePicker

Used for reservation date.

---

## TimePicker

Used for reservation time.

---

## DurationSelector

Selectable durations.

Example

30

45

60

90

120 minutes

---

## Select

Dropdown selection.

---

## MultiSelect

Supports multiple values.

---

## Checkbox

Single selection.

---

## RadioGroup

Exclusive selection.

---

## Toggle

Boolean option.

---

## TextArea

Long-form input.

---

# Reservation Components

## ReservationCard

Displays:

- Store
- Service
- Staff
- Time
- Price

Primary Action

Select Reservation

---

## ReservationSummary

Displays selected reservation.

---

## ReservationStatusBadge

Statuses

- Pending
- Confirmed
- Completed
- Cancelled
- No Show

---

## ReservationTimeline

Displays reservation progress.

---

# Store Components

## StoreCard

Displays:

- Image
- Store Name
- Rating
- Distance
- Business Hours

---

## ServiceCard

Displays:

- Service Name
- Duration
- Price
- Deposit

---

## StaffCard

Displays:

- Photo
- Name
- Specialty
- Availability

---

# Payment Components

## PaymentSummary

Displays

- Amount
- Deposit
- Tax
- Total

---

## PaymentStatusBadge

Statuses

- Pending
- Paid
- Failed
- Refunded

---

## ReceiptCard

Displays payment receipt.

---

# Feedback Components

## Alert

Variants

- Success
- Error
- Warning
- Info

---

## Toast

Temporary notification.

Maximum duration

```text
5 seconds
```

---

## LoadingSpinner

Displayed for short operations.

---

## Skeleton

Displayed during loading.

Preferred over spinner.

---

## EmptyState

Displays:

- Illustration
- Message
- Suggested Action

---

# Modal Components

## ConfirmationModal

Used before:

- Cancellation
- Deletion
- Payment

---

## ErrorModal

Displays unexpected errors.

---

## SuccessModal

Displays completed actions.

---

# Table Components

## DataTable

Supports

- Pagination
- Sorting
- Filtering

---

## TableToolbar

Contains

- Search
- Filter
- Export

---

# Dashboard Components

## StatisticsCard

Displays

- Metric
- Change
- Trend

---

## ChartCard

Displays charts.

Supported charts

- Line
- Bar
- Pie

---

## ActivityFeed

Displays latest activities.

---

# Utility Components

## Avatar

Displays profile image.

---

## Badge

Displays labels.

Variants

- Success
- Error
- Warning
- Neutral

---

## Chip

Displays filter selections.

---

## Divider

Separates sections.

---

## Tooltip

Displays additional information.

---

## Pagination

Supports:

- Previous
- Next
- Page Numbers

---

# Loading Behavior

Every component shall support:

- Initial Loading
- Error State
- Empty State
- Success State

---

# Accessibility

All components shall support:

- Keyboard Navigation
- Screen Readers
- Focus Indicators
- ARIA Labels

Target

WCAG 2.1 AA

---

# Responsive Rules

Components shall adapt to:

| Device | Width |
|----------|-------:|
| Mobile | 320px+ |
| Tablet | 768px+ |
| Desktop | 1024px+ |

---

# Component Naming

React Components

```text
PascalCase
```

Examples

```text
ReservationCard

StoreCard

PaymentSummary
```

---

# File Structure

```text
components/

layout/

navigation/

buttons/

forms/

inputs/

reservation/

store/

payment/

feedback/

dashboard/

utility/
```

---

# Testing

Every reusable component shall include:

- Unit Test
- Accessibility Test
- Visual Test (where applicable)

---

# Future Components

Future versions may include:

- AI Recommendation Card
- Calendar Timeline
- Waitlist Card
- Coupon Selector
- Loyalty Card
- Chat Widget
- Voice Search
- AI Assistant

---

# Component Specification Summary

This specification defines the reusable component library for Yoyaku Version 1.0.

All UI implementation shall be constructed from these standardized components to ensure consistency, maintainability, accessibility, and scalability across the platform.
