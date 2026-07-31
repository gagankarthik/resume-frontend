// ── Matching engine types (mirror models.py in resume_matching_api) ──────────

/** How the engine grades a fit. Widened to string because the verdict comes
 *  from an LLM and a new label should render, not crash the page. */
export type Verdict = 'strong' | 'possible' | 'weak' | (string & {});

/** One ranked candidate from POST /match. */
export interface MatchCandidate {
  resume_id: string;
  candidate_name?: string | null;
  /** 0–100, similarity blended with the model's judgment. */
  fit_score: number;
  /** Raw cosine similarity, 0–1. */
  similarity: number;
  qualified: boolean;
  verdict: Verdict;
  matched_skills: string[];
  missing_skills: string[];
  rationale?: string | null;
}

export interface MatchResponse {
  success: boolean;
  count: number;
  candidates: MatchCandidate[];
}

/** Result of adding one resume to the searchable set (POST /ingest). */
export interface IngestResponse {
  success: boolean;
  resume_id: string;
  dim: number;
  stored: boolean;
  /** True when it was already there and the parse was skipped. */
  skipped?: boolean;
}
