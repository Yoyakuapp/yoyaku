type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export default function Button({
  children,
  onClick,
  variant = "primary",
}: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-green-800 text-white border border-green-800"
      : "bg-white border border-green-800 text-green-800";

  return (
    <button
      onClick={onClick}
      className={`${styles} w-full rounded-2xl py-2.5 font-bold transition active:scale-[0.98]`}
    >
      {children}
    </button>
  );
}