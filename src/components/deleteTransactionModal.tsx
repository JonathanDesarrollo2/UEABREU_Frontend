// src/components/DeleteTransactionModal.tsx
import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaTrash, FaLock, FaTimes } from 'react-icons/fa';
import { deleteTransactionAPI } from '../apis/balance';
import { toast } from 'react-toastify';

interface TransactionInfo {
  id: string;
  description?: string;
  amount?: number;
  amountUSD?: number;
  type?: string;
  studentName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: TransactionInfo | null;
}

export default function DeleteTransactionModal({ isOpen, onClose, onSuccess, transaction }: Props) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setLoading(false);
    }
  }, [isOpen, transaction?.id]);

  if (!isOpen || !transaction) return null;

  const handleConfirm = async () => {
    if (!password || password.length < 4) {
      setError('Debes ingresar la contraseña del administrador nivel 1');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await deleteTransactionAPI(transaction.id, password);
      if (response.result) {
        toast.success('Pago eliminado y saldo revertido correctamente');
        onSuccess();
        onClose();
      } else {
        setError(response.error?.[0] || 'Error al eliminar');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.[0] ||
        err?.response?.data?.message ||
        err.message ||
        'Error al eliminar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={handleClose}></div>
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">Eliminar pago</h3>
              <p className="text-gray-600 text-sm mt-1">Esta acción no se puede deshacer</p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Detalles del pago:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Descripción:</span>
                <span className="font-medium text-gray-900 text-right">{transaction.description || '—'}</span>
              </div>
              {transaction.studentName && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Estudiante:</span>
                  <span className="font-medium text-gray-900 text-right">{transaction.studentName}</span>
                </div>
              )}
              {transaction.amountUSD !== undefined && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Monto USD:</span>
                  <span className="font-medium text-red-600 text-right">
                    -${Number(transaction.amountUSD).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2 text-red-700">
              <FaExclamationTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                El saldo del estudiante se ajustará automáticamente para revertir este pago.
                Si es una mensualidad o anticipo, NO se volverá a generar automáticamente.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaLock className="inline mr-1 text-gray-500" />
              Contraseña del Administrador Nivel 1 *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoFocus
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
              placeholder="Ingresa la contraseña de administrador"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) handleConfirm();
              }}
            />
            {error && <p className="text-red-600 text-xs mt-2 font-medium">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || password.length < 4}
            className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Eliminando...
              </>
            ) : (
              <>
                <FaTrash className="text-sm" />
                Eliminar pago
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}