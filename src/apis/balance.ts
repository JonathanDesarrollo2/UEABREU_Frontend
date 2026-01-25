// src/apis/balance.ts
import api from '../library/axios';

export interface BalanceResponse {
  result: boolean;
  content: {
    id: string;
    fullName: string;
    identityCard: string;
    phone: string;
    balance: number;
    financialSummary: {
      currentBalance: number;
      debtAmount: number;
      availableCredit: number;
      activeStudents: number;
      monthlyFee: number;
      nextPaymentDue: string;
      canEnrollNewStudent: boolean;
    };
    students?: Array<{
      id: string;
      fullName: string;
      status: string;
    }>;
  };
  error: string[];
}

export async function getRepresentativeBalance(id: string): Promise<BalanceResponse> {
  const response = await api.get(`/balance/representative/${id}/balance`);
  return response.data;
}

export async function manualDeposit(
  representativeId: string,
  data: {
    amount: number;
    description: string;
    paymentMethod: string;
    reference?: string;
    createdBy?: string;
  }
) {
  const response = await api.post(`/balance/representative/${representativeId}/deposit`, data);
  return response.data;
}

export async function manualWithdrawal(
  representativeId: string,
  data: {
    amount: number;
    description: string;
    paymentMethod: string;
    reference?: string;
    createdBy?: string;
  }
) {
  const response = await api.post(`/balance/representative/${representativeId}/withdraw`, data);
  return response.data;
}

export async function searchRepresentatives(searchTerm: string, limit = 10) {
  const response = await api.get('/balance/representatives', {
    params: {
      search: searchTerm,
      limit,
      page: 1
    }
  });
  return response.data;
}

export async function getTransactionHistory(representativeId: string, params?: any) {
  const response = await api.get(`/balance/representative/${representativeId}/transactions`, {
    params
  });
  return response.data;
}