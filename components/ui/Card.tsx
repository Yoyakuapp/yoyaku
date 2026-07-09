type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-md p-4 ${className}`}
    >
      {children}
    </div>
  );
}