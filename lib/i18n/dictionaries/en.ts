import type { Dictionary } from "./types";

const en: Dictionary = {
  languagePicker: {
    title: "Which language do you use?",
    description: "Choose the language you'd like to see.",
    buttonLabel: "Select language",
  },
  bookingMenu: {
    when: {
      now: "Now",
      today: "Today",
      later: "Later",
    },
    storeOwnerLink: "Store owner login",
    bookingDetails: "Booking details",
    bookingDate: "Date",
    menuHeading: "Which menu would you like?",
    durationHeading: "How many minutes?",
    durationLabel: (minutes) => `${minutes} min`,
    peopleHeading: "How many people?",
    peopleCount: (count) => `${count} ${count === 1 ? "person" : "people"}`,
    menuError: "Couldn't load the menu.",
    availabilityCta: "See available times",
    uncategorizedLabel: "Other",
  },
  signup: {
    title: "Store registration",
    subtitle:
      "Fill in the details below and your admin dashboard will be ready right away.",
    storeNameLabel: "Store name",
    storeNamePlaceholder: "Sakura Massage",
    slugLabel: "URL identifier",
    slugHint: "Lowercase letters, numbers, and hyphens only.",
    ownerNameLabel: "Your name",
    ownerNamePlaceholder: "Jane Smith",
    emailLabel: "Email address",
    emailHint: "Used to log in.",
    passwordLabel: "Password",
    passwordHint: "At least 12 characters",
    passwordConfirmLabel: "Confirm password",
    submitButton: "Register and get started",
    submitButtonLoading: "Registering...",
    errorStoreNameRequired: "Please enter a store name.",
    errorSlugInvalid:
      "The URL identifier can only contain lowercase letters, numbers, and hyphens.",
    errorOwnerNameRequired: "Please enter your name.",
    errorEmailInvalid: "Please enter a valid email address.",
    errorPasswordTooShort: "Password must be at least 12 characters.",
    errorPasswordMismatch: "Passwords do not match.",
    errorGeneric: "Registration failed.",
  },
  admin: {
    common: {
      storeTopPageLink: "Your store's public page",
    },
    dashboard: {
      pageTitle: "Store management",
      todayStatusHeading: "Today's status",
      todaysBookingsLabel: "Bookings today",
      availableSlotsLabel: "Open slots",
      workingStaffLabel: "Staff on duty",
      viewTodayCta: "View today's schedule →",
      bookingsListButton: "Bookings",
      scheduleButton: "Schedule",
      staffButton: "Staff",
      menuButton: "Menu",
      storeButton: "Store info",
      salesButton: "Sales",
      customersButton: "Customers",
      networkButton: "Store network",
    },
  },
};

export default en;
