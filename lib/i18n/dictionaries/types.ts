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
    peopleHeading: string;
    peopleCount: (count: number) => string;
    menuError: string;
    availabilityCta: string;
    uncategorizedLabel: string;
  };
};
