import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
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

    // Fetch initial count
    fetchUnreadCount();

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7283";
    const hubUrl = `${apiBase}/hubs/notifications`;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem("token") || ""
      })
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        setConnectionState(HubConnectionState.Connecting);
        await connection.start();
        setConnectionState(HubConnectionState.Connected);
        console.log("Connected to Notification Hub");
      } catch (err) {
        setConnectionState(HubConnectionState.Disconnected);
        console.error("Error starting SignalR connection:", err);
      }
    };

    startConnection();

    connection.on("ReceiveNotification", (notification: NotificationResponse) => {
      // Show toast
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
      // Invalidate queries or refetch count
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
      connection.stop();
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
