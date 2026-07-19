import type { ReactNode } from "react";

type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "bg-stone-100 text-stone-600",
  brand: "bg-green-50 text-green-800",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-mustard-50 text-mustard-700",
  danger: "bg-red-50 text-red-700",
};

export default function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
