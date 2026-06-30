export type WordStatus =
  | "unread"
  | "current"
  | "correct"
  | "omitted"
  | "substituted"
  | "hesitation"
  | "repeated";

export interface PassageWord {
  id: string;
  text: string;
  index: number;
  startTime?: number;
  endTime?: number;
  status: WordStatus;
  detectedText?: string;
  confidence?: number;
}

export interface PauseEvent {
  beforeWordIndex: number;
  atTime: number;
  durationSec: number;
}

export interface ConceptNode {
  id: string;
  label: string;
}

export interface ConceptRelation {
  from: string;
  to: string;
  label?: string;
}

export interface Passage {
  id: string;
  title: string;
  grade: number;
  topic: string;
  skill: string;
  wordCount: number;
  text: string;
  words: { text: string }[];
  expectedConcepts: ConceptNode[];
  expectedRelations: ConceptRelation[];
  inferenceQuestion: string;
  inferenceRubric: string[];
}

export interface AssessmentScores {
  decoding: number;
  fluency: number;
  comprehension: number;
}

export interface RubricCriterion {
  id: string;
  text: string;
  detected: boolean;
}

export type ProfileNeed =
  | "Mustaqil o‘quvchi"
  | "Ravonlik yordami kerak"
  | "Tushunish yordami kerak"
  | "Dekodlash yordami kerak"
  | "Qayta baholash kerak";

export interface Student {
  id: string;
  name: string;
  age: number;
  classroom: string;
  lastAssessmentDate?: string;
  profile: ProfileNeed;
  scores?: AssessmentScores;
  trend?: AssessmentScores[];
}

export interface AssessmentResult {
  id: string;
  studentId: string;
  studentName: string;
  passageId: string;
  passageTitle: string;
  date: string;
  durationSeconds: number;
  wordsPerMinute: number;
  pauses: PauseEvent[];
  words: PassageWord[];
  retellingTranscript: string;
  detectedConcepts: string[];
  missingConcepts: string[];
  detectedRelations: string[];
  missingRelations: string[];
  inferenceTranscript: string;
  inferenceCriteria: RubricCriterion[];
  scores: AssessmentScores;
  diagnosis: string;
  recommendation: string;
  profile: ProfileNeed;
}

export type DemoProfileId = "fluent_low_comp" | "slow_high_comp" | "decoding_hard";

export interface DemoProfile {
  id: DemoProfileId;
  label: string;
  studentId: string;
  scores: AssessmentScores;
  wordsPerMinute: number;
  durationSeconds: number;
  wordEvents: Array<{
    index: number;
    status: WordStatus;
    detectedText?: string;
    confidence?: number;
    startTime: number;
  }>;
  pauses: PauseEvent[];
  retellingTranscript: string;
  detectedConcepts: string[];
  missingConcepts: string[];
  detectedRelations: string[];
  missingRelations: string[];
  inferenceTranscript: string;
  inferenceCriteria: RubricCriterion[];
  diagnosis: string;
  recommendation: string;
  profile: ProfileNeed;
}
