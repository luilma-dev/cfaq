import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { initialState, parseState, type StudyState } from '../lib/learning';

const KEY = '@cfaq/study/v1';
type Context = {
  state: StudyState;
  update: (change: (previous: StudyState) => StudyState) => void;
  ready: boolean;
  storageError: string | null;
  retry: () => void;
  reset: () => void;
};
const StudyContext = createContext<Context | null>(null);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StudyState>(initialState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [canSave, setCanSave] = useState(false);
  const queue = useRef(Promise.resolve());
  const mounted = useRef(true);

  const load = useCallback(() => {
    return AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (mounted.current) {
          setState(raw ? parseState(raw) : initialState());
          setCanSave(true);
          setStorageError(null);
        }
      })
      .catch(() => {
        if (mounted.current) {
          setCanSave(false);
          setStorageError(
            'Não foi possível recuperar o progresso. Tente novamente. Você pode estudar, mas os dados ainda não serão salvos.',
          );
        }
      })
      .finally(() => {
        if (mounted.current) setReady(true);
      });
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);
  useEffect(() => {
    if (!ready || !canSave) return;
    queue.current = queue.current.then(async () => {
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify(state));
        if (mounted.current) setStorageError(null);
      } catch {
        if (mounted.current)
          setStorageError(
            'O progresso está nesta sessão, mas não foi salvo no aparelho. Verifique o armazenamento e tente novamente.',
          );
      }
    });
  }, [state, ready, canSave]);

  return (
    <StudyContext.Provider
      value={{
        state,
        update: setState,
        ready,
        storageError,
        retry: () => {
          if (!canSave) void load();
          else setState((s) => ({ ...s }));
        },
        reset: () => {
          setCanSave(true);
          setState(initialState());
        },
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) throw new Error('StudyProvider não encontrado.');
  return context;
}
