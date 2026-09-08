import apiClient from './client';
import { ApiResponse } from '../types/auth.types';
import {
  MLClassificationResult,
  MLPriceResult,
  MLPriceRequestPayload,
} from '../types/ml.types';

export const mlApi = {
  // Classify material image
  classifyImage: async (imageFile: File): Promise<MLClassificationResult> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post<MLClassificationResult>('/ml/classify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get AI price recommendation
  getPriceRecommendation: async (payload: MLPriceRequestPayload): Promise<MLPriceResult> => {
    const response = await apiClient.post<MLPriceResult>('/ml/price', payload);
    return response.data;
  },

  // Predict and price together in one single call
  predictAndPrice: async (
    imageFile: File,
    payload: { state: string; city: string; quantity: number; total_weight_kg: number }
  ): Promise<MLPriceResult> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('state', payload.state);
    formData.append('city', payload.city);
    formData.append('quantity', String(payload.quantity));
    formData.append('total_weight_kg', String(payload.total_weight_kg));

    const response = await apiClient.post<MLPriceResult>('/ml/predict-and-price', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get valid material categories supported by the ML engine
  getValidCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<{ categories: string[] }>>('/ml/categories');
    return response.data?.data?.categories || [];
  },

  // Validate a category
  validateCategory: async (category: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(`/ml/validate/${category}`);
    return response.data?.data;
  },

  // Check ML service health
  getHealth: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/ml/health');
    return response.data?.data;
  },
};

