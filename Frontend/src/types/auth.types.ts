export type UserRole = 'collector' | 'recycler' | 'admin';

export interface GeoCoordinates {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  coordinates?: GeoCoordinates;
}

export interface User {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  profilePicture?: string | null;
  address?: UserAddress;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface RegisterPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  role: UserRole;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    coordinates?: {
      coordinates: [number, number];
    };
  };
  profilePicture?: File;
}

export interface LoginPayload {
  phoneNumber?: string;
  email?: string;
  password: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
  address?: string | UserAddress;
  profilePicture?: File;
}

export interface UpdateLocationPayload {
  latitude: number;
  longitude: number;
  address?: string;
}

