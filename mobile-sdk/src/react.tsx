/**
 * Hooks React Native pour le SDK PNC
 * ====================================
 * Simplifient l'utilisation du PNCClient dans les composants React.
 *
 * Usage :
 *   import { usePNC, PNCProvider } from '@pnc/mobile-sdk/react'
 *
 *   <PNCProvider config={pncConfig}>
 *     <App />
 *   </PNCProvider>
 *
 *   function App() {
 *     const { citizen, sendSOS, loading } = usePNC()
 *     ...
 *   }
 */

import { useState, useEffect, useContext, createContext, ReactNode, useCallback } from 'react';
import { PNCClient, PNCClientConfig, Citizen, Alert, Complaint } from './index';

interface PNCContextValue {
  client: PNCClient | null;
  citizen: Citizen | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (input: any) => Promise<void>;
  logout: () => Promise<void>;
  sendSOS: (input: any) => Promise<Alert>;
  submitComplaint: (input: any) => Promise<Complaint>;
  refresh: () => Promise<void>;
}

const PNCContext = createContext<PNCContextValue | null>(null);

export function PNCProvider({
  config,
  children,
}: {
  config: PNCClientConfig;
  children: ReactNode;
}) {
  const [client, setClient] = useState<PNCClient | null>(null);
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pnc = new PNCClient(config);
    setClient(pnc);
    pnc
      .init()
      .then(async (session) => {
        if (session) setCitizen(session.citizen);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      if (!client) return;
      setLoading(true);
      setError(null);
      try {
        const session = await client.auth.login(identifier, password);
        setCitizen(session.citizen);
      } catch (e: any) {
        setError(e.message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const register = useCallback(
    async (input: any) => {
      if (!client) return;
      setLoading(true);
      setError(null);
      try {
        const session = await client.auth.register(input);
        if (session.citizen) setCitizen(session.citizen);
      } catch (e: any) {
        setError(e.message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const logout = useCallback(async () => {
    if (!client) return;
    await client.auth.logout();
    setCitizen(null);
  }, [client]);

  const sendSOS = useCallback(
    async (input: any): Promise<Alert> => {
      if (!client) throw new Error('Client non initialisé');
      return client.alerts.sendSOS(input);
    },
    [client]
  );

  const submitComplaint = useCallback(
    async (input: any): Promise<Complaint> => {
      if (!client) throw new Error('Client non initialisé');
      return client.complaints.submit(input);
    },
    [client]
  );

  const refresh = useCallback(async () => {
    if (!client) return;
    const me = await client.auth.me();
    setCitizen(me);
  }, [client]);

  return (
    <PNCContext.Provider
      value={{ client, citizen, loading, error, login, register, logout, sendSOS, submitComplaint, refresh }}
    >
      {children}
    </PNCContext.Provider>
  );
}

export function usePNC(): PNCContextValue {
  const ctx = useContext(PNCContext);
  if (!ctx) throw new Error('usePNC doit être utilisé dans un <PNCProvider>');
  return ctx;
}
