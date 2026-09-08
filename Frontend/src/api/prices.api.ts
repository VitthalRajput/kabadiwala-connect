import apiClient from './client';
import { ApiResponse } from '../types/auth.types';
import { MaterialPrice, SetPricePayload } from '../types/price.types';
import { PaginationMeta } from '../types/lot.types';

export interface PaginatedPricesResponse {
  prices: MaterialPrice[];
  pagination: PaginationMeta;
}

export const pricesApi = {
  // Set or update price for a material (Recycler action)
  setPrice: async (payload: SetPricePayload): Promise<ApiResponse<MaterialPrice>> => {
    const response = await apiClient.post<ApiResponse<MaterialPrice>>('/prices', payload);
    return response.data;
  },

  // Get logged-in recycler's prices
  getMyPrices: async (page = 1, limit = 10): Promise<ApiResponse<PaginatedPricesResponse>> => {
    const response = await apiClient.get<ApiResponse<PaginatedPricesResponse>>(
      `/prices?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get all active prices for a specific material
  getPricesByMaterial: async (materialId: string): Promise<ApiResponse<MaterialPrice[]>> => {
    const response = await apiClient.get<ApiResponse<MaterialPrice[]>>(`/prices/material/${materialId}`);
    return response.data;
  },

  // Get best price for a material
  getBestPrice: async (materialId: string): Promise<ApiResponse<MaterialPrice>> => {
    const response = await apiClient.get<ApiResponse<MaterialPrice>>(`/prices/material/${materialId}/best`);
    return response.data;
  },

  // Get historical prices for a material
  getPriceHistory: async (materialId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/prices/material/${materialId}/history`);
    return response.data;
  },

  // Deactivate a price listing
  deactivatePrice: async (priceId: string): Promise<ApiResponse<Record<string, never>>> => {
    const response = await apiClient.delete<ApiResponse<Record<string, never>>>(`/prices/${priceId}`);
    return response.data;
  },
};

