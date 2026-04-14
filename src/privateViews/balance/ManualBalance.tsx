import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaMoneyBillWave, FaUser, FaSearch, FaPlus, FaMinus, FaHistory,
  FaCreditCard, FaInfoCircle, FaArrowLeft, FaCheckCircle
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

import { useRepresentativeSearch } from './hooks/useRepresentativeSearch';
import { useBalanceTransaction } from './hooks/useBalanceTransaction';
import { useTransactionHistory } from './hooks/useTransactionHistory';
import { 
  formatCurrency, getBalanceColor, getBalanceBgColor, mapPaymentMethodToDisplay 
} from './utils/balanceUtils';

// Interfaz para representante (usada en hooks y componente= 
export interface Representative {
  id: string;
  fullName: string;
  identityCard: string;
  phone: string;
  balance: number;
  balanceFormatted?: string;
  balanceStatus?: 'debt' | 'zero' | 'credit';
  debtAmount?: number;
  studentCount?: number;
  userStatus?: boolean;
  email?: string;
  students?: Array<{
    id: string;
    fullName: string;
    status: string;
    balance?: number; // balance individual del estudiante
  }>;
}

export default function ManualBalance() {
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');

  // Hooks personalizados
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    setSearchResults,
    isSearching,
    selectedRep,
    setSelectedRep,
    loadRepresentativeDetails,
  } = useRepresentativeSearch();

  const {
    showHistory,
    setShowHistory,
    transactions,
    loadTransactionHistory,
  } = useTransactionHistory();

  const {
    loading,
    formData,
    setFormData,
    handleSubmit,
    calculateNewBalance,
    updateTransactionType,
  } = useBalanceTransaction(
    selectedRep,
    transactionType,
    async () => {
      // Callback tras transacción exitosa: refrescar representante e historial
      if (selectedRep) {
        const updatedRep = await loadRepresentativeDetails(selectedRep.id);
        if (updatedRep) {
          setSelectedRep(updatedRep);
          loadTransactionHistory(selectedRep.id);
        }
      }
    }
  );

  // Sincronizar descripción al cambiar tipo de transacción
  const handleTransactionTypeChange = (newType: 'deposit' | 'withdrawal') => {
    setTransactionType(newType);
    updateTransactionType(newType);
  };

  // Seleccionar un estudiante automáticamente si solo hay uno, o permitir selección manual
  const studentOptions = selectedRep?.students || [];
  const hasMultipleStudents = studentOptions.length > 1;
  
  // Si solo hay un estudiante, asignarlo automáticamente al formData
  if (selectedRep && studentOptions.length === 1 && !formData.studentId) {
    setFormData(prev => ({ ...prev, studentId: studentOptions[0].id }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            <span>Volver</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl shadow-md">
                <FaMoneyBillWave className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Gestión de Saldo Manual
                </h1>
                <p className="text-gray-600">
                  Agregar o retirar saldo de cuentas de representantes
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-lg ${transactionType === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <span className="font-semibold">
                  {transactionType === 'deposit' ? 'DEPÓSITO' : 'RETIRO'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel izquierdo - Búsqueda y selección */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FaSearch className="text-lg text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Buscar Representante
                </h2>
              </div>

              {/* Barra de búsqueda */}
              <div className="relative mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, cédula o teléfono..."
                    className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    ) : (
                      <FaUser className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Resultados de búsqueda */}
                {searchResults.length > 0 && !selectedRep && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((rep) => (
                      <div
                        key={rep.id}
                        onClick={() => {
                          loadRepresentativeDetails(rep.id).then(updatedRep => {
                            if (updatedRep) {
                              setSelectedRep(updatedRep);
                              loadTransactionHistory(rep.id);
                            }
                          });
                          setSearchResults([]);
                          setSearchTerm('');
                        }}
                        className="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-gray-800">{rep.fullName}</h4>
                            <p className="text-sm text-gray-600">
                              Cédula: {rep.identityCard} | Tel: {rep.phone || 'N/A'}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-bold ${getBalanceBgColor(rep.balance || 0)}`}>
                            {formatCurrency(rep.balance || 0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchTerm.length >= 2 && !isSearching && searchResults.length === 0 && !selectedRep && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
                    <p className="text-gray-600 text-center">
                      No se encontraron representantes con "{searchTerm}"
                    </p>
                  </div>
                )}
              </div>

              {/* Información del representante seleccionado */}
              {selectedRep && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {selectedRep.fullName}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">
                          <FaUser className="inline mr-1" />
                          {selectedRep.identityCard}
                        </span>
                        <span className="text-sm text-gray-600">
                          <FaCreditCard className="inline mr-1" />
                          {selectedRep.phone || 'N/A'}
                        </span>
                        {selectedRep.email && (
                          <span className="text-sm text-gray-600">
                            {selectedRep.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getBalanceColor(selectedRep.balance || 0)}`}>
                        {selectedRep.balanceFormatted || formatCurrency(selectedRep.balance || 0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Saldo actual
                      </div>
                      {selectedRep.balanceStatus && (
                        <div className={`text-xs px-2 py-1 rounded ${selectedRep.balanceStatus === 'debt' ? 'bg-red-100 text-red-800' : selectedRep.balanceStatus === 'credit' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedRep.balanceStatus === 'debt' ? 'EN DEUDA' : selectedRep.balanceStatus === 'credit' ? 'CON CRÉDITO' : 'SALDO CERO'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lista de estudiantes con sus balances individuales */}
                  {studentOptions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Estudiantes ({studentOptions.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {studentOptions.map((student) => (
                          <div
                            key={student.id}
                            className="bg-white p-3 rounded-lg border border-gray-200"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800 truncate mr-2">{student.fullName}</span>
                              <span className={`px-2 py-1 rounded text-xs ${student.status === 'regular' ? 'bg-green-100 text-green-800' : student.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                {student.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Balance: <span className={getBalanceColor(student.balance || 0)}>
                                {formatCurrency(student.balance || 0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <FaHistory />
                    <span className="font-medium">
                      {showHistory ? 'Ocultar historial' : 'Ver historial reciente'}
                    </span>
                  </button>
                </div>
              )}

              {/* Historial de transacciones */}
              {showHistory && selectedRep && transactions.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Transacciones Recientes ({transactions.length})
                  </h4>
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${transaction.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {transaction.type === 'deposit' ? 'DEPÓSITO' : 'RETIRO'}
                              </span>
                              <span className="text-sm text-gray-600">
                                {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('es-VE') : 'N/A'}
                              </span>
                            </div>
                            <p className="text-gray-800 mt-1">{transaction.description || 'Sin descripción'}</p>
                            {transaction.reference && (
                              <p className="text-xs text-gray-500 mt-1">Ref: {transaction.reference}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount || 0)}
                            </div>
                            <div className="text-sm text-gray-600 capitalize">
                              {mapPaymentMethodToDisplay(transaction.paymentMethod || 'cash')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho - Formulario de transacción */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg sticky top-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${transactionType === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {transactionType === 'deposit' ? <FaPlus /> : <FaMinus />}
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {transactionType === 'deposit' ? 'Agregar Saldo' : 'Retirar Saldo'}
                </h2>
              </div>

              {/* Selector de tipo */}
              <div className="flex space-x-2 mb-6">
                <button
                  type="button"
                  onClick={() => handleTransactionTypeChange('deposit')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${transactionType === 'deposit' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Depósito
                </button>
                <button
                  type="button"
                  onClick={() => handleTransactionTypeChange('withdrawal')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${transactionType === 'withdrawal' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Retiro
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Selección de estudiante (si hay más de uno) */}
                {selectedRep && studentOptions.length > 1 && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estudiante *
                    </label>
                    <select
                      value={formData.studentId || ''}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccione un estudiante</option>
                      {studentOptions.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.fullName} (Balance: {formatCurrency(student.balance || 0)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Monto */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monto (USD) *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FaMoneyBillWave className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800"
                    rows={3}
                    required
                  />
                </div>

                {/* Método de pago */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Método de Pago *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as any})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg"
                  >
                    <option value="cash">Efectivo</option>
                    <option value="bank_transfer">Transferencia Bancaria</option>
                    <option value="pago_movil">Pago Móvil</option>
                    <option value="debit_card">Tarjeta de Débito</option>
                    <option value="credit_card">Tarjeta de Crédito</option>
                    <option value="check">Cheque</option>
                  </select>
                </div>

                {/* Referencia */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Referencia (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.reference || ''}
                    onChange={(e) => setFormData({...formData, reference: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg"
                    placeholder="Número de referencia o comprobante"
                  />
                </div>

                {/* Resumen de saldo */}
                {selectedRep && formData.amount > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">Saldo actual:</span>
                      <span className="font-bold text-gray-800">{formatCurrency(selectedRep.balance || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">
                        {transactionType === 'deposit' ? 'Depósito:' : 'Retiro:'}
                      </span>
                      <span className={`font-bold ${transactionType === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transactionType === 'deposit' ? '+' : '-'}{formatCurrency(formData.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                      <span className="text-gray-800 font-semibold">Nuevo saldo:</span>
                      <span className={`text-xl font-bold ${getBalanceColor(calculateNewBalance())}`}>
                        {formatCurrency(calculateNewBalance())}
                      </span>
                    </div>
                  </div>
                )}

                {/* Validación para retiros */}
                {transactionType === 'withdrawal' && selectedRep && formData.amount > 0 && (
                  <div className="mb-6">
                    {formData.amount > (selectedRep.balance || 0) ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 text-red-700">
                          <FaInfoCircle />
                          <span className="font-semibold">Saldo insuficiente</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 text-green-700">
                          <FaCheckCircle />
                          <span className="font-semibold">Saldo suficiente</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={
                    loading || !selectedRep || formData.amount <= 0 || 
                    (transactionType === 'withdrawal' && formData.amount > (selectedRep?.balance || 0)) ||
                    (hasMultipleStudents && !formData.studentId) // deshabilitar si no se seleccionó estudiante
                  }
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    transactionType === 'deposit' 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    transactionType === 'deposit' ? 'Registrar Depósito' : 'Registrar Retiro'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-start space-x-2 text-gray-600 text-sm">
                  <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                  <p>
                    Todas las transacciones quedan registradas en el historial del representante y son auditables.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}