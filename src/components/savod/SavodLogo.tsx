import { Link } from "@tanstack/react-router";

export function SavodLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2 font-display font-bold text-navy ${className}`}
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-navy">
        <span className="text-[10px] font-semibold tracking-tight">360</span>
      </span>
      <span className="text-lg tracking-tight">Savod<span className="text-info">360</span></span>
    </Link>
  );
}
