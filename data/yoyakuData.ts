import type { Staff, Shift } from "@/types/yoyaku";

export const staffList: Staff[] = [
  {
    id: "aiko",
    name: "AIKO",
    label: "強め・肩首",
    skills: ["肩こり", "首", "強め"],
    active: true,
  },
  {
    id: "emi",
    name: "EMI",
    label: "リラックス",
    skills: ["疲労回復", "リラックス"],
    active: true,
  },
  {
    id: "yuna",
    name: "YUNA",
    label: "ストレッチ",
    skills: ["全身", "ストレッチ"],
    active: true,
  },
];

export const shifts: Shift[] = [
  {
    staffId: "aiko",
    date: "2026-07-09",
    startTime: "10:00",
    endTime: "18:00",
  },
  {
    staffId: "emi",
    date: "2026-07-09",
    startTime: "10:30",
    endTime: "20:00",
  },
  {
    staffId: "yuna",
    date: "2026-07-09",
    startTime: "11:00",
    endTime: "19:00",
  },
];

export const bookings = [
  {
    id: "b001",
    staffId: "aiko",
    date: "2026-07-09",
    startTime: "12:00",
    endTime: "13:00",
  },
  {
    id: "b002",
    staffId: "emi",
    date: "2026-07-09",
    startTime: "14:30",
    endTime: "15:30",
  },
];

export function createTimes() {
  return Array.from({ length: 21 }, (_, index) => {
    const totalMinutes = 10 * 60 + index * 30;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  });
}

export function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function isStaffWorking(
  staffId: string,
  date: string,
  time: string
) {
  const shift = shifts.find(
    (item) => item.staffId === staffId && item.date === date
  );

  if (!shift) return false;

  const current = timeToMinutes(time);
  return (
    current >= timeToMinutes(shift.startTime) &&
    current < timeToMinutes(shift.endTime)
  );
}

export function isStaffBooked(
  staffId: string,
  date: string,
  time: string
) {
  const current = timeToMinutes(time);

  return bookings.some((booking) => {
    if (booking.staffId !== staffId) return false;
    if (booking.date !== date) return false;

    return (
      current >= timeToMinutes(booking.startTime) &&
      current < timeToMinutes(booking.endTime)
    );
  });
}

export function isStaffAvailable(
  staffId: string,
  date: string,
  time: string
) {
  return (
    isStaffWorking(staffId, date, time) &&
    !isStaffBooked(staffId, date, time)
  );
}

export function availableStaffAt(date: string, time: string) {
  return staffList.filter((staff) =>
    isStaffAvailable(staff.id, date, time)
  );
}