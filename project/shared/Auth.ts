/** Product-facing roles stored on accounts (plus platform_admin for demo operations). */
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
  organizationName: string | null;
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
}

export interface LoginBody {
  email: string;
  password: string;
}
