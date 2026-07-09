export type Staff = {
  id: string;
  name: string;
  label: string;
  skills: string[];
  active: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  duration: number;
  price: number;
  active: boolean;
};

export type Shift = {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  active: boolean;
};

export type Booking = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  time: string;
  duration: number;
  people: number;
  staffNames: string[];
  totalPrice: number;
  deposit: number;
  status: "confirmed" | "cancelled";
};

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

export const menuItems: MenuItem[] = [
  {
    id: "m30",
    name: "タイ古式マッサージ 30分",
    duration: 30,
    price: 4500,
    active: true,
  },
  {
    id: "m60",
    name: "タイ古式マッサージ 60分",
    duration: 60,
    price: 9000,
    active: true,
  },
  {
    id: "m90",
    name: "タイ古式マッサージ 90分",
    duration: 90,
    price: 13500,
    active: true,
  },
  {
    id: "m120",
    name: "タイ古式マッサージ 120分",
    duration: 120,
    price: 18000,
    active: true,
  },
];

export const shifts: Shift[] = [
  {
    id: "s1",
    staffId: "aiko",
    date: "2026-07-09",
    startTime: "10:00",
    endTime: "18:00",
    active: true,
  },
  {
    id: "s2",
    staffId: "emi",
    date: "2026-07-09",
    startTime: "10:00",
    endTime: "20:00",
    active: true,
  },
  {
    id: "s3",
    staffId: "yuna",
    date: "2026-07-09",
    startTime: "11:00",
    endTime: "19:00",
    active: true,
  },
];

export const bookings: Booking[] = [
  {
    id: "YOYAKU-0001",
    customerName: "山田 太郎",
    customerPhone: "090-1234-5678",
    customerEmail: "taro@example.com",
    date: "2026-07-09",
    time: "10:30",
    duration: 60,
    people: 1,
    staffNames: ["AIKO"],
    totalPrice: 9000,
    deposit: 1350,
    status: "confirmed",
  },
  {
    id: "YOYAKU-0002",
    customerName: "佐藤 花子",
    customerPhone: "080-2222-3333",
    customerEmail: "hanako@example.com",
    date: "2026-07-09",
    time: "14:00",
    duration: 90,
    people: 2,
    staffNames: ["EMI", "YUNA"],
    totalPrice: 27000,
    deposit: 4050,
    status: "confirmed",
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

export function getMenuByDuration(duration: number) {
  return menuItems.find((menu) => menu.duration === duration);
}

export function getStaffById(staffId: string) {
  return staffList.find((staff) => staff.id === staffId);
}

export function isStaffWorking(staffId: string, date: string, time: string) {
  const shift = shifts.find(
    (item) => item.staffId === staffId && item.date === date && item.active
  );

  if (!shift) return false;

  const current = timeToMinutes(time);

  return (
    current >= timeToMinutes(shift.startTime) &&
    current < timeToMinutes(shift.endTime)
  );
}

export function isStaffBooked(staffName: string, date: string, time: string) {
  const current = timeToMinutes(time);

  return bookings.some((booking) => {
    if (booking.status !== "confirmed") return false;
    if (booking.date !== date) return false;
    if (!booking.staffNames.includes(staffName)) return false;

    const start = timeToMinutes(booking.time);
    const end = start + booking.duration;

    return current >= start && current < end;
  });
}

export function isStaffAvailable(
  staffId: string,
  date: string,
  time: string
) {
  const staff = getStaffById(staffId);

  if (!staff) return false;
  if (!staff.active) return false;

  return (
    isStaffWorking(staffId, date, time) &&
    !isStaffBooked(staff.name, date, time)
  );
}

export function canStaffTakeDuration(
  staffId: string,
  date: string,
  startTime: string,
  duration: number
) {
  const times = createTimes();
  const startIndex = times.indexOf(startTime);
  const slotsNeeded = Math.ceil(duration / 30);

  if (startIndex < 0) return false;
  if (startIndex + slotsNeeded > times.length) return false;

  for (let index = 0; index < slotsNeeded; index++) {
    const time = times[startIndex + index];

    if (!isStaffAvailable(staffId, date, time)) {
      return false;
    }
  }

  return true;
}

export function availableStaffAtTime(
  date: string,
  time: string,
  duration: number
) {
  return staffList.filter((staff) =>
    canStaffTakeDuration(staff.id, date, time, duration)
  );
}

export function combinations<T>(items: T[], count: number): T[][] {
  if (count <= 1) return items.map((item) => [item]);
  if (count > items.length) return [];

  const result: T[][] = [];

  function walk(start: number, current: T[]) {
    if (current.length === count) {
      result.push(current);
      return;
    }

    for (let index = start; index < items.length; index++) {
      walk(index + 1, [...current, items[index]]);
    }
  }

  walk(0, []);
  return result;
}

export function availableGroupsAtTime(
  date: string,
  time: string,
  duration: number,
  people: number
) {
  return combinations(availableStaffAtTime(date, time, duration), people);
}

export function calculatePrice(duration: number, people: number) {
  const menu = getMenuByDuration(duration);
  const price = menu?.price ?? duration * 150;
  const totalPrice = price * people;
  const deposit = Math.round(totalPrice * 0.15);

  return {
    price,
    totalPrice,
    deposit,
  };
}