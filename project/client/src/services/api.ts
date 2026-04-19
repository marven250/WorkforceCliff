import { Provider } from "../../../shared/Provider";
import type { AuthResponse, LoginBody, PublicUser, RegisterLearnerBody } from "../../../shared/Auth";
import type { EducationProviderInquiryInput, EmployerInquiryInput } from "../../../shared/Inquiry";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

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
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
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
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
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
  const response = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Session invalid");
  }
  return response.json();
}

export async function fetchPortalHome(): Promise<unknown> {
  const response = await fetch(`${BASE_URL}/api/portal/home`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Could not load dashboard");
  }
  return response.json();
}

export async function fetchAdminInquiries(): Promise<{
  employerInquiries: unknown[];
  educationProviderInquiries: unknown[];
}> {
  const response = await fetch(`${BASE_URL}/api/admin/inquiries`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Could not load inquiries");
  }
  return response.json();
}

export async function submitEmployerInquiry(body: EmployerInquiryInput): Promise<{ id: number; message: string }> {
  const response = await fetch(`${BASE_URL}/api/inquiries/employer`, {
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
  const response = await fetch(`${BASE_URL}/api/inquiries/education-provider`, {
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

export async function fetchProviders(userId: string): Promise<Array<Provider>> {
  const response = await fetch(`${BASE_URL}/providers/${userId}`);
  const providersData = await response.json();
  return providersData;
}
