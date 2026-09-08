import apiClient from './client';
import { ApiResponse } from '../types/auth.types';
import { Lot, PaginatedLotsResponse } from '../types/lot.types';

export interface CreateLotPayload {
  images: File[];
  estimatedWeight: number;
  quantity?: number;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
    pickupAddress?: string;
    state?: string;
    city?: string;
  };
  state?: string;
  city?: string;
  category?: string;
  subCategory?: string;
  description?: string;
  materialId?: string;
  confirmCategory?: string;
  manualCategory?: string;
  estimatedPrice?: number;
  schedulePickup?: {
    date: string;
    timeSlot: string;
  };
}

export const lotsApi = {
  // Create Lot (Multipart)
  createLot: async (payload: CreateLotPayload): Promise<ApiResponse<{ lot: Lot; ml?: any }>> => {
    const formData = new FormData();
    payload.images.forEach((file) => {
      formData.append('images', file);
    });

    formData.append('estimatedWeight', String(payload.estimatedWeight));
    formData.append('location', JSON.stringify(payload.location));

    if (payload.quantity) formData.append('quantity', String(payload.quantity));
    if (payload.state) formData.append('state', payload.state);
    if (payload.city) formData.append('city', payload.city);
    if (payload.subCategory) formData.append('subCategory', payload.subCategory);
    if (payload.description) formData.append('description', payload.description);
    if (payload.materialId) formData.append('materialId', payload.materialId);
    if (payload.confirmCategory) formData.append('confirmCategory', payload.confirmCategory);
    if (payload.manualCategory) formData.append('manualCategory', payload.manualCategory);
    if (payload.estimatedPrice) formData.append('estimatedPrice', String(payload.estimatedPrice));
    if (payload.schedulePickup) formData.append('schedulePickup', JSON.stringify(payload.schedulePickup));

    const response = await apiClient.post<ApiResponse<{ lot: Lot; ml?: any }>>('/lots', formData);
    return response.data;
  },

  // Available lots for buyers / recyclers to browse
  getAvailableLots: async (params?: {
    page?: number;
    limit?: number;
    materialId?: string;
    minWeight?: number;
    maxWeight?: number;
  }): Promise<ApiResponse<PaginatedLotsResponse>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.materialId) query.append('materialId', params.materialId);
    if (params?.minWeight) query.append('minWeight', String(params.minWeight));
    if (params?.maxWeight) query.append('maxWeight', String(params.maxWeight));

    const response = await apiClient.get<ApiResponse<PaginatedLotsResponse>>(`/lots?${query.toString()}`);
    return response.data;
  },

  // Collector's own lots
  getCollectorLots: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedLotsResponse>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status && params.status !== 'all') query.append('status', params.status);

    const response = await apiClient.get<ApiResponse<PaginatedLotsResponse>>(`/lots/collector?${query.toString()}`);
    return response.data;
  },

  // Recycler's assigned / accepted lots
  getRecyclerLots: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedLotsResponse>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status && params.status !== 'all') query.append('status', params.status);

    const response = await apiClient.get<ApiResponse<PaginatedLotsResponse>>(`/lots/recycler?${query.toString()}`);
    return response.data;
  },

  // Single lot details
  getLotById: async (lotId: string): Promise<ApiResponse<Lot>> => {
    const response = await apiClient.get<ApiResponse<Lot>>(`/lots/${lotId}`);
    return response.data;
  },

  // Update lot status (e.g. picked, delivered, cancelled)
  updateLotStatus: async (
    lotId: string,
    data: {
      status: string;
      actualWeight?: number;
      finalPrice?: number;
      cancellationReason?: string;
      recyclerId?: string;
    }
  ): Promise<ApiResponse<Lot>> => {
    const response = await apiClient.patch<ApiResponse<Lot>>(`/lots/${lotId}`, data);
    return response.data;
  },

  // Accept a lot (Recycler action)
  acceptLot: async (lotId: string, price?: number): Promise<ApiResponse<Lot>> => {
    const response = await apiClient.patch<ApiResponse<Lot>>(`/lots/${lotId}/accept`, {
      price,
    });
    return response.data;
  },

  // Delete pending lot
  deleteLot: async (lotId: string): Promise<ApiResponse<Record<string, never>>> => {
    const response = await apiClient.delete<ApiResponse<Record<string, never>>>(`/lots/${lotId}`);
    return response.data;
  },
};

