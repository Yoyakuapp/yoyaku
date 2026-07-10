import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const styles =
    variant === "primary"
      ? "border border-green-800 bg-green-800 text-white"
      : "border border-green-800 bg-white text-green-800";

  return (
    <button
      type={type}
      className={`${styles} w-full rounded-2xl py-2.5 font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}