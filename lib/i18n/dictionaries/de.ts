import type { Dictionary } from "./types";

const de: Dictionary = {
  languagePicker: {
    title: "Welche Sprache möchten Sie verwenden?",
    description: "Wählen Sie die gewünschte Anzeigesprache.",
    buttonLabel: "Sprache wählen",
  },
  bookingMenu: {
    when: {
      now: "Jetzt",
      today: "Heute",
      later: "Später",
    },
    storeOwnerLink: "Anmeldung für Geschäftsinhaber",
    bookingDetails: "Buchungsdetails",
    bookingDate: "Datum",
    menuHeading: "Welche Behandlung möchten Sie?",
    durationHeading: "Wie viele Minuten?",
    durationLabel: (minutes) => `${minutes} Min.`,
    peopleHeading: "Für wie viele Personen?",
    peopleCount: (count) => `${count} ${count === 1 ? "Person" : "Personen"}`,
    menuError: "Das Menü konnte nicht geladen werden.",
    availabilityCta: "Verfügbare Zeiten ansehen",
    uncategorizedLabel: "Sonstiges",
  },
  signup: {
    title: "Geschäft registrieren",
    subtitle:
      "Füllen Sie die folgenden Angaben aus, und Ihr Verwaltungsbereich ist sofort einsatzbereit.",
    storeNameLabel: "Name des Geschäfts",
    storeNamePlaceholder: "Sakura Massage",
    slugLabel: "URL-Kennung",
    slugHint: "Nur Kleinbuchstaben, Zahlen und Bindestriche.",
    ownerNameLabel: "Ihr Name",
    ownerNamePlaceholder: "Anna Schmidt",
    emailLabel: "E-Mail-Adresse",
    emailHint: "Wird zum Anmelden verwendet.",
    passwordLabel: "Passwort",
    passwordHint: "Mindestens 12 Zeichen",
    passwordConfirmLabel: "Passwort bestätigen",
    submitButton: "Registrieren und loslegen",
    submitButtonLoading: "Registrierung läuft...",
    errorStoreNameRequired: "Bitte geben Sie einen Geschäftsnamen ein.",
    errorSlugInvalid:
      "Die URL-Kennung darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.",
    errorOwnerNameRequired: "Bitte geben Sie Ihren Namen ein.",
    errorEmailInvalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    errorPasswordTooShort: "Das Passwort muss mindestens 12 Zeichen lang sein.",
    errorPasswordMismatch: "Die Passwörter stimmen nicht überein.",
    errorGeneric: "Registrierung fehlgeschlagen.",
  },
  admin: {
    common: {
      storeTopPageLink: "Öffentliche Seite Ihres Geschäfts",
    },
    dashboard: {
      pageTitle: "Geschäftsverwaltung",
      todayStatusHeading: "Heutiger Stand",
      todaysBookingsLabel: "Buchungen heute",
      availableSlotsLabel: "Freie Termine",
      workingStaffLabel: "Personal im Dienst",
      viewTodayCta: "Heutigen Terminplan ansehen →",
      bookingsListButton: "Buchungen",
      scheduleButton: "Dienstplan",
      staffButton: "Personal",
      menuButton: "Menü",
      storeButton: "Geschäftsdaten",
      salesButton: "Umsatz",
      customersButton: "Kunden",
      networkButton: "Filialverbund",
    },
  },
};

export default de;
