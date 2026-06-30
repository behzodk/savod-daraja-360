import { useEffect, useRef } from "react";

interface Props {
  level: number; // 0..1
  active: boolean;
  bars?: number;
}

export function AudioWaveform({ level, active, bars = 32 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const historyRef = useRef<number[]>(Array(bars).fill(0));

  useEffect(() => {
    if (!active) {
      historyRef.current = Array(bars).fill(0);
    }
  }, [active, bars]);

  if (active) {
    historyRef.current.shift();
    historyRef.current.push(level);
  }

  return (
    <div
      ref={ref}
      className="flex items-end gap-1 h-12 w-full max-w-xs"
      aria-hidden
    >
      {historyRef.current.map((l, i) => {
        const h = active ? Math.max(2, l * 48) : 2;
        return (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-[height] duration-75 ${
              active ? "bg-info" : "bg-border"
            }`}
            style={{ height: `${h}px` }}
          />
        );
      })}
    </div>
  );
}
