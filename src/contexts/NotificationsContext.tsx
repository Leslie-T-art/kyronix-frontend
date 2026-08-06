import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getNotificationUnreadCount, openNotificationsStream } from '../lib/api/client';
import type { ApiError } from '../lib/api/errors';
import { useAuth } from './AuthContext';

interface NotificationsContextValue {
  unreadCount: number;
  error: ApiError | null;
  refreshUnreadCount: () => Promise<void>;
}

const DEFAULT_NOTIFICATIONS_CONTEXT: NotificationsContextValue = {
  unreadCount: 0,
  error: null,
  refreshUnreadCount: async () => undefined
};

const NotificationsContext = createContext<NotificationsContextValue>(DEFAULT_NOTIFICATIONS_CONTEXT);

export function NotificationsProvider({ children }: {children: React.ReactNode;}) {
  const { accessToken, user, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<ApiError | null>(null);

  const refreshUnreadCount = useCallback(async () => {
    if (!accessToken || !user) {
      setUnreadCount(0);
      return;
    }

    const response = await getNotificationUnreadCount(accessToken);
    if (response.error?.code === 'UNAUTHORIZED') {
      signOut();
      return;
    }
    setUnreadCount(response.data?.unreadCount ?? 0);
    setError(response.error);
  }, [accessToken, user, signOut]);

  useEffect(() => {
    void refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!accessToken || !user) return;
    const controller = new AbortController();
    void openNotificationsStream(
      accessToken,
      () => {
        void refreshUnreadCount();
      },
      () => undefined,
      controller.signal
    );
    return () => controller.abort();
  }, [accessToken, user, refreshUnreadCount]);

  const value = useMemo(
    () => ({ unreadCount, error, refreshUnreadCount }),
    [unreadCount, error, refreshUnreadCount]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  return useContext(NotificationsContext);
}
