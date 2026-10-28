import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PLANS, type Plan, type PlanId } from "../data/plans";
import { fetchPlans } from "../lib/plans";

type PlansContextValue = {
  plans: Plan[];
  byId: Record<PlanId, Plan>;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const PlansContext = createContext<PlansContextValue | null>(null);

function indexPlans(plans: Plan[]): Record<PlanId, Plan> {
  return Object.fromEntries(plans.map((plan) => [plan.id, plan])) as Record<PlanId, Plan>;
}

export function PlansProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>(PLANS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchPlans();
      if (next.length > 0) setPlans(next);
      setError(null);
    } catch {
      setError("Không tải được bảng giá từ máy chủ. Đang dùng giá mặc định.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const byId = useMemo(() => indexPlans(plans), [plans]);

  const value = useMemo(
    () => ({ plans, byId, loading, error, reload }),
    [plans, byId, loading, error, reload],
  );

  return <PlansContext.Provider value={value}>{children}</PlansContext.Provider>;
}

export function usePlans(): PlansContextValue {
  const context = useContext(PlansContext);
  if (!context) throw new Error("usePlans must be used inside PlansProvider");
  return context;
}
