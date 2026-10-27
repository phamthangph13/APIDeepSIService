import { Link } from "react-router-dom";

type LogoProps = {
  compact?: boolean;
  light?: boolean;
  className?: string;
};

export function Logo({ compact = false, light = false, className = "" }: LogoProps) {
  return (
    <Link
      to="/"
      className={`logo${compact ? " logo--compact" : ""}${light ? " logo--light" : ""}${className ? ` ${className}` : ""}`}
      aria-label="DeepSI Agent — về trang chủ"
    >
      <span className="logo__mark" aria-hidden="true">
        D
        <span className="logo__dot" />
      </span>
      {!compact && (
        <span className="logo__type">
          <strong>DeepSI</strong>
          <em>Agent</em>
        </span>
      )}
    </Link>
  );
}
