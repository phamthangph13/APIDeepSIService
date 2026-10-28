import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";
import { errorMessage } from "./api";

type QueryState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useApiQuery<T>(loader: () => Promise<T>, deps: DependencyList) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const requestRef = useRef(0);
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await loaderRef.current();
      if (requestRef.current === requestId) {
        setState({ data, loading: false, error: null });
      }
    } catch (error) {
      if (requestRef.current === requestId) {
        setState((current) => ({
          data: current.data,
          loading: false,
          error: errorMessage(error),
        }));
      }
    }
    // The loader is read through a ref so callers can pass inline functions
    // without restarting the query on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load };
}
