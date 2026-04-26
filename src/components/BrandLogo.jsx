import React from "react";
import { Orbit, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

export const BRAND_NAME = "SpoySync";

export function BrandMark({ className = "", iconClassName = "", glow = true }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-2xl border border-white/10 bg-[#04131a]",
        glow && "shadow-[0_0_28px_rgba(34,211,238,0.25)]",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle at 30% 30%, rgba(34,211,238,0.22), transparent 45%), linear-gradient(135deg, #0f766e, #0f172a 55%, #22c55e)",
      }}
    >
      <Orbit className={cn("absolute text-cyan-200/70", iconClassName)} strokeWidth={1.8} />
      <Radio className={cn("relative text-white", iconClassName)} strokeWidth={2.3} />
    </div>
  );
}

export function BrandWordmark({ className = "" }) {
  return (
    <span
      className={cn("font-black tracking-tight", className)}
      style={{
        background: "linear-gradient(135deg, #ecfeff, #67e8f9 40%, #86efac 95%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {BRAND_NAME}
    </span>
  );
}

export default function BrandLogo({
  to = "/",
  className = "",
  markClassName = "h-9 w-9",
  iconClassName = "h-4 w-4",
  wordmarkClassName = "text-xl",
  showTagline = false,
}) {
  const content = (
    <>
      <BrandMark className={markClassName} iconClassName={iconClassName} />
      <div className="min-w-0">
        <BrandWordmark className={wordmarkClassName} />
        {showTagline && (
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100/55">
            Live event sync
          </div>
        )}
      </div>
    </>
  );

  if (!to) {
    return <div className={cn("flex items-center gap-3", className)}>{content}</div>;
  }

  return (
    <Link to={to} className={cn("flex items-center gap-3", className)}>
      {content}
    </Link>
  );
}
