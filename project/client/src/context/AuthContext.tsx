import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AccountRole, AuthResponse, LoginBody, PublicUser, RegisterLearnerBody } from "../../../shared/Auth";
import {
  clearStoredToken,
  getStoredToken,
  loginRequest,
  meRequest,
  registerLearnerRequest,
  setStoredToken,
} from "../services/api";
import { clearStoredTenantSlug } from "../lib/tenantSession";

type AuthContextValue = {
  token: string | null;
  user: PublicUser | null;
  loading: boolean;
  login: (body: LoginBody) => Promise<AuthResponse>;
  /** Store a successful auth response (e.g. after validating role before committing session). */
  applySession: (res: AuthResponse) => void;
  registerLearner: (body: RegisterLearnerBody) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: AccountRole[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(getStoredToken()));

  const refreshUser = useCallback(async () => {
    const t = getStoredToken();
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { user: u } = await meRequest();
      setUser(u);
    } catch {
      setUser(null);
      clearStoredToken();
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [token, refreshUser]);

  const applySession = useCallback((res: AuthResponse) => {
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const login = useCallback(
    async (body: LoginBody) => {
      const res: AuthResponse = await loginRequest(body);
      applySession(res);
      return res;
    },
    [applySession],
  );

  const registerLearner = useCallback(async (body: RegisterLearnerBody) => {
    const res: AuthResponse = await registerLearnerRequest(body);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    clearStoredTenantSlug();
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: AccountRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      applySession,
      registerLearner,
      logout,
      refreshUser,
      hasRole,
    }),
    [token, user, loading, login, applySession, registerLearner, logout, refreshUser, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
