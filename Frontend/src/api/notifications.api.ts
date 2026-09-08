import apiClient from './client';
import { ApiResponse } from '../types/auth.types';
import {
  AppNotification,
  NotificationStats,
  PaginatedNotificationsResponse,
} from '../types/notification.types';

export const notificationsApi = {
  // Get current user's notifications
  getNotifications: async (page = 1, limit = 10): Promise<ApiResponse<PaginatedNotificationsResponse>> => {
    const response = await apiClient.get<ApiResponse<PaginatedNotificationsResponse>>(
      `/notifications?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get notification stats (unread count, etc.)
  getStats: async (): Promise<ApiResponse<NotificationStats>> => {
    const response = await apiClient.get<ApiResponse<NotificationStats>>('/notifications/stats');
    return response.data;
  },

  // Get notification types
  getTypes: async (): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/notifications/types');
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (notificationId: string): Promise<ApiResponse<AppNotification>> => {
    const response = await apiClient.patch<ApiResponse<AppNotification>>(
      `/notifications/${notificationId}`
    );
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<ApiResponse<Record<string, never>>> => {
    const response = await apiClient.patch<ApiResponse<Record<string, never>>>(
      '/notifications/mark-all-read'
    );
    return response.data;
  },

  // Delete single notification
  deleteNotification: async (notificationId: string): Promise<ApiResponse<Record<string, never>>> => {
    const response = await apiClient.delete<ApiResponse<Record<string, never>>>(
      `/notifications/${notificationId}`
    );
    return response.data;
  },

  // Delete all read notifications
  deleteReadNotifications: async (): Promise<ApiResponse<Record<string, never>>> => {
    const response = await apiClient.delete<ApiResponse<Record<string, never>>>(
      '/notifications/delete-read'
    );
    return response.data;
  },
};

