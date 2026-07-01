import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, CheckCircle2, ChevronRight } from "lucide-react";
import { students, passages } from "@/lib/savod/data";
import { useSavod } from "@/lib/savod/store";

export const Route = createFileRoute("/assessment/setup")({
  component: Setup,
});

function Setup() {
  const navigate = useNavigate();
  const { draft, setDraft } = useSavod();
  const [micState, setMicState] = useState<"idle" | "checking" | "ready" | "denied">("idle");
  const [level, setLevel] = useState(0);

  const student = students.find((s) => s.id === draft.studentId) ?? students[0];

  const checkMic = async () => {
    setMicState("checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicState("ready");
      const Ctx =
        (
          window as unknown as {
            AudioContext: typeof AudioContext;
            webkitAudioContext: typeof AudioContext;
          }
        ).AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let raf = 0;
      const loop = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 2.4));
        raf = requestAnimationFrame(loop);
      };
      loop();
      // stop after 5s
      window.setTimeout(() => {
        cancelAnimationFrame(raf);
        ctx.close().catch(() => {});
        stream.getTracks().forEach((t) => t.stop());
        setLevel(0);
      }, 5000);
    } catch {
      setMicState("denied");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Baholashni boshlash</h1>
      <p className="text-muted-foreground mt-1">
        O‘quvchini va matnni tanlang, so‘ng mikrofonni tekshirib baholashni boshlang.
      </p>

      <section className="mt-8">
        {/* Student selection */}
        <div className="rounded-2xl border bg-card p-6 max-w-xl">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            O‘quvchi
          </div>
          <select
            value={draft.studentId}
            onChange={(e) => setDraft({ studentId: e.target.value })}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="mt-4 rounded-lg bg-muted/60 p-4 text-sm space-y-1">
            <div className="font-medium">{student.name}</div>
            <div className="text-muted-foreground">
              {student.classroom} · {student.age} yosh
            </div>
            {student.scores && (
              <div className="text-muted-foreground">
                Oxirgi natija: D {student.scores.decoding} · R {student.scores.fluency} · T{" "}
                {student.scores.comprehension}
              </div>
            )}
            <div className="text-muted-foreground">
              So‘nggi baholash: {student.lastAssessmentDate ?? "—"}
            </div>
          </div>
        </div>
      </section>

      {/* Passage selection */}
      <section className="mt-8">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Matn</div>
        <div className="grid md:grid-cols-3 gap-4">
          {passages.map((p) => {
            const active = draft.passageId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setDraft({ passageId: p.id })}
                className={`text-left rounded-2xl border bg-card p-5 transition ${
                  active ? "ring-2 ring-navy border-navy" : "hover:border-foreground/30"
                }`}
              >
                <div className="font-display text-lg font-semibold">{p.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {p.grade}-sinf · {p.wordCount} so‘z
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Mavzu:</span> {p.topic}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ko‘nikma:</span> {p.skill}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Microphone check */}
      <section className="mt-8 rounded-2xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display text-lg font-semibold">Mikrofon tekshiruvi</div>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Baholashni tinch xonada o‘tkazing. Mikrofon bolaning ovozini aniq eshitishi kerak.
            </p>
          </div>
          <button
            onClick={checkMic}
            className="rounded-full border px-4 py-2 text-sm hover:bg-muted"
          >
            Mikrofonni tekshirish
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 text-sm">
          {micState === "ready" && (
            <span className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" /> Mikrofon tayyor
            </span>
          )}
          {micState === "checking" && (
            <span className="text-muted-foreground">Mikrofon ulanmoqda...</span>
          )}
          {micState === "denied" && (
            <span className="text-danger">
              Mikrofondan foydalanishga ruxsat berilmadi. Brauzer sozlamalarini tekshiring.
            </span>
          )}
          <div className="flex-1 max-w-xs h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-info transition-all" style={{ width: `${level * 100}%` }} />
          </div>
        </div>
      </section>

      <div className="mt-10 flex justify-end">
        <button
          onClick={() => navigate({ to: "/assessment/reading" })}
          className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-6 py-3 font-medium hover:opacity-90"
        >
          <Mic className="h-4 w-4" /> Baholashni boshlash <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
