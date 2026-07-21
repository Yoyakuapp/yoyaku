import type { Dictionary } from "./types";

const es: Dictionary = {
  languagePicker: {
    title: "¿Qué idioma utiliza?",
    description: "Elija el idioma que desea ver.",
    buttonLabel: "Elegir idioma",
  },
  bookingMenu: {
    when: {
      now: "Ahora",
      today: "Hoy",
      later: "Más tarde",
    },
    storeOwnerLink: "Acceso para el establecimiento",
    bookingDetails: "Detalles de la reserva",
    bookingDate: "Fecha",
    menuHeading: "¿Qué servicio desea?",
    durationHeading: "¿Cuántos minutos?",
    durationLabel: (minutes) => `${minutes} min`,
    peopleHeading: "¿Para cuántas personas?",
    peopleCount: (count) => `${count} ${count === 1 ? "persona" : "personas"}`,
    menuError: "No se pudo cargar el menú.",
    availabilityCta: "Ver horarios disponibles",
    uncategorizedLabel: "Otros",
  },
  signup: {
    title: "Registro del establecimiento",
    subtitle:
      "Complete los siguientes datos y su panel de administración estará listo de inmediato.",
    storeNameLabel: "Nombre del establecimiento",
    storeNamePlaceholder: "Sakura Massage",
    slugLabel: "Identificador de URL",
    slugHint: "Solo letras minúsculas, números y guiones.",
    ownerNameLabel: "Su nombre",
    ownerNamePlaceholder: "María García",
    emailLabel: "Correo electrónico",
    emailHint: "Se utiliza para iniciar sesión.",
    passwordLabel: "Contraseña",
    passwordHint: "Al menos 12 caracteres",
    passwordConfirmLabel: "Confirmar contraseña",
    submitButton: "Registrarse y comenzar",
    submitButtonLoading: "Registrando...",
    errorStoreNameRequired: "Ingrese el nombre del establecimiento.",
    errorSlugInvalid:
      "El identificador de URL solo puede contener letras minúsculas, números y guiones.",
    errorOwnerNameRequired: "Ingrese su nombre.",
    errorEmailInvalid: "Ingrese una dirección de correo electrónico válida.",
    errorPasswordTooShort: "La contraseña debe tener al menos 12 caracteres.",
    errorPasswordMismatch: "Las contraseñas no coinciden.",
    errorGeneric: "Error en el registro.",
  },
  admin: {
    common: {
      storeTopPageLink: "Página pública de su establecimiento",
    },
    dashboard: {
      pageTitle: "Gestión del establecimiento",
      todayStatusHeading: "Estado de hoy",
      todaysBookingsLabel: "Reservas de hoy",
      availableSlotsLabel: "Horarios disponibles",
      workingStaffLabel: "Personal en turno",
      viewTodayCta: "Ver el horario de hoy →",
      bookingsListButton: "Reservas",
      scheduleButton: "Horarios",
      staffButton: "Personal",
      menuButton: "Menú",
      storeButton: "Datos del establecimiento",
      salesButton: "Ventas",
      customersButton: "Clientes",
      networkButton: "Red de establecimientos",
    },
  },
};

export default es;
