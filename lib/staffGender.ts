export const STAFF_GENDER_OPTIONS = ["male", "female", "other"] as const;

export type StaffGender = (typeof STAFF_GENDER_OPTIONS)[number];

export const STAFF_GENDER_LABELS: Record<StaffGender, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
};

export function isStaffGender(value: unknown): value is StaffGender {
  return (
    typeof value === "string" &&
    (STAFF_GENDER_OPTIONS as readonly string[]).includes(value)
  );
}
