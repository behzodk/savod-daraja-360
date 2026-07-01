export interface TranscribedWord {
  text: string;
  start: number | null;
  end: number | null;
  confidence?: number;
}

export interface TranscriptionResult {
  text: string;
  words: TranscribedWord[];
  languageCode: string;
  languageProbability: number;
}

interface ElevenLabsWord {
  text: string;
  start: number | null;
  end: number | null;
  type: "word" | "spacing" | "audio_event";
  logprob?: number;
}

interface ElevenLabsResponse {
  text: string;
  language_code: string;
  language_probability: number;
  words?: ElevenLabsWord[];
}

export async function transcribeWithElevenLabs(
  audio: Blob,
  languageCode: string,
): Promise<TranscriptionResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ELEVENLABS_API_KEY is not configured on the server. Add it to your .env file.",
    );
  }

  const form = new FormData();
  form.append("model_id", "scribe_v1");
  form.append("language_code", languageCode);
  form.append("timestamps_granularity", "word");
  form.append("file", audio, "audio.webm");

  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`ElevenLabs STT failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = (await res.json()) as ElevenLabsResponse;

  const words: TranscribedWord[] = (data.words ?? [])
    .filter((w) => w.type === "word")
    .map((w) => ({
      text: w.text,
      start: w.start,
      end: w.end,
      confidence: w.logprob !== undefined ? Math.exp(w.logprob) : undefined,
    }));

  return {
    text: data.text ?? "",
    words,
    languageCode: data.language_code ?? languageCode,
    languageProbability: data.language_probability ?? 0,
  };
}
