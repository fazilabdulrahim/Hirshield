interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({ size = 36, className = '', showText = false, textClassName = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0EA5E9" />
            <stop offset="1" stopColor="#0369A1" />
          </linearGradient>
          <linearGradient id="shieldHighlight" x1="14" y1="6" x2="34" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="1" stopColor="#0284C7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M24 2L6 8v12c0 11 7.5 19.5 18 26 10.5-6.5 18-15 18-26V8L24 2z"
          fill="url(#shieldGrad)"
        />
        <path
          d="M24 2L6 8v12c0 11 7.5 19.5 18 26 10.5-6.5 18-15 18-26V8L24 2z"
          fill="url(#shieldHighlight)"
        />
        <path
          d="M24 5L9 10v10c0 9.5 6.5 17 15 23 8.5-6 15-13.5 15-23V10L24 5z"
          stroke="#7DD3FC"
          strokeWidth="0.5"
          strokeOpacity="0.4"
          fill="none"
        />
        <path
          d="M16.5 24.5L21 29l10-11"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <div className={textClassName}>
          <span className="font-bold tracking-tight">HIRESHIELD</span>
        </div>
      )}
    </div>
  );
}
