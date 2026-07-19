type SpaIllustrationProps = {
  className?: string;
};

export default function SpaIllustration({
  className = "h-28 w-28",
}: SpaIllustrationProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="58" className="fill-green-50" />

      {/* stacked stones */}
      <ellipse cx="60" cy="86" rx="26" ry="9" className="fill-green-200" />
      <ellipse cx="63" cy="70" rx="19" ry="7.5" className="fill-green-300" />
      <ellipse cx="58" cy="56" rx="13" ry="5.5" className="fill-green-800" />

      {/* leaf */}
      <path
        d="M78 44c8-10 20-12 26-8-2 10-10 20-22 22-4-4-6-9-4-14Z"
        className="fill-mustard-400"
      />
      <path
        d="M80 46c6-6 14-8 20-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="text-mustard-600"
      />

      {/* steam */}
      <path
        d="M44 40c-3-4-3-8 0-12M52 38c-3-4-3-8 0-12M60 40c-3-4-3-8 0-12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="text-green-300"
      />
    </svg>
  );
}
