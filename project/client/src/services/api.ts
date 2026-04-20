import type { ProgramOffering } from "../../../shared/ProgramOffering";
import type { Provider } from "../../../shared/Provider";
import type { AuthResponse, LoginBody, PublicUser, RegisterLearnerBody } from "../../../shared/Auth";
import type { EducationProviderInquiryInput, EmployerInquiryInput } from "../../../shared/Inquiry";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const TOKEN_KEY = "wc_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const t = getStoredToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function registerLearnerRequest(body: RegisterLearnerBody): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Registration failed");
  }
  return response.json();
}

export async function loginRequest(body: LoginBody): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Sign-in failed");
  }
  return response.json();
}

export async function meRequest(): Promise<{ user: PublicUser }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Session invalid");
  }
  return response.json();
}

export async function fetchPortalHome(): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/api/portal/home`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Could not load dashboard");
  }
  return response.json();
}

export async function fetchLearnerProviders(): Promise<Provider[]> {
  const response = await fetch(`${API_BASE_URL}/api/portal/learners/me/providers`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Could not load providers");
  }
  return response.json();
}

export async function fetchLearnerProgramOfferings(): Promise<{ offerings: ProgramOffering[] }> {
  const response = await fetch(`${API_BASE_URL}/api/portal/learners/program-offerings`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Could not load program offerings");
  }
  return response.json();
}

export async function requestLearnerEligibility(providerId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/portal/learners/eligibility-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ providerId }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Could not submit request");
  }
}

export async function approveEligibilitySubmission(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/portal/employer/eligibility/${id}/approve`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Could not approve");
  }
}

export async function rejectEligibilitySubmission(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/portal/employer/eligibility/${id}/reject`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Could not reject");
  }
}

export type AdminInquiryScope = "active" | "archived";

export async function fetchAdminInquiries(scope: AdminInquiryScope = "active"): Promise<{
  employerInquiries: unknown[];
  educationProviderInquiries: unknown[];
}> {
  const q = scope === "archived" ? "?scope=archived" : "";
  const response = await fetch(`${API_BASE_URL}/api/admin/inquiries${q}`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Could not load inquiries");
  }
  return response.json();
}

export async function claimEmployerInquiry(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/inquiries/employer/${id}/claim`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Could not claim inquiry");
  }
}

export async function claimEducationProviderInquiry(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/inquiries/education-provider/${id}/claim`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Could not claim inquiry");
  }
}

export async function completeEmployerInquiry(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/inquiries/employer/${id}/complete`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Could not complete inquiry");
  }
}

export async function completeEducationProviderInquiry(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/inquiries/education-provider/${id}/complete`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Could not complete inquiry");
  }
}

export async function submitEmployerInquiry(body: EmployerInquiryInput): Promise<{ id: number; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/inquiries/employer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Submit failed");
  }
  return response.json();
}

export async function submitEducationProviderInquiry(
  body: EducationProviderInquiryInput,
): Promise<{ id: number; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/inquiries/education-provider`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Submit failed");
  }
  return response.json();
}

