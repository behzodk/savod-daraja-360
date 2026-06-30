import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, Square, RotateCcw, Trash2 } from "lucide-react";
import { AudioWaveform } from "./AudioWaveform";

type Status = "idle" | "recording" | "paused" | "stopped";

interface Props {
  onLevel?: (level: number) => void;
  onTick?: (sec: number) => void;
  onComplete?: (blob: Blob, durationSec: number) => void;
  maxSeconds?: number;
  autoStart?: boolean;
}

export function AudioRecorder({
  onLevel,
  onTick,
  onComplete,
  maxSeconds,
  autoStart,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  const startMeter = (stream: MediaStream) => {
    const Ctx =
      (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext: typeof AudioContext }).AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const loop = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const lvl = Math.min(1, rms * 2.4);
      setLevel(lvl);
      onLevel?.(lvl);
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (tickRef.current) window.clearInterval(tickRef.current);
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    rafRef.current = null;
    tickRef.current = null;
  };

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startMeter(stream);

      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        onComplete?.(blob, seconds);
      };
      mr.start(100);
      setStatus("recording");
      setSeconds(0);
      tickRef.current = window.setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          onTick?.(next);
          if (maxSeconds && next >= maxSeconds) {
            stop();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(
        "Mikrofondan foydalanishga ruxsat berilmadi. Brauzer sozlamalaridan mikrofon ruxsatini yoqing.",
      );
    }
  };

  const pause = () => {
    mediaRef.current?.pause();
    if (tickRef.current) window.clearInterval(tickRef.current);
    setStatus("paused");
  };

  const resume = () => {
    mediaRef.current?.resume();
    tickRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    setStatus("recording");
  };

  const stop = () => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
    cleanup();
    setStatus("stopped");
  };

  const reset = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setSeconds(0);
    setStatus("idle");
  };

  useEffect(() => {
    if (autoStart) void start();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="rounded-xl border bg-card p-6">
      {error && (
        <div className="mb-4 rounded-md bg-danger-soft text-danger px-4 py-3 text-sm">
          {error}
          <button
            onClick={() => void start()}
            className="ml-3 underline font-medium"
          >
            Qayta urinib ko‘rish
          </button>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <span
            className={`h-2 w-2 rounded-full ${
              status === "recording"
                ? "bg-danger animate-pulse"
                : status === "paused"
                  ? "bg-warn"
                  : status === "stopped"
                    ? "bg-success"
                    : "bg-muted-foreground/50"
            }`}
          />
          {status === "recording"
            ? "Tinglanmoqda"
            : status === "paused"
              ? "Pauza"
              : status === "stopped"
                ? "Yozuv tugallandi"
                : "Tayyor"}
        </div>

        <div className="text-4xl font-display font-semibold tabular-nums text-navy">
          {mm}:{ss}
        </div>

        <AudioWaveform level={level} active={status === "recording"} />

        <div className="flex flex-wrap items-center justify-center gap-2">
          {status === "idle" && (
            <button
              onClick={() => void start()}
              className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-5 py-2.5 font-medium hover:opacity-90"
            >
              <Mic className="h-4 w-4" /> Boshlash
            </button>
          )}
          {status === "recording" && (
            <>
              <button
                onClick={pause}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-muted"
              >
                <Pause className="h-4 w-4" /> Pauza
              </button>
              <button
                onClick={stop}
                className="inline-flex items-center gap-2 rounded-full bg-danger text-white px-4 py-2 text-sm hover:opacity-90"
              >
                <Square className="h-4 w-4" /> Tugatish
              </button>
            </>
          )}
          {status === "paused" && (
            <>
              <button
                onClick={resume}
                className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-4 py-2 text-sm"
              >
                <Play className="h-4 w-4" /> Davom ettirish
              </button>
              <button
                onClick={stop}
                className="inline-flex items-center gap-2 rounded-full bg-danger text-white px-4 py-2 text-sm"
              >
                <Square className="h-4 w-4" /> Tugatish
              </button>
            </>
          )}
          {status === "stopped" && (
            <>
              {blobUrl && (
                <audio src={blobUrl} controls className="h-9" />
              )}
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" /> Qayta yozish
              </button>
              <button
                onClick={() => {
                  reset();
                }}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-danger hover:bg-danger-soft"
              >
                <Trash2 className="h-4 w-4" /> O‘chirish
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
