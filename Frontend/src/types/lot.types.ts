import { User } from './auth.types';
import { Material } from './material.types';

export type LotStatus =
  | 'pending'
  | 'accepted'
  | 'picked'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface LotLocation {
  address?: string;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  pickupAddress?: string;
  deliveryAddress?: string;
  state?: string;
  city?: string;
}

export interface MatchedRecyclerInfo {
  recyclerId: User | string;
  recyclerName?: string;
  phoneNumber?: string;
  price: number;
  distance: number;
  score: number;
  estimatedTotal?: number;
  breakdown?: {
    price: number;
    distance: number;
    rating: number;
    availability: number;
  };
  matchedAt?: string;
}

export interface LotMLPrediction {
  predictedCategory?: string;
  confidenceScore?: number;
  predictedPrice?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  matchLevel?: string;
  unit?: string;
}

export interface Lot {
  _id: string;
  collectorId: User;
  recyclerId?: User | null;
  materialId?: Material | null;
  images: string[];
  estimatedWeight: number;
  actualWeight?: number | null;
  estimatedPrice: number;
  finalPrice?: number | null;
  location: LotLocation;
  status: LotStatus;
  description?: string;
  schedulePickup?: {
    date?: string;
    timeSlot?: string;
  };
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  matchedRecyclers?: MatchedRecyclerInfo[];
  mlPrediction?: LotMLPrediction;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedLotsResponse {
  lots: Lot[];
  pagination: PaginationMeta;
}

