import type { Dictionary } from "./types";

const nl: Dictionary = {
  languagePicker: {
    title: "Welke taal gebruikt u?",
    description: "Kies de taal die u wilt weergeven.",
    buttonLabel: "Taal kiezen",
  },
  bookingMenu: {
    when: {
      now: "Nu",
      today: "Vandaag",
      later: "Later",
    },
    storeOwnerLink: "Inloggen voor eigenaren",
    bookingDetails: "Reserveringsgegevens",
    bookingDate: "Datum",
    menuHeading: "Welke behandeling wilt u?",
    durationHeading: "Hoeveel minuten?",
    durationLabel: (minutes) => `${minutes} min`,
    peopleHeading: "Voor hoeveel personen?",
    peopleCount: (count) => `${count} ${count === 1 ? "persoon" : "personen"}`,
    menuError: "Het menu kon niet worden geladen.",
    availabilityCta: "Beschikbare tijden bekijken",
    uncategorizedLabel: "Overig",
  },
  signup: {
    title: "Winkel registreren",
    subtitle:
      "Vul onderstaande gegevens in en uw beheeromgeving is meteen klaar voor gebruik.",
    storeNameLabel: "Naam van de winkel",
    storeNamePlaceholder: "Sakura Massage",
    slugLabel: "URL-identificatie",
    slugHint: "Alleen kleine letters, cijfers en koppeltekens.",
    ownerNameLabel: "Uw naam",
    ownerNamePlaceholder: "Jan de Vries",
    emailLabel: "E-mailadres",
    emailHint: "Wordt gebruikt om in te loggen.",
    passwordLabel: "Wachtwoord",
    passwordHint: "Minimaal 12 tekens",
    passwordConfirmLabel: "Wachtwoord bevestigen",
    submitButton: "Registreren en starten",
    submitButtonLoading: "Bezig met registreren...",
    errorStoreNameRequired: "Voer een winkelnaam in.",
    errorSlugInvalid:
      "De URL-identificatie mag alleen kleine letters, cijfers en koppeltekens bevatten.",
    errorOwnerNameRequired: "Voer uw naam in.",
    errorEmailInvalid: "Voer een geldig e-mailadres in.",
    errorPasswordTooShort: "Het wachtwoord moet minimaal 12 tekens lang zijn.",
    errorPasswordMismatch: "De wachtwoorden komen niet overeen.",
    errorGeneric: "Registratie mislukt.",
  },
  admin: {
    common: {
      storeTopPageLink: "Openbare pagina van uw winkel",
    },
    dashboard: {
      pageTitle: "Winkelbeheer",
      todayStatusHeading: "Status vandaag",
      todaysBookingsLabel: "Reserveringen vandaag",
      availableSlotsLabel: "Beschikbare plekken",
      workingStaffLabel: "Personeel aanwezig",
      viewTodayCta: "Bekijk het rooster van vandaag →",
      bookingsListButton: "Reserveringen",
      scheduleButton: "Rooster",
      staffButton: "Personeel",
      menuButton: "Menu",
      storeButton: "Winkelgegevens",
      salesButton: "Omzet",
      customersButton: "Klanten",
      networkButton: "Winkelnetwerk",
    },
  },
};

export default nl;
