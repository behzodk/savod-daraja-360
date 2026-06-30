import { Check } from "lucide-react";

const steps = [
  { id: "setup", label: "Tayyorlash" },
  { id: "reading", label: "O‘qish" },
  { id: "retelling", label: "Qayta hikoya" },
  { id: "question", label: "Savol" },
  { id: "result", label: "Natija" },
];

export function AssessmentProgress({
  current,
}: {
  current: "setup" | "reading" | "retelling" | "question" | "result";
}) {
  const currentIdx = steps.findIndex((s) => s.id === current);
  return (
    <ol className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={s.id} className="flex items-center gap-1 sm:gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                done
                  ? "bg-success text-white"
                  : active
                    ? "bg-navy text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={`hidden sm:inline ${
                active ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={`mx-1 h-px w-4 sm:w-8 ${
                  done ? "bg-success" : "bg-border"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
