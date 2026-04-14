import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../../library/axios';
import { isValidUUID } from '../utils/BalanceUtils'

export interface TransactionForm {
  amount: number;
  description: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'debit_card' | 'credit_card' | 'pago_movil' | 'check';
  reference?: string;
  createdBy?: string;
  studentId?: string; // NUEVO: para asignar a estudiante específico
}

export const useBalanceTransaction = (
  selectedRep: any,
  transactionType: 'deposit' | 'withdrawal',
  onSuccess: () => void // callback para refrescar datos después de transacción exitosa
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

  // Resetear descripción cuando cambia el tipo de transacción
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

    if (transactionType === 'withdrawal' && formData.amount > (selectedRep.balance || 0)) {
      toast.error('Saldo insuficiente para este retiro');
      return;
    }

    // Si el representante tiene estudiantes y no se ha seleccionado uno, mostrar advertencia o forzar selección
    // (esta validación se puede manejar en el componente)

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
        studentId: formData.studentId || undefined, // incluir studentId si existe
      };

      const response = await api.post(endpoint, transactionData);

      if (response.data.result) {
        toast.success(
          transactionType === 'deposit' 
            ? '✅ Depósito registrado exitosamente'
            : '✅ Retiro registrado exitosamente'
        );
        // Limpiar monto y referencia, mantener método de pago y descripción base
        setFormData(prev => ({
          ...prev,
          amount: 0,
          reference: '',
          description: transactionType === 'deposit' ? 'Depósito manual' : 'Retiro manual',
        }));
        onSuccess(); // Recargar detalles del representante e historial
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

  const calculateNewBalance = () => {
    if (!selectedRep) return 0;
    const currentBalance = selectedRep.balance || 0;
    const amount = formData.amount || 0;
    return transactionType === 'deposit' 
      ? currentBalance + amount 
      : currentBalance - amount;
  };

  return {
    loading,
    formData,
    setFormData,
    handleSubmit,
    calculateNewBalance,
    updateTransactionType,
  };
};