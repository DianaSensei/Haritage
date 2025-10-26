/**
 * Data Hooks
 * React hooks for easy access to data layer
 * Simplifies component integration with repositories
 */

import { feedRepository, mockStore, notificationRepository, userRepository } from '@/shared/data';
import { QueryOptions, RepositoryResult } from '@/shared/data/repositories/IRepository';
import { FeedItem } from '@/shared/types';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for loading data with error and loading states
 */
function useAsyncData<T>(
  fetchFn: () => Promise<RepositoryResult<T>>,
  deps: (string | number | undefined)[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Unknown error');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}

/**
 * User Data Hooks
 */
export function useCurrentUser() {
  return useAsyncData(() => userRepository().getCurrentUser());
}

export function useUser(userId: string) {
  return useAsyncData(() => userRepository().getUserById(userId), [userId]);
}

export function useUsers(options?: QueryOptions) {
  return useAsyncData(() => userRepository().getUsers(options), [options?.page, options?.limit, options?.search]);
}

export function useLoginWithPhone(phoneNumber: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await userRepository().loginWithPhone(phoneNumber);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
      return result;
    } catch (err) {
      const errorMsg = String(err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [phoneNumber]);

  return { login, loading, error };
}

export function useVerifyOTP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async (phoneNumber: string, otp: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await userRepository().verifyOTP(phoneNumber, otp);
      if (!result.success) {
        setError(result.error || 'OTP verification failed');
      }
      return result;
    } catch (err) {
      const errorMsg = String(err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { verify, loading, error };
}

export function useLogout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await userRepository().logout();
      if (!result.success) {
        setError(result.error || 'Logout failed');
      }
      return result;
    } catch (err) {
      const errorMsg = String(err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { logout, loading, error };
}

/**
 * Feed Data Hooks
 */
export function useFeedItems(options?: QueryOptions) {
  return useAsyncData(() => feedRepository().getFeedItems(options), [options?.page, options?.limit, options?.search]);
}

export function useFeedItem(id: string) {
  return useAsyncData(() => feedRepository().getFeedItemById(id), [id]);
}

export function useUserFeedItems(userId: string, options?: QueryOptions) {
  return useAsyncData(() => feedRepository().getUserFeedItems(userId, options), [userId, options?.page]);
}

export function useTrendingFeedItems(options?: QueryOptions) {
  return useAsyncData(() => feedRepository().getTrendingFeedItems(options), [options?.page]);
}

export function useCreateFeedItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (item: Omit<FeedItem, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await feedRepository().createFeedItem(item);
      if (!result.success) {
        setError(result.error || 'Failed to create feed item');
      }
      return result;
    } catch (err) {
      const errorMsg = String(err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

export function useLikeFeedItem(id: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const like = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await feedRepository().likeFeedItem(id);
      if (!result.success) {
        setError(result.error || 'Failed to like');
      }
      return result;
    } catch (err) {
      const errorMsg = String(err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { like, loading, error };
}

export function useSaveFeedItem(id: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await feedRepository().saveFeedItem(id);
      if (!result.success) {
        setError(result.error || 'Failed to save');
      }
      return result;
    } catch (err) {
      const errorMsg = String(err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { save, loading, error };
}

/**
 * Notification Data Hooks
 */
export function useNotifications(options?: QueryOptions) {
  return useAsyncData(() => notificationRepository().getNotifications(options), [options?.page]);
}

export function useUnreadNotifications() {
  return useAsyncData(() => notificationRepository().getUnreadNotifications());
}

export function useMarkNotificationAsRead(id: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mark = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await notificationRepository().markNotificationAsRead(id);
      if (!result.success) {
        setError(result.error || 'Failed to mark as read');
      }
      return result;
    } catch (err) {
      const errorMsg = String(err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { mark, loading, error };
}

/**
 * Hook to initialize mock store
 */
export function useMockStoreInitialization() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mockStore
      .initialize()
      .then(() => setInitialized(true))
      .catch((err: unknown) => setError(String(err)));
  }, []);

  return { initialized, error };
}
