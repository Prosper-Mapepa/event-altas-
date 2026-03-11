"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";

type AuthUser = api.AuthUser;

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, role?: "explorer" | "business" | "admin") => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("eventatlas_token") : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: u } = await api.auth.me();
      setUser(u);
    } catch {
      localStorage.removeItem("eventatlas_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { user: u, token } = await api.auth.signIn({ email, password });
      localStorage.setItem("eventatlas_token", token);
      setUser(u);
      router.push("/discover");
    },
    [router]
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string, role?: "explorer" | "business" | "admin") => {
      const { user: u, token } = await api.auth.signUp({ email, password, name, role });
      localStorage.setItem("eventatlas_token", token);
      setUser(u);
      router.push("/discover");
    },
    [router]
  );

  const signOut = useCallback(() => {
    localStorage.removeItem("eventatlas_token");
    setUser(null);
    router.push("/auth/sign-in");
  }, [router]);

  const value: AuthContextValue = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
