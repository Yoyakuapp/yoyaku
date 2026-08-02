import type { Dictionary } from "./types";

const fr: Dictionary = {
  languagePicker: {
    title: "Quelle langue utilisez-vous ?",
    description: "Choisissez la langue d'affichage souhaitée.",
    buttonLabel: "Choisir la langue",
  },
  bookingMenu: {
    when: {
      now: "Maintenant",
      today: "Aujourd'hui",
      later: "Plus tard",
    },
    storeOwnerLink: "Connexion propriétaire",
    bookingDetails: "Détails de la réservation",
    bookingDate: "Date",
    menuHeading: "Quelle prestation souhaitez-vous ?",
    durationHeading: "Combien de minutes ?",
    durationLabel: (minutes) => `${minutes} min`,
    peopleHeading: "Pour combien de personnes ?",
    peopleCount: (count) =>
      `${count} ${count === 1 ? "personne" : "personnes"}`,
    menuError: "Impossible de charger le menu.",
    availabilityCta: "Voir les créneaux disponibles",
    uncategorizedLabel: "Autre",
  },
  signup: {
    title: "Inscription de l'établissement",
    subtitle:
      "Renseignez les informations ci-dessous et votre espace d'administration sera immédiatement prêt.",
    storeNameLabel: "Nom de l'établissement",
    storeNamePlaceholder: "Sakura Massage",
    slugLabel: "Identifiant d'URL",
    slugHint: "Lettres minuscules, chiffres et tirets uniquement.",
    ownerNameLabel: "Votre nom",
    ownerNamePlaceholder: "Jean Dupont",
    emailLabel: "Adresse e-mail",
    emailHint: "Utilisée pour la connexion.",
    passwordLabel: "Mot de passe",
    passwordHint: "12 caractères minimum",
    passwordConfirmLabel: "Confirmer le mot de passe",
    submitButton: "S'inscrire et commencer",
    submitButtonLoading: "Inscription en cours...",
    errorStoreNameRequired: "Veuillez saisir le nom de l'établissement.",
    errorSlugInvalid:
      "L'identifiant d'URL ne peut contenir que des lettres minuscules, des chiffres et des tirets.",
    errorOwnerNameRequired: "Veuillez saisir votre nom.",
    errorEmailInvalid: "Veuillez saisir une adresse e-mail valide.",
    errorPasswordTooShort: "Le mot de passe doit contenir au moins 12 caractères.",
    errorPasswordMismatch: "Les mots de passe ne correspondent pas.",
    errorGeneric: "Échec de l'inscription.",
  },
  storeApplication: {
    title: "Demande d'utilisation",
    subtitle:
      "Les établissements souhaitant utiliser Yoyakus peuvent postuler via le formulaire ci-dessous. Nous enverrons les instructions d'inscription à l'adresse e-mail indiquée.",
    storeNameLabel: "Nom de l'établissement",
    applicantNameLabel: "Votre nom",
    emailLabel: "Adresse e-mail",
    emailHint:
      "Nous enverrons les instructions d'inscription à cette adresse e-mail.",
    phoneLabel: "Numéro de téléphone (facultatif)",
    messageLabel: "Remarques (facultatif)",
    turnstileRequiredError: "Veuillez terminer la vérification.",
    submitButton: "Envoyer la demande",
    submitButtonLoading: "Envoi en cours...",
    errorGeneric: "La demande a échoué.",
  },
  passwordResetRequest: {
    title: "Mot de passe oublié ?",
    subtitle:
      "Saisissez votre adresse e-mail enregistrée. Nous vous enverrons un lien pour réinitialiser votre mot de passe.",
    emailLabel: "Adresse e-mail",
    turnstileRequiredError: "Veuillez terminer la vérification.",
    submitButton: "Envoyer l'e-mail de réinitialisation",
    submitButtonLoading: "Envoi en cours...",
    backToLoginLink: "Retour à la connexion",
    errorGeneric: "Échec de l'envoi.",
  },
  admin: {
    common: {
      storeTopPageLink: "Page publique de votre établissement",
    },
    dashboard: {
      pageTitle: "Gestion de l'établissement",
      todayStatusHeading: "Situation du jour",
      todaysBookingsLabel: "Réservations du jour",
      availableSlotsLabel: "Créneaux libres",
      workingStaffLabel: "Personnel présent",
      viewTodayCta: "Voir le planning du jour →",
      bookingsListButton: "Réservations",
      scheduleButton: "Planning",
      staffButton: "Praticiens",
      menuButton: "Menu",
      storeButton: "Informations",
      salesButton: "Ventes",
      customersButton: "Clients",
      networkButton: "Réseau d'établissements",
      accountButton: "Identifiants de connexion",
    },
  },
};

export default fr;
