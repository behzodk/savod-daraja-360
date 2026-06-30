import type { ConceptNode, ConceptRelation } from "@/lib/savod/types";

interface Props {
  concepts: ConceptNode[];
  relations: ConceptRelation[];
  detectedConcepts: string[];
  missingConcepts: string[];
  detectedRelations: string[]; // "from->to"
  missingRelations: string[];
}

export function ConceptMap({
  concepts,
  relations,
  detectedConcepts,
  detectedRelations,
}: Props) {
  return (
    <div className="space-y-3">
      <ol className="space-y-2">
        {concepts.map((c, i) => {
          const detected = detectedConcepts.includes(c.id);
          const nextRel = relations.find((r) => r.from === c.id);
          const relKey = nextRel ? `${nextRel.from}->${nextRel.to}` : null;
          const relDetected = relKey ? detectedRelations.includes(relKey) : true;
          return (
            <li key={c.id} className="flex flex-col">
              <div
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                  detected
                    ? "bg-success-soft border-success/30"
                    : "bg-danger-soft/40 border-danger/30 border-dashed"
                }`}
              >
                <span
                  className="h-6 w-6 rounded-full text-xs font-semibold flex items-center justify-center"
                  style={{
                    background: detected ? "var(--success)" : "var(--danger)",
                    color: "white",
                  }}
                >
                  {i + 1}
                </span>
                <span className="font-medium text-foreground">{c.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {detected ? "Aniqlandi" : "Yetishmayapti"}
                </span>
              </div>
              {nextRel && (
                <div className="flex justify-start pl-3 my-1">
                  <div
                    className={`h-6 w-px ${
                      relDetected ? "bg-success" : "border-l-2 border-dashed border-danger"
                    }`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
