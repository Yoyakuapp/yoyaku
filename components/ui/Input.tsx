import type { InputHTMLAttributes } from "react";

type InputProps = {
  label?: string;
  error?: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={id} className="block text-sm font-bold text-stone-800">
          {label}
        </label>
      ) : null}

      <input
        id={id}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
            : "border-stone-300 focus:border-green-800 focus:ring-green-800/10"
        } ${className}`}
        aria-invalid={error ? true : undefined}
        {...props}
      />

      {error ? (
        <p className="text-xs font-bold text-red-700">{error}</p>
      ) : hint ? (
        <p className="text-xs text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
}
