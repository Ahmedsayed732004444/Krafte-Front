import { apiClient } from "@/lib/api/client";
import type { NotificationListResponse } from "../types/notifications";

class NotificationService {
  async getAll(page = 1, pageSize = 20, unreadOnly?: boolean): Promise<NotificationListResponse> {
    const q = new URLSearchParams();
    q.append("page", String(page));
    q.append("pageSize", String(pageSize));
    if (unreadOnly !== undefined) {
      q.append("unreadOnly", String(unreadOnly));
    }
    const res = await apiClient.get<NotificationListResponse>(`/notifications?${q.toString()}`);
    return res.data;
  }

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<{ count: number }>("/notifications/unread-count");
    return res.data.count;
  }

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.patch("/notifications/read-all");
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  }
}

export const notificationService = new NotificationService();
