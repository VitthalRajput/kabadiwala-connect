import { User } from './auth.types';
import { Lot } from './lot.types';
import { PaginationMeta } from './lot.types';

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | string;
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface HandoverDetails {
  handoverTime?: string;
  handoverGPS?: {
    latitude: number;
    longitude: number;
  };
  receivedBy?: string;
  verifiedBy?: string;
  handoverPhotos?: string[];
}

export interface WeightDetails {
  estimatedWeight: number;
  actualWeight: number;
  weightDifference: number;
  weightUnit: string;
}

export interface CommissionDetails {
  platformFee: number;
  commissionRate: number;
  netAmount: number;
}

export interface Transaction {
  _id: string;
  lotId: Lot;
  collectorId: User;
  recyclerId: User;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: {
    transactionId?: string;
    receiptUrl?: string;
    paidAt?: string;
  };
  weightDetails: WeightDetails;
  commission?: CommissionDetails;
  handoverDetails?: HandoverDetails;
  status: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationMeta;
}

