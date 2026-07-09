export type Staff = {
  id: string;
  name: string;
  label: string;
  skills: string[];
  active: boolean;
};

export type Shift = {
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
};

export type Menu = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  active: boolean;
};

export type BookingCondition = {
  when: "今すぐ" | "今日" | "後日";
  durationMinutes: number;
  peopleCount: number;
  date: string;
};

export type AvailabilitySlot = {
  time: string;
  staffNames: string[];
};

export type Booking = {
  id: string;
  storeId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  durationMinutes: number;
  peopleCount: number;
  staffNames: string[];
  status: "pending" | "confirmed" | "cancelled";
};