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
  /** For learners: URL slug of the employer tenant (`/org/:slug`). Null for other roles or legacy rows. */
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
