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
import { Sticker } from "../components/Sticker";

export type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  detail?: string;
};

type ToastContextValue = {
  push: (message: string, type?: ToastType, detail?: string) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const STICKER_BY_TYPE = {
  success: "check",
  error: "shield",
  info: "bolt",
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message: string, type: ToastType = "success", detail?: string) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current.slice(-3), { id, message, type, detail }]);
      const timer = window.setTimeout(() => dismiss(id), 4600);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div className={`toast toast--${toast.type}`} key={toast.id} role="status">
            <Sticker name={STICKER_BY_TYPE[toast.type]} size={38} rotate={-4} flat />
            <div className="toast__copy">
              <strong>{toast.message}</strong>
              {toast.detail ? <span>{toast.detail}</span> : null}
            </div>
            <button
              type="button"
              className="toast__close"
              onClick={() => dismiss(toast.id)}
              aria-label="Đóng thông báo"
            >
              <Sticker name="plus" size={17} rotate={45} flat />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
