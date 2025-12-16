import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaMoneyBillWave, 
  FaUser, 
  FaSearch, 
  FaPlus, 
  FaMinus, 
  FaHistory,
  FaCreditCard,
  FaInfoCircle,
  FaArrowLeft,
  FaCheckCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // ¡Importa los estilos!
import api from '../../library/axios';

interface Representative {
  id: string;
  fullName: string;
  identityCard: string;
  phone: string;
  balance: number;
  students?: Array<{
    id: string;
    fullName: string;
    status: string;
  }>;
}

interface TransactionForm {
  amount: number;
  description: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'debit_card' | 'credit_card' | 'pago_movil' | 'check';
  reference?: string;
  createdBy?: string;
}

export default function ManualBalance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const [searchResults, setSearchResults] = useState<Representative[]>([]);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [formData, setFormData] = useState<TransactionForm>({
    amount: 0,
    description: '',
    paymentMethod: 'cash',
    reference: '',
    createdBy: localStorage.getItem('userId') || undefined
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Buscar representantes
  const searchRepresentatives = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await api.get('/balance/representatives', {
        params: {
          search: searchTerm,
          limit: 10,
          page: 1
        }
      });

      if (response.data.result) {
        setSearchResults(response.data.content.representatives || []);
      } else {
        toast.error('Error al buscar representantes');
      }
    } catch (error) {
      console.error('Error buscando representantes:', error);
      toast.error('Error al buscar representantes');
    } finally {
      setIsSearching(false);
    }
  };

  // Cargar detalles del representante seleccionado
  const loadRepresentativeDetails = async (id: string) => {
    try {
      const response = await api.get(`/balance/representative/${id}/balance`);
      if (response.data.result) {
        setSelectedRep(response.data.content);
        setFormData(prev => ({
          ...prev,
          description: transactionType === 'deposit' 
            ? 'Depósito manual en efectivo'
            : 'Retiro manual en efectivo'
        }));
        loadTransactionHistory(id);
      }
    } catch (error) {
      console.error('Error cargando detalles:', error);
      toast.error('Error al cargar información del representante');
    }
  };

  // Cargar historial de transacciones
  const loadTransactionHistory = async (representativeId: string) => {
    try {
      const response = await api.get(`/balance/representative/${representativeId}/transactions`, {
        params: { limit: 5 }
      });
      
      if (response.data.result) {
        setTransactions(response.data.content || []);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  // Manejar búsqueda
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim().length >= 3) {
        searchRepresentatives();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Manejar envío del formulario
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
        ? `/balance/representative/${selectedRep.id}/deposit`
        : `/balance/representative/${selectedRep.id}/withdraw`;

      const response = await api.post(endpoint, {
        ...formData,
        amount: parseFloat(formData.amount.toString())
      });

      if (response.data.result) {
        toast.success(
          transactionType === 'deposit' 
            ? 'Depósito registrado exitosamente'
            : 'Retiro registrado exitosamente'
        );

        // Actualizar datos del representante
        await loadRepresentativeDetails(selectedRep.id);
        
        // Limpiar formulario
        setFormData({
          amount: 0,
          description: '',
          paymentMethod: 'cash',
          reference: '',
          createdBy: localStorage.getItem('userId') || undefined
        });
      } else {
        toast.error(response.data.error?.join(', ') || 'Error al procesar la transacción');
      }
    } catch (error: any) {
      console.error('Error procesando transacción:', error);
      toast.error(
        error.response?.data?.error?.join(', ') || 
        'Error al procesar la transacción'
      );
    } finally {
      setLoading(false);
    }
  };

  // Calcular nuevo saldo
  const calculateNewBalance = () => {
    if (!selectedRep) return 0;
    
    const currentBalance = selectedRep.balance || 0;
    const amount = formData.amount || 0;
    
    if (transactionType === 'deposit') {
      return currentBalance + amount;
    } else {
      return currentBalance - amount;
    }
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

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
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((rep) => (
                      <div
                        key={rep.id}
                        onClick={() => {
                          loadRepresentativeDetails(rep.id);
                          setSearchResults([]);
                          setSearchTerm('');
                        }}
                        className="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-gray-800">{rep.fullName}</h4>
                            <p className="text-sm text-gray-600">
                              Cédula: {rep.identityCard} | Tel: {rep.phone}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-bold ${(rep.balance || 0) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {formatCurrency(rep.balance || 0)}
                          </div>
                        </div>
                      </div>
                    ))}
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
                          {selectedRep.phone}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${(selectedRep.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(selectedRep.balance || 0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Saldo actual
                      </div>
                    </div>
                  </div>

                  {/* Estudiantes */}
                  {selectedRep.students && selectedRep.students.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Estudiantes Activos
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedRep.students.map((student) => (
                          <div
                            key={student.id}
                            className="bg-white p-3 rounded-lg border border-gray-200"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800">{student.fullName}</span>
                              <span className={`px-2 py-1 rounded text-xs ${student.status === 'active' || student.status === 'regular' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {student.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botón para ver historial */}
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
                    Transacciones Recientes
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
                                {new Date(transaction.createdAt).toLocaleDateString('es-VE')}
                              </span>
                            </div>
                            <p className="text-gray-800 mt-1">{transaction.description}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {transaction.paymentMethod}
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
                  onClick={() => setTransactionType('deposit')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${transactionType === 'deposit' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Depósito
                </button>
                <button
                  onClick={() => setTransactionType('withdrawal')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${transactionType === 'withdrawal' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Retiro
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit}>
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
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ingrese una descripción..."
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      <span className={`text-xl font-bold ${calculateNewBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                        <p className="text-red-600 text-sm mt-1">
                          El representante no tiene suficiente saldo para este retiro.
                        </p>
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
                  disabled={loading || !selectedRep || formData.amount <= 0 || 
                    (transactionType === 'withdrawal' && formData.amount > (selectedRep?.balance || 0))}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${transactionType === 'deposit' ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'} disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md`}
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

              {/* Nota informativa */}
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