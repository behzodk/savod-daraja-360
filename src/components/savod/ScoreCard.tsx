import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  title: string;
  score: number;
  status: string;
  tone: "success" | "warn" | "danger" | "info";
  emphasized?: boolean;
  children?: ReactNode;
}

const toneMap = {
  success: { color: "var(--success)", soft: "var(--success-soft)" },
  warn: { color: "var(--warn)", soft: "var(--warn-soft)" },
  danger: { color: "var(--danger)", soft: "var(--danger-soft)" },
  info: { color: "var(--info)", soft: "var(--info-soft)" },
};

export function ScoreCard({ title, score, status, tone, emphasized, children }: Props) {
  const t = toneMap[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border bg-card p-6 ${
        emphasized ? "ring-2 shadow-md" : ""
      }`}
      style={emphasized ? { borderColor: t.color } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          <div className="mt-2 flex items-end gap-1">
            <span
              className="text-5xl font-display font-bold tabular-nums"
              style={{ color: t.color }}
            >
              {score}
            </span>
            <span className="text-muted-foreground mb-1">/100</span>
          </div>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ background: t.soft, color: t.color }}
        >
          {status}
        </span>
      </div>
      {children && (
        <div className="mt-4 space-y-1 text-sm text-muted-foreground">
          {children}
        </div>
      )}
    </motion.div>
  );
}
