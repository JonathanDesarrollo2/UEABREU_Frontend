import { isAxiosError } from 'axios';
import api from '../library/axios';

export interface BalanceResponse {
  result: boolean;
  content: {
    representative: {
      id: string;
      fullName: string;
      identityCard: string;
      phone: string;
      balance: number;        // USD
      balanceUSD: number;
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
        balance: number;      // USD
        balanceUSD: number;
        balanceFormatted: string;
      }>;
    };
    recentTransactions: Array<{
      id: string;
      type: string;
      amount: number;
      amountUSD: number;
      bcvRate: number;
      description: string;
      paymentMethod: string;
      reference: string;
      status: string;
      createdAt: string;
    }>;
  };
  error: string[];
}

// Obtener balance y datos de un representante específico
export async function getRepresentativeBalance(id: string): Promise<BalanceResponse> {
  const response = await api.get(`/private/balance/representative/${id}/balance`);
  return response.data;
}

// Depósito manual
export async function manualDeposit(
  representativeId: string,
  data: {
    amount: number; // Bs
    description: string;
    paymentMethod: 'cash' | 'bank_transfer' | 'debit_card' | 'credit_card' | 'pago_movil' | 'check';
    reference?: string;
    createdBy?: string;
    studentId?: string;
  }
) {
  const response = await api.post(`/private/balance/representative/${representativeId}/deposit`, data);
  return response.data;
}

// Retiro manual
export async function manualWithdrawal(
  representativeId: string,
  data: {
    amount: number; // Bs
    description: string;
    paymentMethod: 'cash' | 'bank_transfer' | 'debit_card' | 'credit_card' | 'pago_movil' | 'check';
    reference?: string;
    createdBy?: string;
    studentId?: string;
  }
) {
  const response = await api.post(`/private/balance/representative/${representativeId}/withdraw`, data);
  return response.data;
}

// Mover un pago (parcial o total) de un estudiante a otro
export async function movePaymentBetweenStudents(
  transactionId: string,
  targetStudentId: string,
  amountToMove: number  // monto en Bs
) {
  const response = await api.post('/private/balance/transaction/move', {
    transactionId,
    targetStudentId,
    amountToMove,
  });
  return response.data;
}

// Buscar representantes por término
export async function searchRepresentatives(searchTerm: string, limit = 10) {
  const response = await api.get('/private/balance/representatives', {
    params: { search: searchTerm, limit, page: 1 }
  });
  return response.data;
}

// Historial de transacciones de un representante
export async function getRepresentativeTransactions(
  representativeId: string,
  params?: {
    page?: number;
    limit?: number;
    studentId?: string;
    search?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  try {
    const { data } = await api.get(`/private/balance/representative/${representativeId}/transactions`, { params });
    return data;
  } catch (error: any) {
    let mensaje = 'Error Desconocido';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
      throw new Error(mensaje);
    }
    throw new Error(mensaje);
  }
}

// Verificar si existe pago por referencia
export async function checkPaymentExists(reference: string, representativeId: string) {
  const response = await api.get('/private/balance/check-payment', {
    params: { reference, representativeId }
  });
  return response.data;
}

// Obtener estadísticas financieras generales
export async function getFinancialStatistics() {
  const response = await api.get('/private/balance/statistics/financial');
  return response.data;
}

// Obtener representante por email
export async function getRepresentativeByEmail(email: string): Promise<any> {
  const response = await api.get('/private/balance/representative-by-email', { params: { email } });
  return response.data;
}

// Obtener todas las transacciones del sistema
export async function getAllTransactions(params?: any) {
  const response = await api.get('/private/balance/transactions', { params });
  return response.data;
}