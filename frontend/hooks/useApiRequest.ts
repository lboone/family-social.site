import { handleAuthRequest } from "@/components/utils/apiRequests";
import { useCallback, useState } from "react";

interface UseApiRequestOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showLoading?: boolean;
}

interface UseApiRequestReturn<T = unknown> {
  isLoading: boolean;
  error: Error | null;
  execute: (request: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export function useApiRequest<T = unknown>(
  options: UseApiRequestOptions<T> = {}
): UseApiRequestReturn<T> {
  const { onSuccess, onError, showLoading = true } = options;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (request: () => Promise<T>) => {
      setError(null);
      try {
        const result = await handleAuthRequest(
          null,
          request,
          showLoading ? setIsLoading : undefined
        );
        if (result) {
          onSuccess?.(result);
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        throw error;
      }
    },
    [onSuccess, onError, showLoading]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset,
  };
}
