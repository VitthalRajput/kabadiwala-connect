import apiClient from './client';
import { ApiResponse } from '../types/auth.types';

export const syncApi = {
  startSync: async (deviceId: string, syncType = 'incremental'): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>('/sync/start', {
      deviceId,
      syncType,
    });
    return response.data;
  },

  getOfflineData: async (lastSyncTime?: string): Promise<ApiResponse<any>> => {
    const query = lastSyncTime ? `?lastSyncTime=${encodeURIComponent(lastSyncTime)}` : '';
    const response = await apiClient.get<ApiResponse<any>>(`/sync/offline-data${query}`);
    return response.data;
  },

  getSyncStatus: async (deviceId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/sync/status?deviceId=${encodeURIComponent(deviceId)}`);
    return response.data;
  },

  getSyncHistory: async (page = 1, limit = 10): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/sync/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  syncData: async (syncId: string, payload: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`/sync/${syncId}`, payload);
    return response.data;
  },

  cancelSync: async (syncId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete<ApiResponse<any>>(`/sync/${syncId}`);
    return response.data;
  },
};

