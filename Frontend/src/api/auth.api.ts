import apiClient from './client';
import {
  ApiResponse,
  LoginResponseData,
  LoginPayload,
  RegisterPayload,
  User,
  UpdateLocationPayload,
} from '../types/auth.types';

export const authApi = {
  // Login
  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> => {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('/users/login', payload);
    return response.data;
  },

  // Register user
  register: async (payload: RegisterPayload): Promise<ApiResponse<User>> => {
    const formData = new FormData();
    formData.append('fullName', payload.fullName);
    formData.append('phoneNumber', payload.phoneNumber);
    formData.append('password', payload.password);
    formData.append('role', payload.role);

    if (payload.email) {
      formData.append('email', payload.email);
    }

    if (payload.address) {
      formData.append('address', JSON.stringify(payload.address));
    }

    if (payload.profilePicture) {
      formData.append('profilePicture', payload.profilePicture);
    }

    const response = await apiClient.post<ApiResponse<User>>('/users/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse<Record<string, never>>> => {
    const response = await apiClient.post<ApiResponse<Record<string, never>>>('/users/logout');
    return response.data;
  },

  // Get current authenticated user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: {
    fullName?: string;
    email?: string;
    address?: any;
    profilePicture?: File;
  }): Promise<ApiResponse<User>> => {
    const formData = new FormData();
    if (data.fullName) formData.append('fullName', data.fullName);
    if (data.email) formData.append('email', data.email);
    if (data.address) {
      formData.append('address', typeof data.address === 'string' ? data.address : JSON.stringify(data.address));
    }
    if (data.profilePicture) {
      formData.append('profilePicture', data.profilePicture);
    }

    const response = await apiClient.patch<ApiResponse<User>>('/users/update-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update GPS location
  updateLocation: async (payload: UpdateLocationPayload): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>('/users/update-location', payload);
    return response.data;
  },

  // Change password
  changePassword: async (payload: { oldPassword: string; newPassword: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch<ApiResponse<any>>('/users/change-password', payload);
    return response.data;
  },

  // Get list of collectors
  getCollectors: async (page = 1, limit = 10): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/users/collectors?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get list of recyclers
  getRecyclers: async (page = 1, limit = 10): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/users/recyclers?page=${page}&limit=${limit}`);
    return response.data;
  },
};

