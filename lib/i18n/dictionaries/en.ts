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
    peopleHeading: "How many people?",
    peopleCount: (count) => `${count} ${count === 1 ? "person" : "people"}`,
    menuError: "Couldn't load the menu.",
    availabilityCta: "See available times",
    uncategorizedLabel: "Other",
  },
};

export default en;
