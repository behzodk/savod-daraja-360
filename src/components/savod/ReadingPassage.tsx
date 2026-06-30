import { motion } from "framer-motion";
import type { PassageWord, WordStatus } from "@/lib/savod/types";
import { Repeat } from "lucide-react";

const statusClass: Record<WordStatus, string> = {
  unread: "text-foreground/80",
  current: "bg-info-soft text-navy rounded-md ring-1 ring-info/40",
  correct: "text-success-700",
  omitted: "text-danger line-through decoration-2 decoration-danger/70",
  substituted: "text-danger",
  hesitation: "bg-warn-soft text-foreground rounded-md",
  repeated: "text-info",
};

// Custom tailwind doesn't have success-700 by default; map to var
const inlineStatus: Record<WordStatus, React.CSSProperties> = {
  unread: {},
  current: {},
  correct: { color: "var(--success)" },
  omitted: {},
  substituted: {},
  hesitation: {},
  repeated: {},
};

export function ReadingWord({
  word,
  onClick,
}: {
  word: PassageWord;
  onClick?: () => void;
}) {
  return (
    <motion.span
      layout="position"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 cursor-default transition-colors ${statusClass[word.status]}`}
      style={inlineStatus[word.status]}
    >
      {word.text}
      {word.status === "substituted" && word.detectedText && (
        <span className="ml-1 text-xs rounded bg-danger-soft px-1.5 py-0.5 text-danger font-medium">
          {word.detectedText}
        </span>
      )}
      {word.status === "repeated" && <Repeat className="inline h-3 w-3" />}
    </motion.span>
  );
}

export function ReadingPassage({
  words,
  onWordClick,
}: {
  words: PassageWord[];
  onWordClick?: (w: PassageWord) => void;
}) {
  return (
    <div className="reading-text max-w-3xl mx-auto leading-loose select-none">
      {words.map((w) => (
        <ReadingWord key={w.id} word={w} onClick={() => onWordClick?.(w)} />
      ))}
    </div>
  );
}
