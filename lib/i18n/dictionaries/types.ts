export type Dictionary = {
  languagePicker: {
    title: string;
    description: string;
    buttonLabel: string;
  };
  bookingMenu: {
    when: {
      now: string;
      today: string;
      later: string;
    };
    storeOwnerLink: string;
    bookingDetails: string;
    bookingDate: string;
    menuHeading: string;
    durationHeading: string;
    durationLabel: (minutes: number) => string;
    peopleHeading: string;
    peopleCount: (count: number) => string;
    menuError: string;
    availabilityCta: string;
    uncategorizedLabel: string;
  };
  signup: {
    title: string;
    subtitle: string;
    storeNameLabel: string;
    storeNamePlaceholder: string;
    slugLabel: string;
    slugHint: string;
    ownerNameLabel: string;
    ownerNamePlaceholder: string;
    emailLabel: string;
    emailHint: string;
    passwordLabel: string;
    passwordHint: string;
    passwordConfirmLabel: string;
    submitButton: string;
    submitButtonLoading: string;
    errorStoreNameRequired: string;
    errorSlugInvalid: string;
    errorOwnerNameRequired: string;
    errorEmailInvalid: string;
    errorPasswordTooShort: string;
    errorPasswordMismatch: string;
    errorGeneric: string;
  };
  admin: {
    dashboard: {
      pageTitle: string;
      todayStatusHeading: string;
      todaysBookingsLabel: string;
      availableSlotsLabel: string;
      workingStaffLabel: string;
      viewTodayCta: string;
      bookingsListButton: string;
      scheduleButton: string;
      staffButton: string;
      menuButton: string;
      storeButton: string;
      salesButton: string;
      customersButton: string;
      networkButton: string;
    };
  };
};
