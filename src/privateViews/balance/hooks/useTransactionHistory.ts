import { useState } from 'react';
import api from '../../../library/axios';

export const useTransactionHistory = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  const loadTransactionHistory = async (representativeId: string) => {
    try {
      const response = await api.get(`/private/balance/representative/${representativeId}/transactions`, {
        params: { limit: 5 }
      });
      if (response.data.result) {
        const trans = response.data.content?.transactions || response.data.content || [];
        setTransactions(Array.isArray(trans) ? trans : []);
      }
    } catch (error) {
      // Silencioso: el historial no es crítico
    }
  };

  return {
    showHistory,
    setShowHistory,
    transactions,
    loadTransactionHistory,
  };
};