import { z } from "zod";

import {
  bookingStaffNames,
  calculateBookingPrice,
  dateToUtcDateValue,
  dateToUtcTimeValue,
  getUtcDayRange,
  normalizeStaffGroup,
} from "@/lib/serverBookingAvailability";

export const createBookingRequestSchema = z.object({
  customer: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/),
  memo: z.string().trim().max(500).optional().default(""),
  date: z.string().datetime({ offset: true }),
  duration: z.union([
    z.literal(30),
    z.literal(60),
    z.literal(90),
    z.literal(120),
  ]),
  people: z.number().int().min(1).max(4),
  staff: z.string().trim().min(1).max(200),
});

export type CreateBookingRequest = z.infer<typeof createBookingRequestSchema>;

export function parseStaffNames(value: string) {
  const staffNames = bookingStaffNames(value);
  const uniqueStaffNames = new Set(staffNames);

  if (staffNames.length === 0 || uniqueStaffNames.size !== staffNames.length) {
    return null;
  }

  return staffNames;
}

export function parseBookingDate(value: string) {
  const bookingDate = new Date(value);

  if (Number.isNaN(bookingDate.getTime())) {
    return null;
  }

  const dateValue = dateToUtcDateValue(bookingDate);
  const timeValue = dateToUtcTimeValue(bookingDate);

  if (!getUtcDayRange(dateValue)) {
    return null;
  }

  if (!/^\d{2}:\d{2}$/.test(timeValue)) {
    return null;
  }

  if (bookingDate.getUTCMinutes() % 30 !== 0 || bookingDate.getUTCSeconds() !== 0) {
    return null;
  }

  return {
    bookingDate,
    dateValue,
    timeValue,
  };
}

export function normalizeBookingRequest(input: CreateBookingRequest) {
  const bookingDate = parseBookingDate(input.date);
  const staffNames = parseStaffNames(input.staff);

  if (!bookingDate || !staffNames || staffNames.length !== input.people) {
    return null;
  }

  const { totalPrice, deposit } = calculateBookingPrice(
    input.duration,
    input.people
  );

  return {
    bookingDate,
    staffNames,
    staffLabel: normalizeStaffGroup(staffNames).replace(/\+/g, " + "),
    menu: `${input.duration}分コース`,
    totalPrice,
    deposit,
  };
}
