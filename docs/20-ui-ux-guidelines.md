# UI / UX Guidelines

## Overview

This document defines the User Interface (UI) and User Experience (UX) principles for Yoyaku Version 1.0.

Every screen shall support the product philosophy:

**Book in Seconds.**

The interface must minimize user effort while maximizing clarity, speed, accessibility, and consistency.

---

# Design Principles

Every screen shall satisfy the following principles.

- Mobile First
- Simplicity
- Consistency
- Accessibility
- Speed
- Clarity
- Minimal Input
- Immediate Feedback

---

# Mobile First

The primary device is the smartphone.

Desktop layouts shall adapt from the mobile design rather than the reverse.

Minimum supported width:

```text
320px
```

Recommended mobile width:

```text
390px
```

Desktop layouts shall preserve identical workflows.

---

# Navigation

Navigation shall require the fewest possible interactions.

Maximum navigation depth:

```text
3 levels
```

Primary navigation shall always remain visible.

Users should never become lost within the application.

---

# Screen Layout

Each screen should contain:

- Screen Title
- Primary Action
- Secondary Actions
- Content Area
- Navigation

Only one primary action shall exist per screen.

---

# Typography

Recommended typography hierarchy.

| Element | Size |
|---------|------|
| Page Title | 32px |
| Section Title | 24px |
| Card Title | 20px |
| Body | 16px |
| Caption | 14px |

Text shall remain readable on mobile devices.

---

# Color Principles

Color usage shall communicate meaning.

| Purpose | Meaning |
|----------|---------|
| Primary | Main Action |
| Secondary | Secondary Action |
| Success | Completed |
| Warning | Attention |
| Error | Failure |
| Information | Neutral |

Color shall never be the only indicator of state.

---

# Buttons

Primary Button

- Filled
- High emphasis

Secondary Button

- Outlined

Text Button

- Low emphasis

Danger Button

- Destructive actions only

Buttons shall provide immediate visual feedback.

---

# Forms

Forms shall:

- Minimize required fields.
- Validate while typing where appropriate.
- Display clear error messages.
- Preserve entered data after validation failure.

Required fields shall be clearly indicated.

---

# Search Experience

Search should require minimal input.

Recommended flow:

```text
Date

↓

Time

↓

Duration

↓

Search
```

Results shall appear immediately after search completion.

---

# Reservation Flow

The reservation process should not exceed:

```text
5 screens
```

Recommended flow:

```text
Search

↓

Results

↓

Reservation Details

↓

Payment

↓

Confirmation
```

---

# Cards

Cards shall display:

- Store Name
- Service
- Available Time
- Duration
- Price

Optional:

- Rating
- Distance
- Image

Cards shall remain touch-friendly.

---

# Lists

Lists shall:

- Support scrolling.
- Avoid horizontal scrolling.
- Support filtering.
- Support sorting.

Loading indicators shall appear during data retrieval.

---

# Icons

Icons shall support text rather than replace it.

Icons should remain consistent throughout the application.

---

# Images

Images shall:

- Load lazily.
- Maintain aspect ratio.
- Support responsive sizes.

Placeholder images shall be displayed while loading.

---

# Empty States

When no data exists:

Display:

- Explanation
- Recommended Action

Example:

```text
No reservations found.

Try another time or date.
```

---

# Loading States

Loading indicators shall appear for operations longer than:

```text
300ms
```

Skeleton screens are preferred over spinners whenever practical.

---

# Error Messages

Error messages shall:

- Explain the problem.
- Explain how to fix it.
- Avoid technical language.

Example:

```text
Unable to complete your reservation.

Please try another available time.
```

---

# Success Messages

Success messages should confirm completed actions.

Example:

```text
Your reservation has been confirmed.
```

---

# Notifications

Notifications shall be:

- Short
- Clear
- Actionable

Avoid unnecessary notifications.

---

# Accessibility

The interface shall support:

- Keyboard navigation
- Screen readers
- High contrast
- Responsive scaling
- Touch accessibility

Target:

WCAG 2.1 AA

---

# Responsive Breakpoints

| Device | Width |
|---------|------:|
| Mobile | 320px+ |
| Tablet | 768px+ |
| Desktop | 1024px+ |
| Large Desktop | 1440px+ |

---

# Animations

Animations shall:

- Improve understanding.
- Never delay interaction.
- Remain under:

```text
300ms
```

Reduced Motion preferences shall be respected.

---

# Confirmation Dialogs

Confirmation dialogs are required for:

- Reservation Cancellation
- Account Deletion
- Payment Submission
- Dangerous Administrative Actions

---

# Design Consistency

Every screen shall use:

- Common spacing
- Common typography
- Common buttons
- Common colors
- Common icons

Reusable UI components shall be preferred over custom implementations.

---

# Future Enhancements

Future versions may include:

- Dark Mode
- Theme Customization
- Voice Navigation
- AI Personalization
- Adaptive Interfaces
- Offline PWA Experience
- Gesture Navigation

---

# UI / UX Guidelines Summary

The Yoyaku interface is designed to make reservation booking effortless.

Every interaction should reduce friction, minimize cognitive load, and guide users naturally from search to confirmation while maintaining consistency, accessibility, and responsiveness across all supported devices.
