type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className = "h-4 w-full" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-stone-200 ${className}`}
      aria-hidden="true"
    />
  );
}
