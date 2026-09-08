import apiClient from './client';
import { ApiResponse } from '../types/auth.types';
import {
  Transaction,
  PaginatedTransactionsResponse,
  PaymentMethod,
  PaymentStatus,
} from '../types/transaction.types';

export interface CreateTransactionPayload {
  lotId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  weightDetails?: {
    actualWeight: number;
  };
  notes?: string;
  paymentDetails?: any;
}

export interface UpdateHandoverPayload {
  handoverGPS?: {
    latitude: number;
    longitude: number;
  };
  receivedBy?: string;
  verifiedBy?: string;
  handoverPhotos?: string[];
}

export interface UpdatePaymentPayload {
  paymentStatus: PaymentStatus;
  transactionId?: string;
  receiptUrl?: string;
}

export const transactionsApi = {
  // Create transaction when lot is completed/settled
  createTransaction: async (payload: CreateTransactionPayload): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>('/transactions', payload);
    return response.data;
  },

  // Collector transactions
  getCollectorTransactions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedTransactionsResponse>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status && params.status !== 'all') query.append('status', params.status);

    const response = await apiClient.get<ApiResponse<PaginatedTransactionsResponse>>(
      `/transactions/collector?${query.toString()}`
    );
    return response.data;
  },

  // Recycler transactions
  getRecyclerTransactions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedTransactionsResponse>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status && params.status !== 'all') query.append('status', params.status);

    const response = await apiClient.get<ApiResponse<PaginatedTransactionsResponse>>(
      `/transactions/recycler?${query.toString()}`
    );
    return response.data;
  },

  // Get transaction by ID
  getTransactionById: async (transactionId: string): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${transactionId}`);
    return response.data;
  },

  // Update handover details (GPS, receiver, verifier, photos)
  updateHandover: async (
    transactionId: string,
    payload: UpdateHandoverPayload
  ): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.patch<ApiResponse<Transaction>>(
      `/transactions/${transactionId}/handover`,
      payload
    );
    return response.data;
  },

  // Update payment status (Recycler action)
  updatePayment: async (
    transactionId: string,
    payload: UpdatePaymentPayload
  ): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.patch<ApiResponse<Transaction>>(
      `/transactions/${transactionId}/payment`,
      payload
    );
    return response.data;
  },
};

