import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api/client';
import type { ApiError } from '../lib/api/errors';
import { useAuth } from '../contexts/AuthContext';

interface QueryState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useBffQuery<T>(path: string): QueryState<T> {
  const { user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    apiFetch<T>(path, { role: user.role, unit: user.unit, actor: user.name }).then((response) => {
      if (cancelled) return;
      setData(response.data);
      setError(response.error);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [path, user, nonce]);

  return { data, error, isLoading, refetch };
}