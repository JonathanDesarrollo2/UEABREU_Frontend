import { useState } from 'react';
import api from '../../../library/axios';

export const useTransactionHistory = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const loadTransactionHistory = async (representativeId: string) => {
    try {
      const response = await api.get(`/private/balance/representative/${representativeId}/transactions`, {
        params: { limit: 50 } // cargar suficientes para seleccionar
      });
      if (response.data.result) {
        const trans = response.data.content?.transactions || response.data.content || [];
        setTransactions(Array.isArray(trans) ? trans : []);
      }
    } catch (error) {
      // Silencioso
    }
  };

  return {
    showHistory,
    setShowHistory,
    transactions,
    loadTransactionHistory,
    selectedTransactionId,
    setSelectedTransactionId,
  };
};