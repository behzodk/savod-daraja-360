import type { WordStatus } from "./types";

export interface RecognizedWord {
  text: string;
  start?: number | null;
  end?: number | null;
  confidence?: number;
}

export interface AlignedWord {
  status: Extract<WordStatus, "correct" | "omitted" | "substituted">;
  detectedText?: string;
  confidence?: number;
  startTime?: number;
}

function normalize(word: string): string {
  return word
    .toLowerCase()
    .replace(/[ʻʼ'`]/g, "'")
    .replace(/[^\p{L}\p{N}']/gu, "");
}

/**
 * Aligns the expected passage words against the words recognized by speech-to-text
 * using edit-distance alignment (Levenshtein), so omissions/substitutions in the
 * middle of the passage don't desync the rest of the comparison.
 */
export function alignTranscript(expected: string[], recognized: RecognizedWord[]): AlignedWord[] {
  const a = expected.map(normalize);
  const b = recognized.map((w) => normalize(w.text));
  const n = a.length;
  const m = b.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const result: AlignedWord[] = new Array(n);
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const match = i > 0 && j > 0 && a[i - 1] === b[j - 1] && dp[i][j] === dp[i - 1][j - 1];
    const substitute = i > 0 && j > 0 && !match && dp[i][j] === dp[i - 1][j - 1] + 1;
    if (match || substitute) {
      result[i - 1] = {
        status: match ? "correct" : "substituted",
        detectedText: recognized[j - 1].text,
        confidence: recognized[j - 1].confidence,
        startTime: recognized[j - 1].start ?? undefined,
      };
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      result[i - 1] = { status: "omitted" };
      i--;
    } else {
      // extra word spoken that isn't in the passage (repetition, filler) — skip it
      j--;
    }
  }

  return result;
}
