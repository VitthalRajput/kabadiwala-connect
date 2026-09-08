import apiClient from './client';
import { ApiResponse } from '../types/auth.types';
import { MatchedRecyclerInfo } from '../types/lot.types';

export interface MatchmakingResponseData {
  lotId: string;
  materialName: string;
  estimatedWeight: number;
  matches: MatchedRecyclerInfo[];
  bestMatch: MatchedRecyclerInfo | null;
}

export const matchmakingApi = {
  // Find matching recyclers for a lot
  findRecyclersForLot: async (lotId: string): Promise<ApiResponse<MatchmakingResponseData>> => {
    const response = await apiClient.get<ApiResponse<MatchmakingResponseData>>(`/matchmaking/lot/${lotId}`);
    return response.data;
  },

  // Auto match lot
  autoMatchLot: async (lotId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`/matchmaking/lot/${lotId}/auto`);
    return response.data;
  },

  // Collector matchmaking history
  getMatchHistory: async (page = 1, limit = 10): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/matchmaking/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Match details for a specific lot
  getMatchDetails: async (lotId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/matchmaking/details/${lotId}`);
    return response.data;
  },
};

