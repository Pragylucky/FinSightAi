import { useEffect, useState } from 'react';

// True once `active` has stayed true for `ms`. Used to explain long waits (e.g. a sleeping free-tier server).
export default function useSlow(active, ms = 5000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!active) return undefined;
    const t = setTimeout(() => setSlow(true), ms);
    return () => { clearTimeout(t); setSlow(false); };
  }, [active, ms]);
  return active && slow;
}
