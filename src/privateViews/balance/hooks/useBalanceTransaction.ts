import { useState } from 'react';
import { toast } from 'react-toastify';
import { isValidUUID } from '../utils/balanceUtils';
import api from '../../../library/axios';

export interface TransactionForm {
  amount: number;
  description: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'debit_card' | 'credit_card' | 'pago_movil' | 'check';
  reference?: string;
  createdBy?: string;
  studentId?: string;
}

export const useBalanceTransaction = (
  selectedRep: any,
  transactionType: 'deposit' | 'withdrawal',
  onSuccess: () => void
) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TransactionForm>({
    amount: 0,
    description: '',
    paymentMethod: 'cash',
    reference: '',
    createdBy: undefined,
    studentId: undefined,
  });

  const updateTransactionType = (newType: 'deposit' | 'withdrawal') => {
    setFormData(prev => ({
      ...prev,
      description: newType === 'deposit' ? 'Depósito manual' : 'Retiro manual'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRep) {
      toast.error('Selecciona un representante primero');
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    setLoading(true);
    try {
      const endpoint = transactionType === 'deposit'
        ? `/private/balance/representative/${selectedRep.id}/deposit`
        : `/private/balance/representative/${selectedRep.id}/withdraw`;

      const userId = localStorage.getItem('userId');
      let validCreatedBy = undefined;
      if (userId && isValidUUID(userId)) {
        validCreatedBy = userId;
      }

      const transactionData = {
        amount: parseFloat(formData.amount.toString()),
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference || `MANUAL-${Date.now()}`,
        createdBy: validCreatedBy,
        studentId: formData.studentId || undefined,
      };

      const response = await api.post(endpoint, transactionData);

      if (response.data.result) {
        toast.success(
          transactionType === 'deposit' ? '✅ Depósito registrado exitosamente' : '✅ Retiro registrado exitosamente'
        );
        setFormData(prev => ({
          ...prev,
          amount: 0,
          reference: '',
          description: transactionType === 'deposit' ? 'Depósito manual' : 'Retiro manual',
        }));
        onSuccess();
      } else {
        const errorMsg = response.data.error?.join(', ') || 'Error al procesar la transacción';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const backendError = error.response?.data?.error;
      if (backendError && Array.isArray(backendError)) {
        toast.error(backendError.join(', '));
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al procesar la transacción. Verifique los datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    formData,
    setFormData,
    handleSubmit,
    updateTransactionType,
  };
};