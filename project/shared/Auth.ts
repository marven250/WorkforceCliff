/** Product-facing roles stored on accounts (plus platform_admin for platform administration). */
export type AccountRole =
  | "learner"
  | "employer"
  | "education_provider"
  | "platform_admin";

export type PublicUserRole = "learner" | "employer" | "education_provider";

export interface PublicUser {
  id: number;
  email: string;
  role: AccountRole;
  firstName: string;
  lastName: string;
  /** For learners who registered via a tenant portal: display name of that employer. */
  organizationName: string | null;
  /** FK to `organizations` when the account belongs to an employer tenant. */
  organizationId: number | null;
  /** URL slug of the employer organization (`/org/:slug`). Derived from `organizations`; null if not linked. */
  employerTenantSlug: string | null;
  phone: string | null;
  state: string | null;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface RegisterLearnerBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  state: string;
  /** Required: tenant the learner is signing up under (validated server-side). */
  employerTenantSlug: string;
}

export interface LoginBody {
  email: string;
  password: string;
  /** When true (tenant `/org/:slug/sign-in`), only `learner` and `employer` accounts may sign in. */
  tenantPortal?: boolean;
}
