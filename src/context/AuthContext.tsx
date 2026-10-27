import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PlanId } from "../data/plans";
import {
  getSessionUser,
  loginWithOAuth,
  loginWithPassword,
  logout as logoutStorage,
  registerWithPassword,
  seedDemo,
  updatePlan as updatePlanStorage,
  type User,
} from "../lib/auth";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user?: User; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ user?: User; error?: string }>;
  loginWithProvider: (provider: "google" | "github") => User;
  logout: () => void;
  refresh: () => void;
  setPlan: (plan: PlanId) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDemo();
    setUser(getSessionUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginWithPassword(email, password);
    if (result.user) setUser(result.user);
    return result;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await registerWithPassword(name, email, password);
    if (result.user) setUser(result.user);
    return result;
  }, []);

  const loginWithProvider = useCallback((provider: "google" | "github") => {
    const nextUser = loginWithOAuth(provider);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    logoutStorage();
    setUser(null);
  }, []);

  const refresh = useCallback(() => {
    setUser(getSessionUser());
  }, []);

  const setPlan = useCallback(
    (plan: PlanId) => {
      if (!user) return;
      const updated = updatePlanStorage(user.id, plan);
      if (updated) setUser(updated);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      loginWithProvider,
      logout,
      refresh,
      setPlan,
    }),
    [user, loading, login, register, loginWithProvider, logout, refresh, setPlan],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
