import { useEffect, useState } from 'react';
import { getSession } from './auth';
import { SESSION_EVENT } from './sessionEvents';

/**
 * Read the current session and subscribe to same-tab session changes.
 * @returns {Object|null} Current validated session.
 */
export default function useSession() {
  const [session, setSessionState] = useState(getSession);
  useEffect(() => {
    const refresh = () => setSessionState(getSession());
    window.addEventListener(SESSION_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(SESSION_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return session;
}

