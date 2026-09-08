import { Material } from './material.types';
import { User } from './auth.types';

export interface HistoricalPrice {
  price: number;
  date: string;
}

export interface MaterialPrice {
  _id: string;
  materialId: Material | string;
  recyclerId: User | string;
  pricePerKg: number;
  minQuantity: number;
  maxQuantity: number;
  validUntil?: string;
  specialNotes?: string;
  isActive: boolean;
  historicalPrices: HistoricalPrice[];
  createdAt: string;
  updatedAt: string;
}

export interface SetPricePayload {
  materialId: string;
  pricePerKg: number;
  minQuantity?: number;
  maxQuantity?: number;
  validUntil?: string;
  specialNotes?: string;
}

