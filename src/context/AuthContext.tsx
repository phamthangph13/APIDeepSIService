import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  exchangeOAuthCode,
  fetchMe,
  loginWithPassword,
  logout as logoutRequest,
  registerWithPassword,
  resetPassword as resetPasswordRequest,
  type AuthOutcome,
  type User,
} from "../lib/auth";
import {
  clearAccessToken,
  getAccessToken,
  refreshAccessToken,
  setUnauthorizedHandler,
} from "../lib/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthOutcome>;
  register: (name: string, email: string, password: string) => Promise<AuthOutcome>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  completeOAuth: (code: string) => Promise<AuthOutcome>;
  resetPassword: (token: string, password: string) => Promise<AuthOutcome>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

let bootstrapPromise: Promise<User | null> | null = null;

function bootstrapSession(): Promise<User | null> {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    try {
      if (!getAccessToken() && !(await refreshAccessToken())) return null;
      return await fetchMe();
    } catch {
      return null;
    }
  })();
  return bootstrapPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const epochRef = useRef(0);

  const applySession = useCallback((nextUser: User) => {
    epochRef.current += 1;
    setUser(nextUser);
  }, []);

  useEffect(() => {
    const epoch = epochRef.current;
    void bootstrapSession().then((bootstrapped) => {
      if (epochRef.current !== epoch) {
        setLoading(false);
        return;
      }
      if (bootstrapped) {
        setUser(bootstrapped);
      } else {
        clearAccessToken();
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      epochRef.current += 1;
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginWithPassword(email, password);
      if (result.accessToken && result.user) applySession(result.user);
      return result;
    },
    [applySession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await registerWithPassword(name, email, password);
      if (result.accessToken && result.user) applySession(result.user);
      return result;
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    epochRef.current += 1;
    await logoutRequest();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const fresh = await fetchMe();
      applySession(fresh);
    } catch {
      clearAccessToken();
      epochRef.current += 1;
      setUser(null);
    }
  }, [applySession]);

  const completeOAuth = useCallback(
    async (code: string) => {
      const result = await exchangeOAuthCode(code);
      if (result.accessToken && result.user) applySession(result.user);
      return result;
    },
    [applySession],
  );

  const resetPassword = useCallback(
    async (token: string, password: string) => {
      const result = await resetPasswordRequest(token, password);
      if (result.accessToken && result.user) applySession(result.user);
      return result;
    },
    [applySession],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refresh,
      completeOAuth,
      resetPassword,
    }),
    [user, loading, login, register, logout, refresh, completeOAuth, resetPassword],
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
