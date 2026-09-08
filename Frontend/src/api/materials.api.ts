import apiClient from './client';
import { ApiResponse } from '../types/auth.types';
import { Material } from '../types/material.types';

export const materialsApi = {
  // Get all materials
  getAllMaterials: async (page = 1, limit = 50): Promise<ApiResponse<Material[]>> => {
    const response = await apiClient.get<ApiResponse<Material[]>>(`/materials?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get material categories
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/materials/categories');
    return response.data;
  },

  // Get materials by category
  getByCategory: async (category: string): Promise<ApiResponse<Material[]>> => {
    const response = await apiClient.get<ApiResponse<Material[]>>(`/materials/category/${category}`);
    return response.data;
  },

  // Get material by ID
  getById: async (materialId: string): Promise<ApiResponse<Material>> => {
    const response = await apiClient.get<ApiResponse<Material>>(`/materials/${materialId}`);
    return response.data;
  },
};

