import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Mic, Pencil } from "lucide-react";
import { demoProfiles, passages, students } from "@/lib/savod/data";
import { useSavod, buildAssessmentFromProfile } from "@/lib/savod/store";
import { AudioRecorder } from "@/components/savod/AudioRecorder";
import { transcribeAudio } from "@/lib/savod/speech.functions";

export const Route = createFileRoute("/assessment/question")({
  component: Question,
});

function Question() {
  const navigate = useNavigate();
  const { draft, setDraft, saveResult } = useSavod();
  const passage = passages.find((p) => p.id === draft.passageId) ?? passages[0];
  const profile = demoProfiles.find((p) => p.id === draft.demoProfileId) ?? demoProfiles[0];
  const student = students.find((s) => s.id === draft.studentId) ?? students[0];

  const [mode, setMode] = useState<"mic" | "text">("mic");
  const [stage, setStage] = useState<"recording" | "transcribing" | "review">("recording");
  const [text, setText] = useState("");
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  const handleRecordingComplete = async (blob: Blob) => {
    setStage("transcribing");
    setTranscribeError(null);
    try {
      const form = new FormData();
      form.append("audio", blob, "answer.webm");
      form.append("languageCode", "uz");
      const result = await transcribeAudio({ data: form });
      setText(result.text);
    } catch (err) {
      console.error(err);
      setTranscribeError(
        err instanceof Error ? err.message : "Nutqni tanib bo‘lish muvaffaqiyatsiz tugadi.",
      );
      setText("");
    }
    setStage("review");
  };

  const submit = () => {
    setDraft({ inferenceTranscript: text });
    const result = buildAssessmentFromProfile(draft, student.id, student.name, passage.id);
    result.inferenceTranscript = text;
    saveResult(result);
    navigate({
      to: "/assessment/result",
      search: { id: result.id },
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-bold tracking-tight">3-bosqich: Mantiqiy savol</h1>
      <p className="text-muted-foreground mt-1">
        Javob matnda aynan yozilmagan. O‘qigan voqeangizga asoslanib xulosa qiling.
      </p>

      <div className="mt-6 rounded-2xl border bg-card p-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Savol</div>
        <p className="font-display text-xl">{passage.inferenceQuestion}</p>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setMode("mic")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
            mode === "mic" ? "bg-navy text-white" : "border hover:bg-muted"
          }`}
        >
          <Mic className="h-4 w-4" /> Ovoz bilan javob
        </button>
        <button
          onClick={() => setMode("text")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
            mode === "text" ? "bg-navy text-white" : "border hover:bg-muted"
          }`}
        >
          <Pencil className="h-4 w-4" /> O‘qituvchi yozadi
        </button>
      </div>

      <div className="mt-4">
        {mode === "mic" && stage === "recording" && (
          <AudioRecorder
            maxSeconds={45}
            onComplete={(blob) => void handleRecordingComplete(blob)}
          />
        )}

        {mode === "mic" && stage === "transcribing" && (
          <div className="rounded-xl border bg-card p-10 text-center">
            <div className="inline-block h-8 w-8 rounded-full border-4 border-info/30 border-t-info animate-spin" />
            <p className="mt-4 text-sm text-muted-foreground">Nutq matnga aylantirilmoqda…</p>
          </div>
        )}

        {mode === "text" && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[120px] rounded-xl border bg-card p-3 text-sm"
            placeholder="Bolaning javobini yozing..."
          />
        )}

        {mode === "mic" && stage === "review" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border bg-card p-5"
          >
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Tizim yozib olgan javob
            </div>
            {transcribeError && <p className="mb-2 text-sm text-danger">{transcribeError}</p>}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[80px] rounded-lg border bg-background p-3 text-sm"
            />
          </motion.div>
        )}
      </div>

      {(stage === "review" || mode === "text") && (
        <div className="mt-6 rounded-2xl border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Baholash mezonlari
          </div>
          <ul className="space-y-2">
            {profile.inferenceCriteria.map((c) => (
              <li
                key={c.id}
                className="flex items-start gap-3 rounded-lg px-3 py-2"
                style={{
                  background: c.detected ? "var(--success-soft)" : "var(--danger-soft)",
                }}
              >
                <CheckCircle2
                  className="h-4 w-4 mt-0.5"
                  style={{ color: c.detected ? "var(--success)" : "var(--danger)" }}
                />
                <span className="text-sm">{c.text}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Javob mazmuni baholanadi. Boladan aynan bir xil jumla kutilmaydi.
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={submit}
          disabled={mode === "mic" && stage !== "review"}
          className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-6 py-3 font-medium hover:opacity-90 disabled:opacity-50"
        >
          Natijani ko‘rish <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
