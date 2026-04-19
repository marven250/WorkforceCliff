export interface Provider {
  id: number;
  name: string;
  integration_type: string | null;
  is_enabled: boolean | number | null;
  redirect_url: string | null;
  /** Null when the learner has not requested eligibility for this provider yet. */
  status: string | null;
}

export interface User {
  id: number;
  name: string;
}
