import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Printer, Save, Plus, X } from "lucide-react";
import { z } from "zod";
import { useSavod } from "@/lib/savod/store";
import { passages } from "@/lib/savod/data";
import { ScoreCard } from "@/components/savod/ScoreCard";
import { ReadingPassage } from "@/components/savod/ReadingPassage";
import { ConceptMap } from "@/components/savod/ConceptMap";
import { PauseTimeline } from "@/components/savod/PauseTimeline";
import type { PassageWord } from "@/lib/savod/types";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/assessment/result")({
  validateSearch: (s) => searchSchema.parse(s),
  component: Result,
});

function Result() {
  const { id } = Route.useSearch();
  const results = useSavod((s) => s.results);
  const result = id ? results.find((r) => r.id === id) : results[0];

  const passage = useMemo(
    () => passages.find((p) => p.id === result?.passageId) ?? passages[0],
    [result?.passageId],
  );

  const [selectedWord, setSelectedWord] = useState<PassageWord | null>(null);
  const [verify, setVerify] = useState<string>("agree");

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">
          Hali baholashlar mavjud emas
        </h1>
        <p className="text-muted-foreground mt-2">
          Birinchi o‘quvchini baholab, uning o‘qish profilini ko‘ring.
        </p>
        <Link
          to="/assessment/setup"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy text-white px-5 py-3"
        >
          <Plus className="h-4 w-4" /> Baholashni boshlash
        </Link>
      </div>
    );
  }

  const dateStr = new Date(result.date).toLocaleDateString("uz", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const compTone =
    result.scores.comprehension >= 80
      ? "success"
      : result.scores.comprehension >= 65
        ? "warn"
        : "warn";

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 print:py-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {result.studentName}ning o‘qish profili
          </h1>
          <p className="text-muted-foreground mt-1">
            {result.passageTitle} · {dateStr} · 3-“A” sinf
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-muted"
          >
            <Printer className="h-4 w-4" /> Chop etish
          </button>
          <Link
            to="/students/$id"
            params={{ id: result.studentId }}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-muted"
          >
            <Save className="h-4 w-4" /> Profilga saqlash
          </Link>
          <Link
            to="/assessment/setup"
            className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-4 py-2 text-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Yangi baholash
          </Link>
        </div>
      </div>

      {/* Scores */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <ScoreCard
          title="Dekodlash"
          score={result.scores.decoding}
          status={statusFor(result.scores.decoding)}
          tone="success"
        >
          <div>{result.words.filter((w) => w.status === "correct").length} ta so‘z to‘g‘ri</div>
          <div>
            {result.words.filter((w) => w.status === "omitted").length} ta so‘z tashlab ketilgan
          </div>
          <div>
            {result.words.filter((w) => w.status === "substituted").length} ta ehtimoliy almashtirish
          </div>
        </ScoreCard>
        <ScoreCard
          title="Ravonlik"
          score={result.scores.fluency}
          status={statusFor(result.scores.fluency)}
          tone="info"
        >
          <div>{result.wordsPerMinute} so‘z/min</div>
          <div>{result.pauses.length} ta sezilarli pauza</div>
          <div>Gaplarni bo‘lib o‘qish: yaxshi</div>
        </ScoreCard>
        <ScoreCard
          title="Tushunish"
          score={result.scores.comprehension}
          status={statusFor(result.scores.comprehension)}
          tone={compTone}
          emphasized
        >
          <div>Asosiy voqealar eslab qolingan</div>
          <div>Sabab-natija bog‘lanishi to‘liq emas</div>
          <div>Mantiqiy savolga javob yaxshi</div>
        </ScoreCard>
      </div>

      <div className="mt-3 text-sm text-muted-foreground">
        Umumiy profil: <span className="font-medium text-foreground">{result.profile}</span>
      </div>

      {/* Diagnosis */}
      <section className="mt-8 rounded-2xl border-2 border-warn/40 bg-warn-soft/40 p-6">
        <div className="text-xs uppercase tracking-wider text-warn font-semibold">
          Asosiy kuzatuv
        </div>
        <p className="mt-2 text-lg font-display leading-relaxed">
          {result.diagnosis}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-card border px-3 py-1.5 text-sm">
          <span className="text-muted-foreground">Ehtimoliy ehtiyoj:</span>
          <span className="font-medium">{result.recommendation}</span>
        </div>
      </section>

      {/* Passage replay */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Matn tahlili</h2>
        <Legend />
        <div className="mt-4 rounded-2xl border bg-card p-6">
          <ReadingPassage
            words={result.words}
            onWordClick={(w) => {
              if (w.status !== "correct" && w.status !== "unread") setSelectedWord(w);
            }}
          />
        </div>
      </section>

      {selectedWord && (
        <WordPopover word={selectedWord} onClose={() => setSelectedWord(null)} />
      )}

      {/* Pause timeline */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">O‘qish vaqt chizig‘i</h2>
        <div className="mt-4 rounded-2xl border bg-card p-6">
          <PauseTimeline
            totalSeconds={result.durationSeconds}
            pauses={result.pauses}
          />
        </div>
      </section>

      {/* Concept map */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Qayta hikoya — voqealar zanjiri</h2>
        <div className="mt-4 rounded-2xl border bg-card p-6">
          <ConceptMap
            concepts={passage.expectedConcepts}
            relations={passage.expectedRelations}
            detectedConcepts={result.detectedConcepts}
            missingConcepts={result.missingConcepts}
            detectedRelations={result.detectedRelations}
            missingRelations={result.missingRelations}
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Voqealar eslab qolingan, ammo “nima uchun?” bog‘lanishi yo‘qolgan.
          </p>
        </div>
      </section>

      {/* Intervention */}
      <section className="mt-10 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-xs uppercase tracking-wider text-info font-semibold">
            Keyingi mashq
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold">
            {result.recommendation}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>· Boladan voqealarni kartochkalarga joylashtirishni so‘rang.</li>
            <li>· Har ikki voqea orasida “Nima sabab bo‘ldi?” savolini bering.</li>
            <li>· Javobni “chunki” va “shuning uchun” so‘zlari bilan tuzdiring.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-muted px-3 py-1">7 daqiqa</span>
            <span className="rounded-full bg-muted px-3 py-1">Haftasiga 3 marta</span>
          </div>
          <button
            onClick={() => alert("Mashq tafsilotlari (demo)")}
            className="mt-5 inline-flex items-center rounded-full bg-navy text-white px-4 py-2 text-sm hover:opacity-90"
          >
            Mashqni ochish
          </button>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            O‘qituvchi tasdig‘i
          </div>
          <div className="mt-3 space-y-2">
            {[
              { id: "agree", label: "Tahlilga qo‘shilaman" },
              { id: "partial", label: "Qisman qo‘shilaman" },
              { id: "edit", label: "Tahlilni o‘zgartirish kerak" },
            ].map((o) => (
              <label
                key={o.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer ${
                  verify === o.id ? "border-navy bg-navy/5" : "hover:bg-muted/40"
                }`}
              >
                <input
                  type="radio"
                  className="accent-navy"
                  checked={verify === o.id}
                  onChange={() => setVerify(o.id)}
                />
                <span className="text-sm">{o.label}</span>
              </label>
            ))}
          </div>
          <textarea
            placeholder="Izoh (ixtiyoriy)"
            className="mt-3 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px]"
          />
        </div>
      </section>
    </div>
  );
}

function statusFor(v: number): string {
  if (v >= 85) return "Yaxshi";
  if (v >= 70) return "O‘rta";
  if (v >= 60) return "E’tibor talab qiladi";
  return "Yordam kerak";
}

function Legend() {
  const items = [
    { label: "To‘g‘ri", style: { color: "var(--success)" } },
    { label: "Tashlab ketilgan", style: { textDecoration: "line-through", color: "var(--danger)" } },
    { label: "Almashtirilgan", style: { color: "var(--danger)" } },
    { label: "Ikkilanish", style: { background: "var(--warn-soft)", padding: "0 4px", borderRadius: 4 } },
    { label: "Tekshirilmagan", style: { color: "var(--muted-foreground)" } },
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span style={i.style as React.CSSProperties}>Aa</span>
          {i.label}
        </span>
      ))}
    </div>
  );
}

function WordPopover({
  word,
  onClose,
}: {
  word: PassageWord;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 print:hidden"
      onClick={onClose}
    >
      <div
        className="rounded-2xl bg-card p-6 max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="font-display text-xl font-bold">{word.text}</div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="mt-4 space-y-1.5 text-sm">
          <li className="flex justify-between"><span className="text-muted-foreground">Holat</span> <span className="font-medium">{labelFor(word.status)}</span></li>
          {word.startTime !== undefined && (
            <li className="flex justify-between"><span className="text-muted-foreground">Vaqt</span> <span className="tabular-nums">{word.startTime.toFixed(1)}s</span></li>
          )}
          {word.confidence !== undefined && (
            <li className="flex justify-between"><span className="text-muted-foreground">Ishonchlilik</span> <span>{Math.round(word.confidence * 100)}%</span></li>
          )}
          {word.detectedText && (
            <li className="flex justify-between"><span className="text-muted-foreground">Aniqlangan</span> <span className="text-danger">{word.detectedText}</span></li>
          )}
        </ul>
        <div className="mt-4 flex gap-2">
          <button className="flex-1 rounded-full bg-success text-white text-sm py-2">
            Tasdiqlash
          </button>
          <button className="flex-1 rounded-full border text-sm py-2 hover:bg-muted">
            To‘g‘ri deb belgilash
          </button>
        </div>
      </div>
    </div>
  );
}

function labelFor(s: PassageWord["status"]) {
  return s === "omitted"
    ? "Tashlab ketilgan"
    : s === "substituted"
      ? "Almashtirilgan"
      : s === "hesitation"
        ? "Ikkilanish"
        : s === "repeated"
          ? "Takrorlangan"
          : s === "correct"
            ? "To‘g‘ri"
            : "Tekshirilmagan";
}
