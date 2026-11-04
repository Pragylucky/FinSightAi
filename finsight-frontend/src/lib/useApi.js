import { useCallback, useEffect, useState } from 'react';

// Tiny data-fetch hook: { data, loading, error, reload }.
// `fn` must be stable (module-level or wrapped in useCallback).
// `allow404` treats a 404 as "no data yet" instead of an error.
export default function useApi(fn, { allow404 = false } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fn()
      .then((data) => !cancelled && setState({ data, loading: false, error: '' }))
      .catch((err) => {
        if (cancelled) return;
        const empty = allow404 && /not found/i.test(err.message);
        setState({ data: null, loading: false, error: empty ? '' : err.message });
      });
    return () => { cancelled = true; };
  }, [fn, tick, allow404]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    setTick((t) => t + 1);
  }, []);

  // Re-fetch without flashing the loading state (used for background polling)
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { ...state, reload, refresh };
}
