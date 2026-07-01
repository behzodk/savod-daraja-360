import { createServerFn } from "@tanstack/react-start";
import { transcribeWithElevenLabs, type TranscriptionResult } from "./speech.server";

export const transcribeAudio = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }
    const audio = data.get("audio");
    if (!(audio instanceof Blob)) {
      throw new Error("Missing audio file");
    }
    const languageCode = data.get("languageCode")?.toString() || "uz";
    return { audio, languageCode };
  })
  .handler(async ({ data }): Promise<TranscriptionResult> => {
    return transcribeWithElevenLabs(data.audio, data.languageCode);
  });
