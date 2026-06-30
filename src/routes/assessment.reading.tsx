import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Pause, Play, RotateCcw, Square, ChevronRight } from "lucide-react";
import { students, passages, demoProfiles } from "@/lib/savod/data";
import { useSavod } from "@/lib/savod/store";
import type { PassageWord, WordStatus } from "@/lib/savod/types";
import { AudioWaveform } from "@/components/savod/AudioWaveform";
import { ReadingPassage } from "@/components/savod/ReadingPassage";

export const Route = createFileRoute("/assessment/reading")({
  component: Reading,
});

type Phase = "instructions" | "active" | "paused" | "done";

function Reading() {
  const navigate = useNavigate();
  const { draft } = useSavod();
  const student = students.find((s) => s.id === draft.studentId) ?? students[0];
  const passage = passages.find((p) => p.id === draft.passageId) ?? passages[0];
  const profile =
    demoProfiles.find((p) => p.id === draft.demoProfileId) ?? demoProfiles[0];

  const [phase, setPhase] = useState<Phase>("instructions");
  const [elapsed, setElapsed] = useState(0); // ms-ish (we use seconds)
  const [level, setLevel] = useState(0);
  const [words, setWords] = useState<PassageWord[]>(() =>
    passage.words.map((w, i) => ({
      id: `${passage.id}-${i}`,
      text: w.text,
      index: i,
      status: "unread" as WordStatus,
    })),
  );

  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const pauseAccumRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);

  // Schedule words by demo profile timings
  const totalDuration = profile.durationSeconds;

  useEffect(() => {
    if (phase !== "active") return;

    const tick = () => {
      const now = performance.now();
      const sec = (now - startRef.current - pauseAccumRef.current) / 1000;
      setElapsed(sec);

      // Reveal words up to current time, including current pointer
      setWords((prev) => {
        const next = [...prev];
        let currentSet = false;
        for (let i = 0; i < next.length; i++) {
          const ev = profile.wordEvents.find((e) => e.index === i);
          const t = ev?.startTime ?? (i * totalDuration) / next.length;
          if (sec >= t) {
            const finalStatus = ev?.status ?? "correct";
            next[i] = {
              ...next[i],
              status: finalStatus,
              detectedText: ev?.detectedText,
              confidence: ev?.confidence,
              startTime: t,
            };
          } else if (!currentSet) {
            next[i] = { ...next[i], status: "current" };
            currentSet = true;
          } else {
            next[i] = { ...next[i], status: "unread" };
          }
        }
        return next;
      });

      if (sec >= totalDuration + 0.5) {
        finishReading();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx =
        (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext: typeof AudioContext }).AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 2.4));
        if (audioCtxRef.current) requestAnimationFrame(loop);
      };
      loop();
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      rec.start();
    } catch {
      // ignore — still proceed in demo mode
    }
  };

  const beginActive = async () => {
    await startRecording();
    startRef.current = performance.now();
    pauseAccumRef.current = 0;
    setPhase("active");
  };

  const togglePause = () => {
    if (phase === "active") {
      pauseStartRef.current = performance.now();
      setPhase("paused");
    } else if (phase === "paused") {
      if (pauseStartRef.current) {
        pauseAccumRef.current += performance.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      setPhase("active");
    }
  };

  const finishReading = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    // finalize all words to profile statuses
    setWords(
      passage.words.map((w, i) => {
        const ev = profile.wordEvents.find((e) => e.index === i);
        return {
          id: `${passage.id}-${i}`,
          text: w.text,
          index: i,
          status: ev?.status ?? "correct",
          detectedText: ev?.detectedText,
          confidence: ev?.confidence,
          startTime: ev?.startTime,
        };
      }),
    );
    setPhase("done");
  };

  const restart = () => {
    if (confirm("Baholashni qaytadan boshlaysizmi?")) {
      setWords(passage.words.map((w, i) => ({
        id: `${passage.id}-${i}`,
        text: w.text,
        index: i,
        status: "unread",
      })));
      setElapsed(0);
      setPhase("instructions");
    }
  };

  const readCount = words.filter(
    (w) => w.status !== "unread" && w.status !== "current",
  ).length;

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(Math.floor(elapsed % 60)).padStart(2, "0");

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Sub-header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{student.name}</span> ·{" "}
            {passage.title}
          </div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            1-bosqich: Ovoz chiqarib o‘qish · 1 / 3
          </div>
        </div>
      </div>

      {phase === "instructions" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <Mic className="h-16 w-16 text-info" />
          <h2 className="mt-6 font-display text-3xl font-bold tracking-tight max-w-2xl">
            Matnni odatdagi tezligingizda ovoz chiqarib o‘qing.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Xato qilsangiz, to‘xtamang. O‘qishni davom ettiring.
          </p>
          <button
            onClick={beginActive}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy text-white px-6 py-3 font-medium hover:opacity-90"
          >
            <Mic className="h-4 w-4" /> O‘qishni boshlash
          </button>
        </div>
      )}

      {(phase === "active" || phase === "paused") && (
        <>
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="w-full">
              <ReadingPassage words={words} />
            </div>
          </div>

          {/* Bottom metrics */}
          <div className="border-t bg-card">
            <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center gap-6">
              <Metric label="Vaqt" value={`${mm}:${ss}`} />
              <Metric label="O‘qilgan so‘zlar" value={`${readCount} / ${passage.wordCount}`} />
              <Metric
                label="Taxminiy tezlik"
                value={`${elapsed > 1 ? Math.round((readCount / elapsed) * 60) : 0} so‘z/min`}
              />
              <Metric label="Pauzalar" value={String(profile.pauses.filter(p => p.atTime <= elapsed).length)} />

              <div className="ml-auto flex items-center gap-2">
                <AudioWaveform level={level} active={phase === "active"} bars={20} />
                <button
                  onClick={togglePause}
                  className="rounded-full border p-2 hover:bg-muted"
                  aria-label="Pauza"
                >
                  {phase === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={restart}
                  className="rounded-full border p-2 hover:bg-muted"
                  aria-label="Qayta boshlash"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={finishReading}
                  className="inline-flex items-center gap-2 rounded-full bg-danger text-white px-4 py-2 text-sm hover:opacity-90"
                >
                  <Square className="h-4 w-4" /> Tugatish
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {phase === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        >
          <div className="max-w-2xl w-full rounded-2xl border bg-card p-8 text-center">
            <h2 className="font-display text-2xl font-bold">O‘qish bosqichi yakunlandi</h2>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li>{words.filter((w) => w.status === "correct").length} ta so‘z o‘qildi</li>
              <li>{profile.pauses.length} ta uzun pauza</li>
              <li>
                {words.filter((w) => w.status === "omitted").length} ta so‘z tashlab ketilgan
              </li>
              <li>
                {words.filter((w) => w.status === "substituted").length} ta ehtimoliy almashtirish
              </li>
            </ul>
            <p className="mt-6 text-xs text-muted-foreground">
              Yakuniy natija uchala bosqich tugagandan keyin ko‘rsatiladi.
            </p>
            <button
              onClick={() => navigate({ to: "/assessment/retelling" })}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy text-white px-6 py-3 font-medium hover:opacity-90"
            >
              Qayta hikoyaga o‘tish <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-lg font-display font-semibold tabular-nums">
        {value}
      </div>
    </div>
  );
}
