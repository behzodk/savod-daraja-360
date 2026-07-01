import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Pause, Play, RotateCcw, Square, ChevronRight, AlertTriangle } from "lucide-react";
import { students, passages } from "@/lib/savod/data";
import { useSavod } from "@/lib/savod/store";
import type { PassageWord, WordStatus } from "@/lib/savod/types";
import { AudioWaveform } from "@/components/savod/AudioWaveform";
import { transcribeAudio } from "@/lib/savod/speech.functions";
import { alignTranscript } from "@/lib/savod/align";

export const Route = createFileRoute("/assessment/reading")({
  component: Reading,
});

type Phase = "instructions" | "countdown" | "active" | "paused" | "processing" | "done";

function emptyWords(passageId: string, words: { text: string }[]): PassageWord[] {
  return words.map((w, i) => ({
    id: `${passageId}-${i}`,
    text: w.text,
    index: i,
    status: "unread" as WordStatus,
  }));
}

function Reading() {
  const navigate = useNavigate();
  const { draft, setDraft } = useSavod();
  const student = students.find((s) => s.id === draft.studentId) ?? students[0];
  const passage = passages.find((p) => p.id === draft.passageId) ?? passages[0];

  const [phase, setPhase] = useState<Phase>("instructions");
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [micError, setMicError] = useState<string | null>(null);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [words, setWords] = useState<PassageWord[]>(() => emptyWords(passage.id, passage.words));
  const [wordsPerMinute, setWordsPerMinute] = useState(0);

  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const lastBlobRef = useRef<Blob | null>(null);
  const pauseAccumRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "active") return;
    const tick = () => {
      const now = performance.now();
      const sec = (now - startRef.current - pauseAccumRef.current) / 1000;
      setElapsed(sec);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  // Requests the mic and starts the live level meter, without starting the recorder yet.
  const acquireMic = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx =
        (
          window as unknown as {
            AudioContext: typeof AudioContext;
            webkitAudioContext: typeof AudioContext;
          }
        ).AudioContext ||
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
      return true;
    } catch {
      return false;
    }
  };

  const startCountdown = async () => {
    setMicError(null);
    setTranscribeError(null);
    const ok = await acquireMic();
    if (!ok) {
      setMicError(
        "Mikrofondan foydalanishga ruxsat berilmadi. Brauzer sozlamalaridan mikrofon ruxsatini yoqing.",
      );
      return;
    }
    setCountdown(3);
    setPhase("countdown");
  };

  const beginActive = () => {
    const stream = streamRef.current;
    if (stream) {
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      audioChunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) audioChunksRef.current.push(e.data);
      };
      rec.start(100);
    }
    startRef.current = performance.now();
    pauseAccumRef.current = 0;
    setPhase("active");
  };

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      beginActive();
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 800);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  const togglePause = () => {
    if (phase === "active") {
      recorderRef.current?.pause();
      pauseStartRef.current = performance.now();
      setPhase("paused");
    } else if (phase === "paused") {
      recorderRef.current?.resume();
      if (pauseStartRef.current) {
        pauseAccumRef.current += performance.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      setPhase("active");
    }
  };

  const stopRecorder = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const rec = recorderRef.current;
      if (!rec || rec.state === "inactive") {
        resolve(audioChunksRef.current.length ? new Blob(audioChunksRef.current) : null);
        return;
      }
      rec.onstop = () => {
        resolve(new Blob(audioChunksRef.current, { type: rec.mimeType || "audio/webm" }));
      };
      rec.stop();
    });

  const runTranscription = async (blob: Blob) => {
    setTranscribeError(null);
    setPhase("processing");
    try {
      const form = new FormData();
      form.append("audio", blob, "reading.webm");
      form.append("languageCode", "uz");
      const result = await transcribeAudio({ data: form });
      const aligned = alignTranscript(
        passage.words.map((w) => w.text),
        result.words,
      );
      const finalWords: PassageWord[] = passage.words.map((w, i) => ({
        id: `${passage.id}-${i}`,
        text: w.text,
        index: i,
        ...aligned[i],
      }));
      setWords(finalWords);
      const correctCount = finalWords.filter((w) => w.status === "correct").length;
      const wpm = elapsed > 1 ? Math.round((correctCount / elapsed) * 60) : 0;
      setWordsPerMinute(wpm);
      setDraft({ words: finalWords, durationSeconds: elapsed, wordsPerMinute: wpm });
    } catch (err) {
      console.error(err);
      setTranscribeError(
        err instanceof Error ? err.message : "Nutqni tanib bo‘lish muvaffaqiyatsiz tugadi.",
      );
    }
    setPhase("done");
  };

  const finishReading = async () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase("processing");
    const blob = await stopRecorder();
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    if (!blob || blob.size < 1000) {
      setTranscribeError("Ovoz yozib olinmadi. Mikrofonni tekshirib, qaytadan urining.");
      setPhase("done");
      return;
    }
    lastBlobRef.current = blob;
    await runTranscription(blob);
  };

  const retryTranscription = () => {
    if (lastBlobRef.current) void runTranscription(lastBlobRef.current);
  };

  const restart = () => {
    if (confirm("Baholashni qaytadan boshlaysizmi?")) {
      setWords(emptyWords(passage.id, passage.words));
      setElapsed(0);
      setWordsPerMinute(0);
      setTranscribeError(null);
      lastBlobRef.current = null;
      setPhase("instructions");
    }
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(Math.floor(elapsed % 60)).padStart(2, "0");

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Sub-header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{student.name}</span> · {passage.title}
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
          {micError && (
            <div className="mt-5 max-w-md rounded-lg bg-danger-soft text-danger px-4 py-3 text-sm">
              {micError}
            </div>
          )}
          <button
            onClick={startCountdown}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy text-white px-6 py-3 font-medium hover:opacity-90"
          >
            <Mic className="h-4 w-4" /> O‘qishni boshlash
          </button>
        </div>
      )}

      {phase === "countdown" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <motion.div
            key={countdown}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display text-8xl font-bold tracking-tight text-navy"
          >
            {countdown}
          </motion.div>
          <p className="mt-6 text-muted-foreground">Tayyorlaning…</p>
        </div>
      )}

      {(phase === "active" || phase === "paused") && (
        <>
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-3xl mx-auto reading-text leading-loose text-foreground/90 select-none">
              {passage.text}
            </div>
          </div>

          {/* Bottom metrics */}
          <div className="border-t bg-card">
            <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center gap-6">
              <Metric label="Vaqt" value={`${mm}:${ss}`} />

              <div className="ml-auto flex items-center gap-2">
                <AudioWaveform level={level} active={phase === "active"} bars={20} />
                <button
                  onClick={togglePause}
                  className="rounded-full border p-2 hover:bg-muted"
                  aria-label="Pauza"
                >
                  {phase === "active" ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
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

      {phase === "processing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="inline-block h-10 w-10 rounded-full border-4 border-info/30 border-t-info animate-spin" />
          <h2 className="mt-6 font-display text-2xl font-bold">Nutq matnga aylantirilmoqda</h2>
          <p className="mt-2 text-muted-foreground">Bir necha soniya kuting…</p>
        </div>
      )}

      {phase === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        >
          <div className="max-w-2xl w-full rounded-2xl border bg-card p-8 text-center">
            <h2 className="font-display text-2xl font-bold">O‘qish bosqichi yakunlandi</h2>

            {transcribeError ? (
              <div className="mt-5 rounded-lg bg-danger-soft text-danger px-4 py-3 text-sm flex items-start gap-2 text-left">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p>{transcribeError}</p>
                  {lastBlobRef.current && (
                    <button onClick={retryTranscription} className="mt-2 underline font-medium">
                      Qayta urinib ko‘rish
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                <li>
                  {words.filter((w) => w.status === "correct").length} ta so‘z to‘g‘ri o‘qildi
                </li>
                <li>
                  {words.filter((w) => w.status === "omitted").length} ta so‘z tashlab ketilgan
                </li>
                <li>
                  {words.filter((w) => w.status === "substituted").length} ta ehtimoliy almashtirish
                </li>
                <li>Taxminiy tezlik: {wordsPerMinute} so‘z/min</li>
              </ul>
            )}

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
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-display font-semibold tabular-nums">{value}</div>
    </div>
  );
}
