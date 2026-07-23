import type { ButtonHTMLAttributes, ReactNode } from "react";

import Spinner from "./Spinner";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "lg";
  isLoading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles = {
  primary: "border border-green-800 bg-green-800 text-white",
  secondary: "border border-green-800 bg-white text-green-800",
  ghost: "border border-transparent bg-transparent text-green-800",
  danger: "border border-red-700 bg-white text-red-700",
};

const sizeStyles = {
  md: "py-2.5",
  lg: "py-3.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${variantStyles[variant]} ${sizeStyles[size]} flex w-full items-center justify-center gap-2 rounded-2xl font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {isLoading ? <Spinner className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}
