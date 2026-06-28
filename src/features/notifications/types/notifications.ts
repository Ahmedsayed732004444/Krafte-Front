export interface NotificationResponse {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export interface NotificationListResponse {
  items: NotificationResponse[];
  totalCount: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
