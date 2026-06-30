import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { toast } from "sonner";
import { notificationService } from "../services/notificationService";
import type { NotificationResponse } from "../types/notifications";

interface NotificationContextProps {
  unreadCount: number;
  connectionState: HubConnectionState;
  fetchUnreadCount: () => Promise<void>;
  decrementUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionState, setConnectionState] = useState<HubConnectionState>(HubConnectionState.Disconnected);

  // Ref to track if component is still mounted (guards against Strict Mode double-mount)
  const isMounted = useRef(false);

  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silently ignore – backend may be offline
    }
  }, []);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setConnectionState(HubConnectionState.Disconnected);
      return;
    }

    // Guard: skip if already mounted (React Strict Mode fires effect twice in dev)
    if (isMounted.current) return;
    isMounted.current = true;

    // Fetch initial count without awaiting
    fetchUnreadCount();

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7283";
    const hubUrl = `${apiBase}/hubs/notifications`;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem("token") || ""
      })
      // Reconnect at 0s, 2s, 10s, 30s intervals then give up
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();

    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const startConnection = async () => {
      if (stopped) return;
      try {
        setConnectionState(HubConnectionState.Connecting);
        await connection.start();
        if (!stopped) {
          setConnectionState(HubConnectionState.Connected);
        }
      } catch {
        // Backend is offline – silently wait and retry once after 15s
        setConnectionState(HubConnectionState.Disconnected);
        if (!stopped) {
          retryTimeout = setTimeout(() => startConnection(), 15000);
        }
      }
    };

    startConnection();

    connection.on("ReceiveNotification", (notification: NotificationResponse) => {
      toast.info(notification.title, {
        description: notification.message,
        duration: 8000,
        action: notification.entityId ? {
          label: "عرض الحجز",
          onClick: () => {
            window.location.href = `/bookings/${notification.entityId}`;
          }
        } : undefined,
      });
      fetchUnreadCount();
    });

    connection.on("UnreadCountUpdated", (count: number) => {
      setUnreadCount(count);
    });

    connection.onclose(() => {
      setConnectionState(HubConnectionState.Disconnected);
    });

    connection.onreconnecting(() => {
      setConnectionState(HubConnectionState.Reconnecting);
    });

    connection.onreconnected(() => {
      setConnectionState(HubConnectionState.Connected);
      fetchUnreadCount();
    });

    return () => {
      stopped = true;
      isMounted.current = false;
      if (retryTimeout) clearTimeout(retryTimeout);
      // Stop gracefully – ignore errors if already stopped
      connection.stop().catch(() => {});
    };
  }, [fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, connectionState, fetchUnreadCount, decrementUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
