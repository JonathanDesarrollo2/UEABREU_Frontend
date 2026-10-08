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
      balance: number;
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
        balance: number;
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
    studentId?: string;
    paymentDate: string;
    paymentTime?: string;
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
    studentId?: string;
    paymentDate: string;
    paymentTime?: string;
  }
) {
  const response = await api.post(`/private/balance/representative/${representativeId}/withdraw`, data);
  return response.data;
}

export async function movePaymentBetweenStudents(
  transactionId: string,
  targetStudentId: string,
  amountToMove: number
) {
  const response = await api.post('/private/balance/transaction/move', {
    transactionId,
    targetStudentId,
    amountToMove,
  });
  return response.data;
}

export async function searchRepresentatives(searchTerm: string, limit = 10) {
  const response = await api.get('/private/balance/representatives', {
    params: { search: searchTerm, limit, page: 1 }
  });
  return response.data;
}

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

export async function checkPaymentExists(reference: string, representativeId: string) {
  const response = await api.get('/private/balance/check-payment', {
    params: { reference, representativeId }
  });
  return response.data;
}

/**
 * 🆕 Verifica si ya existe una transacción cuya referencia termine en los
 * MISMOS ÚLTIMOS 6 DÍGITOS que la referencia suministrada.
 *
 * Motivo: el banco BNC valida las operaciones usando solo los últimos 6
 * dígitos de la referencia. Sin este chequeo, un usuario podría registrar
 * el mismo pago varias veces cambiando los dígitos anteriores.
 */
export async function checkReferenceKey(reference: string) {
  const response = await api.get('/private/balance/check-reference-key', {
    params: { reference }
  });
  return response.data;
}

export async function getFinancialStatistics() {
  const response = await api.get('/private/balance/statistics/financial');
  return response.data;
}

export async function getRepresentativeByEmail(email: string): Promise<any> {
  const response = await api.get('/private/balance/representative-by-email', { params: { email } });
  return response.data;
}

export async function getAllTransactions(params?: any) {
  const response = await api.get('/private/balance/transactions', { params });
  return response.data;
}

// ============================================================
// ELIMINAR TRANSACCIÓN (SOLO ADMIN NIVEL 2)
// ============================================================
export async function deleteTransactionAPI(transactionId: string, password: string) {
  const response = await api.post(
    `/private/balance/transaction/${transactionId}/delete`,
    { password }
  );
  return response.data;
}

// ============================================================
// ESTADO DE CUENTA POR REPRESENTANTE
// ============================================================
export interface AccountStatementTransaction {
  id: string;
  type: string;
  amount: number;
  amountUSD?: number;
  bcvRate?: number;
  description: string;
  paymentMethod: string;
  reference: string;
  status: string;
  createdAt: string;
  balanceAfter?: number;
  student?: { id: string; fullName: string } | null;
}

export interface AccountStatementResponse {
  result: boolean;
  content: {
    representative: {
      id: string;
      fullName: string;
      identityCard: string;
      phone: string;
      email: string;
      balanceUSD: number;
      students: Array<{
        id: string;
        fullName: string;
        identityCard: string;
        status: string;
        currentGrade: string;
        balance: number;
      }>;
    };
    summary: {
      totalCargosUSD: number;
      totalAbonosUSD: number;
      totalCargosBs: number;
      totalAbonosBs: number;
      saldoFinalUSD: number;
      transactionCount: number;
    };
    transactions: AccountStatementTransaction[];
  };
  error: string[];
}

export async function getAccountStatement(
  representativeId: string,
  params?: { startDate?: string; endDate?: string; studentId?: string }
): Promise<AccountStatementResponse> {
  const response = await api.get(
    `/private/balance/representative/${representativeId}/account-statement`,
    { params }
  );
  return response.data;
}