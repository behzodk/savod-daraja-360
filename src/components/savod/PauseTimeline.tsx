import type { PauseEvent } from "@/lib/savod/types";

interface Props {
  totalSeconds: number;
  pauses: PauseEvent[];
}

export function PauseTimeline({ totalSeconds, pauses }: Props) {
  return (
    <div className="space-y-2">
      <div className="relative h-3 rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-info/60"
          style={{ width: "100%" }}
        />
        {pauses.map((p, i) => {
          const pct = (p.atTime / totalSeconds) * 100;
          return (
            <div
              key={i}
              className="absolute -top-1.5 -translate-x-1/2 group"
              style={{ left: `${pct}%` }}
            >
              <div className="h-6 w-2 rounded-sm bg-warn" />
              <div className="opacity-0 group-hover:opacity-100 transition absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground text-background px-2 py-1 text-xs">
                {p.durationSec.toFixed(1)} soniya pauza
              </div>
            </div>
          );
        })}
      </div>
      <ul className="text-xs text-muted-foreground space-y-1">
        {pauses.map((p, i) => {
          const mm = String(Math.floor(p.atTime / 60)).padStart(2, "0");
          const ss = (p.atTime % 60).toFixed(0).padStart(2, "0");
          return (
            <li key={i}>
              {mm}:{ss} — {p.durationSec.toFixed(1)} soniyalik pauza
            </li>
          );
        })}
      </ul>
    </div>
  );
}
