import apiClient from './client';
import { ApiResponse } from '../types/auth.types';

export const auditApi = {
  logAction: async (payload: {
    userId: string;
    userRole: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    changes?: any;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>('/audit', payload);
    return response.data;
  },

  getResourceAudit: async (resourceType: string, resourceId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/audit/resource/${resourceType}/${resourceId}`);
    return response.data;
  },

  getUserActivity: async (userId: string, page = 1, limit = 10): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/audit/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  getHandoverRecords: async (transactionId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/audit/handover/${transactionId}`);
    return response.data;
  },

  getTraceabilityReport: async (lotId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/audit/traceability/${lotId}`);
    return response.data;
  },
};

