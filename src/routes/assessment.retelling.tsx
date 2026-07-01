import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { demoProfiles, passages } from "@/lib/savod/data";
import { useSavod } from "@/lib/savod/store";
import { AudioRecorder } from "@/components/savod/AudioRecorder";
import { ConceptMap } from "@/components/savod/ConceptMap";
import { transcribeAudio } from "@/lib/savod/speech.functions";

export const Route = createFileRoute("/assessment/retelling")({
  component: Retelling,
});

type Stage = "transition" | "recording" | "processing" | "review";

function Retelling() {
  const navigate = useNavigate();
  const { draft, setDraft } = useSavod();
  const profile = demoProfiles.find((p) => p.id === draft.demoProfileId) ?? demoProfiles[0];
  const passage = passages.find((p) => p.id === draft.passageId) ?? passages[0];

  const [stage, setStage] = useState<Stage>("transition");
  const [transcript, setTranscript] = useState("");
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    if (stage === "transition") {
      const t = setTimeout(() => setStage("recording"), 1800);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const handleRecordingComplete = async (blob: Blob) => {
    setStage("processing");
    setProcessingStep(1);
    setTranscribeError(null);
    try {
      const form = new FormData();
      form.append("audio", blob, "retelling.webm");
      form.append("languageCode", "uz");
      const result = await transcribeAudio({ data: form });
      setProcessingStep(2);
      setTranscript(result.text);
      setDraft({ retellingTranscript: result.text });
    } catch (err) {
      console.error(err);
      setTranscribeError(
        err instanceof Error ? err.message : "Nutqni tanib bo‘lish muvaffaqiyatsiz tugadi.",
      );
      setTranscript("");
    }
    setProcessingStep(3);
    setStage("review");
  };

  const detectedConceptIds = new Set(profile.detectedConcepts);
  const detectedRelKeys = new Set(profile.detectedRelations);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {stage === "transition" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Endi matn ekrandan olib tashlanadi.
          </h2>
          <p className="mt-3 text-muted-foreground">
            O‘qigan voqeangizni o‘z so‘zlaringiz bilan aytib bering.
          </p>
        </motion.div>
      )}

      {stage === "recording" && (
        <>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            2-bosqich: Qayta hikoya
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Har bir so‘zni eslash shart emas. Muhim voqealar va ular nima sababdan sodir bo‘lganini
            tushuntiring.
          </p>

          <div className="mt-8 max-w-xl mx-auto">
            <AudioRecorder
              maxSeconds={90}
              onComplete={(blob) => void handleRecordingComplete(blob)}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setTranscript(profile.retellingTranscript);
                  setDraft({ retellingTranscript: profile.retellingTranscript });
                  setStage("review");
                }}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Yozuvni o‘tkazib yuborish (demo)
              </button>
            </div>
          </div>
        </>
      )}

      {stage === "processing" && (
        <div className="py-24 text-center">
          <div className="inline-block h-10 w-10 rounded-full border-4 border-info/30 border-t-info animate-spin" />
          <h2 className="mt-6 font-display text-2xl font-bold">Qayta hikoya tahlil qilinmoqda</h2>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <Step done={processingStep >= 1}>Nutq matnga aylantirilmoqda</Step>
            <Step done={processingStep >= 2}>Muhim voqealar aniqlanmoqda</Step>
            <Step done={processingStep >= 3}>Bog‘lanishlar tekshirilmoqda</Step>
          </ul>
        </div>
      )}

      {stage === "review" && (
        <>
          <h1 className="font-display text-2xl font-bold tracking-tight">Qayta hikoya tahlili</h1>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Tizim yozib olgan qayta hikoya
              </div>
              {transcribeError && <p className="mb-2 text-sm text-danger">{transcribeError}</p>}
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full min-h-[160px] rounded-lg border bg-background p-3 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Noto‘g‘ri aniqlangan so‘zlarni o‘qituvchi tuzatishi mumkin.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                Aniqlangan voqealar va bog‘lanishlar
              </div>
              <ConceptMap
                concepts={passage.expectedConcepts}
                relations={passage.expectedRelations}
                detectedConcepts={Array.from(detectedConceptIds)}
                missingConcepts={profile.missingConcepts}
                detectedRelations={Array.from(detectedRelKeys)}
                missingRelations={profile.missingRelations}
              />
            </div>
          </div>

          <div className="mt-6 rounded-xl border bg-warn-soft/60 p-4 text-sm">
            <span className="font-medium">Dastlabki kuzatuv:</span> voqealar eslab qolingan, lekin
            asosiy sabab-natija bog‘lanishi to‘liq aytilmagan.
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => navigate({ to: "/assessment/question" })}
              className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-5 py-2.5 font-medium hover:opacity-90"
            >
              Mantiqiy savolga o‘tish <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Step({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-2 justify-center ${done ? "text-success" : ""}`}>
      <span className={`h-2 w-2 rounded-full ${done ? "bg-success" : "bg-muted-foreground/40"}`} />
      {children}
    </li>
  );
}
