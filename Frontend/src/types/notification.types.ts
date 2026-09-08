import { PaginationMeta } from './lot.types';

export interface AppNotification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  priority?: 'low' | 'medium' | 'high';
  deliveryMethod?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  unreadCount: number;
  totalCount: number;
}

export interface PaginatedNotificationsResponse {
  notifications: AppNotification[];
  pagination: PaginationMeta;
}

