import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AssessmentResult,
  DemoProfileId,
  PassageWord,
} from "./types";
import { demoProfiles, passages } from "./data";

interface DraftAssessment {
  studentId: string;
  passageId: string;
  demoProfileId: DemoProfileId;
  words?: PassageWord[];
  durationSeconds?: number;
  wordsPerMinute?: number;
  retellingTranscript?: string;
  inferenceTranscript?: string;
}

interface SavodState {
  draft: DraftAssessment;
  results: AssessmentResult[];
  setDraft: (d: Partial<DraftAssessment>) => void;
  resetDraft: () => void;
  saveResult: (r: AssessmentResult) => void;
}

const defaultDraft: DraftAssessment = {
  studentId: "azizbek",
  passageId: "akmal",
  demoProfileId: "fluent_low_comp",
};

export const useSavod = create<SavodState>()(
  persist(
    (set) => ({
      draft: defaultDraft,
      results: [],
      setDraft: (d) =>
        set((s) => ({ draft: { ...s.draft, ...d } })),
      resetDraft: () => set({ draft: defaultDraft }),
      saveResult: (r) =>
        set((s) => ({ results: [r, ...s.results.filter((x) => x.id !== r.id)] })),
    }),
    { name: "savod360-state", version: 1 },
  ),
);

export function buildAssessmentFromProfile(
  draftProfile: DemoProfileId,
  studentId: string,
  studentName: string,
  passageId: string,
): AssessmentResult {
  const profile = demoProfiles.find((p) => p.id === draftProfile) ?? demoProfiles[0];
  const passage = passages.find((p) => p.id === passageId) ?? passages[0];

  const words: PassageWord[] = passage.words.map((w, i) => {
    const event = profile.wordEvents.find((e) => e.index === i);
    return {
      id: `${passage.id}-${i}`,
      text: w.text,
      index: i,
      status: event?.status ?? "correct",
      detectedText: event?.detectedText,
      confidence: event?.confidence,
      startTime: event?.startTime,
    };
  });

  return {
    id: `result-${Date.now()}`,
    studentId,
    studentName,
    passageId,
    passageTitle: passage.title,
    date: new Date().toISOString(),
    durationSeconds: profile.durationSeconds,
    wordsPerMinute: profile.wordsPerMinute,
    pauses: profile.pauses,
    words,
    retellingTranscript: profile.retellingTranscript,
    detectedConcepts: profile.detectedConcepts,
    missingConcepts: profile.missingConcepts,
    detectedRelations: profile.detectedRelations,
    missingRelations: profile.missingRelations,
    inferenceTranscript: profile.inferenceTranscript,
    inferenceCriteria: profile.inferenceCriteria,
    scores: profile.scores,
    diagnosis: profile.diagnosis,
    recommendation: profile.recommendation,
    profile: profile.profile,
  };
}
