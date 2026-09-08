import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiRequestError } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiRequestError | null;
  retry: () => void;
}

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiRequestError | null>(null);
  
  const requestCounter = useRef(0);
  const isMounted = useRef(true);

  const execute = useCallback(async () => {
    requestCounter.current += 1;
    const currentRequestId = requestCounter.current;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      if (isMounted.current && currentRequestId === requestCounter.current) {
        setData(result);
        setIsLoading(false);
      }
    } catch (err) {
      if (isMounted.current && currentRequestId === requestCounter.current) {
        setError(err as ApiRequestError);
        setIsLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    isMounted.current = true;
    execute();
    return () => {
      isMounted.current = false;
    };
  }, [execute]);

  return {
    data,
    isLoading,
    error,
    retry: execute,
  };
}
