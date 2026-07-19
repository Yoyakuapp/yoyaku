import type { SVGProps } from "react";

export type IconName =
  | "clock"
  | "calendar"
  | "phone"
  | "location"
  | "user"
  | "users"
  | "check"
  | "check-circle"
  | "chevron-right"
  | "chevron-left"
  | "chevron-down"
  | "close"
  | "search"
  | "star"
  | "menu"
  | "info"
  | "warning"
  | "message";

const paths: Record<IconName, React.ReactNode> = {
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </>
  ),
  phone: (
    <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
  ),
  location: (
    <>
      <path d="M12 21s-7-6.2-7-11.3A7 7 0 0 1 19 9.7C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 19a6.5 6.5 0 0 1 13 0" />
      <path d="M15.5 5.5a3 3 0 0 1 0 5.8" />
      <path d="M17.5 13.2a6.5 6.5 0 0 1 4 5.8" />
    </>
  ),
  check: <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M7.5 12.5 10.5 15.5 16.5 9" />
    </>
  ),
  "chevron-right": <path d="M9 5.5 15.5 12 9 18.5" />,
  "chevron-left": <path d="M15 5.5 8.5 12 15 18.5" />,
  "chevron-down": <path d="M5.5 9 12 15.5 18.5 9" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.8-4.8" />
    </>
  ),
  star: (
    <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17l-5.2 2.8 1-5.9-4.3-4.2 5.9-.8Z" />
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 8v.01" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3.5 21.5 20h-19Z" />
      <path d="M12 9.5v4.5M12 17v.01" />
    </>
  ),
  message: (
    <path d="M4 5.5h16v11H9.5L5.5 20v-3.5H4Z" />
  ),
};

type IconProps = {
  name: IconName;
} & Omit<SVGProps<SVGSVGElement>, "children">;

export default function Icon({ name, className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
