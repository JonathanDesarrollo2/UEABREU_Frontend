import api from '../library/axios';

export interface BalanceResponse {
  result: boolean;
  content: {
    representative: {
      id: string;
      fullName: string;
      identityCard: string;
      phone: string;
      balance: number;
      balanceFormatted: string;
      balanceStatus: 'debt' | 'credit' | 'zero';
      debtAmount: number;
      studentCount: number;
      userEmail: string;
      students: Array<{
        id: string;
        fullName: string;
        status: string;
        currentGrade: string;
        balance: number;
        balanceFormatted: string;
      }>;
    };
    recentTransactions: Array<{
      id: string;
      type: string;
      amount: number;
      description: string;
      paymentMethod: string;
      reference: string;
      status: string;
      createdAt: string;
    }>;
  };
  error: string[];
}

export async function getRepresentativeBalance(id: string): Promise<BalanceResponse> {
  const response = await api.get(`/private/balance/representative/${id}/balance`);
  return response.data;
}

export async function manualDeposit(
  representativeId: string,
  data: {
    amount: number;
    description: string;
    paymentMethod: 'cash' | 'bank_transfer' | 'debit_card' | 'credit_card' | 'pago_movil' | 'check';
    reference?: string;
    createdBy?: string;
  }
) {
  const response = await api.post(`/private/balance/representative/${representativeId}/deposit`, data);
  return response.data;
}

export async function manualWithdrawal(
  representativeId: string,
  data: {
    amount: number;
    description: string;
    paymentMethod: 'cash' | 'bank_transfer' | 'debit_card' | 'credit_card' | 'pago_movil' | 'check';
    reference?: string;
    createdBy?: string;
  }
) {
  const response = await api.post(`/private/balance/representative/${representativeId}/withdraw`, data);
  return response.data;
}

export async function searchRepresentatives(searchTerm: string, limit = 10) {
  const response = await api.get('/private/balance/representatives', {
    params: {
      search: searchTerm,
      limit,
      page: 1
    }
  });
  return response.data;
}

export async function getTransactionHistory(representativeId: string, params?: any) {
  const response = await api.get(`/private/balance/representative/${representativeId}/transactions`, {
    params
  });
  return response.data;
}

export async function checkPaymentExists(reference: string, representativeId: string) {
  const response = await api.get('/private/balance/check-payment', {
    params: { reference, representativeId }
  });
  return response.data;
}

export async function getFinancialStatistics() {
  const response = await api.get('/private/balance/statistics/financial');
  return response.data;
}

export async function getRepresentativeByEmail(email: string): Promise<any> {
  const response = await api.get('/private/balance/representative-by-email', {
    params: { email }
  });
  return response.data;
}