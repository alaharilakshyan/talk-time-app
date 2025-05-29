
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RefreshOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showToast?: boolean;
}

export const useRefresher = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const refresh = useCallback(async (
    refreshFn: () => Promise<void>,
    options: RefreshOptions = {}
  ) => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refreshFn();
      options.onSuccess?.();
      if (options.showToast !== false) {
        toast({
          title: "Refreshed",
          description: "Data has been updated successfully.",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
      options.onError?.(errorMessage);
      if (options.showToast !== false) {
        toast({
          title: "Refresh Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, toast]);

  return { refresh, isRefreshing };
};
