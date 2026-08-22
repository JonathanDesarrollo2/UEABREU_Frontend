import { useState, useEffect, useCallback } from 'react';
import {
  cascadedValidationAPI,
  type BankValidationRequest,
  getBCVRateAPI,
  type BCVRateResponse
} from '../../apis/bank';
import {
  getRepresentativeBalance,
  manualDeposit,
  getRepresentativeTransactions
} from '../../apis/balance';
import {
  FaUniversity,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaDollarSign,
  FaExchangeAlt,
  FaInfoCircle,
  FaCreditCard,
  FaCalendarDay,
  FaFileInvoiceDollar,
  FaUserGraduate,
  FaHistory,
  FaFilter,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

interface PaymentValidationProps {
  representativeId: string;
}

// Valores fijos para la API bancaria (no los ingresa el representante)
const DEFAULT_BANK_ACCOUNT = '01910001482101010049'; // Cuenta institucional
const DEFAULT_PHONE = ''; // No se usa si se envía vacío
const DEFAULT_REQUEST_DATE = new Date().toISOString().split('T')[0];

export default function PaymentValidation({ representativeId }: PaymentValidationProps) {
  // Solo los 4 campos visibles
  const [formData, setFormData] = useState({
    BankCode: 191,
    ClientID: '',
    Reference: '',
    Amount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [loadingRate, setLoadingRate] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [bcvRate, setBcvRate] = useState<BCVRateResponse | null>(null);
  const [usdAmount, setUsdAmount] = useState<number>(0);

  // Estados para el representante y sus alumnos
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [depositResult, setDepositResult] = useState<any>(null);
  const [depositLoading, setDepositLoading] = useState(false);

  // Historial de transacciones
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilters, setHistoryFilters] = useState({
    studentId: '',
    search: '',
    page: 1,
    limit: 5,
  });
  const [historyPagination, setHistoryPagination] = useState({ totalRecords: 0, totalPages: 1, currentPage: 1 });

  // Cargar tasa BCV
  useEffect(() => {
    const fetchBCVRate = async () => {
      try {
        setLoadingRate(true);
        const response = await getBCVRateAPI();
        if (response.result && response.content) {
          setBcvRate(response.content);
        }
      } catch (err: any) {
        setBcvRate({
          PriceRateBCV: 36.6642,
          dtRate: new Date().toLocaleDateString('es-VE')
        });
      } finally {
        setLoadingRate(false);
      }
    };
    fetchBCVRate();
  }, []);

  // Cargar hijos del representante
  useEffect(() => {
    const fetchStudents = async () => {
        if (!representativeId) return;
        try {
          setLoadingStudents(true);
          const res = await getRepresentativeBalance(representativeId);
          if (res.result && res.content.representative.students) {
            const studentsList = res.content.representative.students;
            setStudents(studentsList);
            if (studentsList.length === 1) {
              setSelectedStudentId(studentsList[0].id);
            }
          }
        } catch (err: any) {
          console.error('Error al cargar alumnos:', err);
        } finally {
          setLoadingStudents(false);
        }
    };
    fetchStudents();
  }, [representativeId]);

  // Cargar historial de transacciones del representante
  const fetchHistory = useCallback(async () => {
    if (!representativeId) return;
    setHistoryLoading(true);
    try {
      const res = await getRepresentativeTransactions(representativeId, {
        page: historyFilters.page,
        limit: historyFilters.limit,
        studentId: historyFilters.studentId || undefined,
        search: historyFilters.search || undefined,
      });
      if (res.result) {
        setHistory(res.content.transactions);
        setHistoryPagination(res.content.pagination);
      }
    } catch (err: any) {
      console.error('Error al cargar historial:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [representativeId, historyFilters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Cálculo USD
  useEffect(() => {
    if (bcvRate && formData.Amount > 0) {
      const usd = formData.Amount / bcvRate.PriceRateBCV;
      setUsdAmount(parseFloat(usd.toFixed(2)));
    } else {
      setUsdAmount(0);
    }
  }, [formData.Amount, bcvRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setDepositResult(null);

    try {
      // Construir objeto completo para la API bancaria
      const fullValidationData: BankValidationRequest = {
        AccountNumber: DEFAULT_BANK_ACCOUNT,
        BankCode: formData.BankCode,
        PhoneNumber: DEFAULT_PHONE,
        ClientID: formData.ClientID,
        Reference: formData.Reference,
        RequestDate: DEFAULT_REQUEST_DATE,
        Amount: formData.Amount,
      };

      const response = await cascadedValidationAPI(fullValidationData);
      setResult(response.content);

      if (
        response.content.overallResult === 'success' &&
        response.content.message.includes('Pago verificado exitosamente')
      ) {
        setDepositLoading(true);
        try {
          const depositPayload = {
            amount: formData.Amount,
            description: `Pago validado - Ref: ${formData.Reference}`,
            paymentMethod: 'pago_movil' as const,
            reference: formData.Reference,
            studentId: selectedStudentId || undefined, 
          };
          const depositRes = await manualDeposit(representativeId, depositPayload);
          setDepositResult(depositRes);
          fetchHistory(); // refrescar historial
        } catch (depErr: any) {
          const serverMessage =
            depErr?.response?.data?.error?.[0] ||
            depErr?.response?.data?.message ||
            depErr.message;
          setError(`Validación bancaria exitosa, pero error al registrar depósito: ${serverMessage}`);
        } finally {
          setDepositLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Amount' || name === 'BankCode' ? Number(value) : value
    }));
  };

  const handleHistoryFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHistoryFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const getStatusIcon = (overallResult: string) => {
    switch (overallResult) {
      case 'success': return <FaCheckCircle className="text-3xl text-green-500" />;
      case 'manual_review': return <FaExclamationTriangle className="text-3xl text-yellow-500" />;
      default: return <FaTimesCircle className="text-3xl text-red-500" />;
    }
  };

  const getStatusColor = (overallResult: string) => {
    switch (overallResult) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'manual_review': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-red-50 border-red-200';
    }
  };

  const getStatusTextColor = (overallResult: string) => {
    switch (overallResult) {
      case 'success': return 'text-green-800';
      case 'manual_review': return 'text-yellow-800';
      default: return 'text-red-800';
    }
  };

  const formatBCVDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    return dateStr;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl shadow-md">
                <FaUniversity className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Validación de Pagos Bancarios</h1>
                <p className="text-gray-600">Sistema de verificación en cascada - BNC</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-3 shadow-md">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaMoneyBillWave className="text-xl text-white" />
              </div>
              <div className="text-white">
                <p className="font-semibold text-sm">Pago Móvil</p>
                <p className="text-xs">0412-208.84.51 | BNC 0191</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaSearch className="text-lg text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Consulta de Transacción</h2>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <FaExchangeAlt className="text-blue-600 text-sm" />
                    <div className="text-right">
                      {loadingRate ? (
                        <div className="flex items-center space-x-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                          <span className="text-blue-700 text-xs">Cargando...</span>
                        </div>
                      ) : bcvRate ? (
                        <>
                          <p className="text-blue-800 font-bold text-sm">
                            {bcvRate.PriceRateBCV.toFixed(2)} Bs/USD
                          </p>
                          <p className="text-blue-600 text-xs">
                            BCV {formatBCVDate(bcvRate.dtRate)}
                          </p>
                        </>
                      ) : (
                        <p className="text-blue-700 text-xs">36.66 Bs/USD</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selector de estudiante (si hay más de uno) */}
                {students.length > 1 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <FaUserGraduate className="text-indigo-600" />
                      <label className="block text-sm font-semibold text-indigo-700">
                        Selecciona el estudiante al que se aplicará el pago
                      </label>
                    </div>
                    {loadingStudents ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div>
                        <span className="ml-2 text-sm text-indigo-700">Cargando estudiantes...</span>
                      </div>
                    ) : (
                      <>
                        <select
                          value={selectedStudentId}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Repartir entre todos los hijos</option>
                          {students.map((student: any) => (
                            <option key={student.id} value={student.id}>
                              {student.fullName} – Saldo: ${student.balance?.toFixed(2) ?? '0.00'}
                            </option>
                          ))}
                        </select>
                        {selectedStudentId === '' && (
                          <p className="text-xs text-indigo-600 mt-2">
                            El monto se dividirá equitativamente entre los {students.length} hijos.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Campos simplificados */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Banco */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaUniversity className="inline mr-1 text-blue-600" />
                      Banco *
                    </label>
                    <select
                      name="BankCode"
                      value={formData.BankCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition-all font-medium"
                    >
                      <option value={191}>BNC (0191)</option>
                      <option value={101}>Bancaribe (0101)</option>
                      <option value={104}>BdV (0104)</option>
                      <option value={105}>Mercantil (0105)</option>
                    </select>
                  </div>

                  {/* Cédula */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaCreditCard className="inline mr-1 text-blue-600" />
                      Cédula *
                    </label>
                    <input
                      type="text"
                      name="ClientID"
                      value={formData.ClientID}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition-all font-medium"
                      placeholder="J000121532"
                    />
                  </div>

                  {/* Referencia */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaFileInvoiceDollar className="inline mr-1 text-blue-600" />
                      Referencia *
                    </label>
                    <input
                      type="text"
                      name="Reference"
                      value={formData.Reference}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition-all font-medium"
                      placeholder="40067"
                    />
                  </div>

                  {/* Monto Bs */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaMoneyBillWave className="inline mr-1 text-blue-600" />
                      Monto (Bs) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        name="Amount"
                        value={formData.Amount}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition-all pr-12 font-bold text-lg"
                        placeholder="0.00"
                        min="0"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-gray-600 font-bold text-sm">Bs</span>
                      </div>
                    </div>
                    
                    {formData.Amount > 0 && bcvRate && (
                      <div className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FaDollarSign className="text-green-600" />
                            <span className="text-gray-700 text-sm font-medium">Equivalente:</span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-700">
                              {usdAmount.toLocaleString('es-VE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })} USD
                            </p>
                            <p className="text-xs text-gray-600">
                              Tasa: {bcvRate.PriceRateBCV.toFixed(2)} Bs/USD
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Campos opcionales (grises, automáticos) */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FaInfoCircle className="mr-2 text-gray-400" />
                    Campos opcionales (se completan automáticamente)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Número de Cuenta
                      </label>
                      <input
                        type="text"
                        value={DEFAULT_BANK_ACCOUNT}
                        disabled
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        value={DEFAULT_PHONE || 'No requerido'}
                        disabled
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Fecha
                      </label>
                      <input
                        type="text"
                        value={new Date(DEFAULT_REQUEST_DATE).toLocaleDateString('es-VE')}
                        disabled
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <FaInfoCircle className="text-blue-600 text-sm mt-0.5" />
                    <div>
                      <p className="text-blue-700 text-xs">
                        <strong>Nota:</strong> Los campos resaltados en azul son obligatorios. Los campos grises se completan automáticamente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading || depositLoading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-md flex items-center space-x-2"
                  >
                    {loading || depositLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <FaSearch className="text-sm" />
                        <span>Validar Transacción</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Historial de Pagos del Representante */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <FaHistory className="text-lg text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Historial de Pagos</h2>
                </div>
                <span className="text-sm text-gray-500">
                  {historyPagination.totalRecords} transacciones
                </span>
              </div>

              {/* Filtros del historial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    <FaFilter className="inline mr-1 text-gray-400" />
                    Estudiante
                  </label>
                  <select
                    name="studentId"
                    value={historyFilters.studentId}
                    onChange={handleHistoryFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Todos los hijos</option>
                    {students.map((student: any) => (
                      <option key={student.id} value={student.id}>
                        {student.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    <FaSearch className="inline mr-1 text-gray-400" />
                    Buscar
                  </label>
                  <input
                    type="text"
                    name="search"
                    value={historyFilters.search}
                    onChange={handleHistoryFilterChange}
                    placeholder="Descripción, referencia..."
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Tabla del historial */}
              {historyLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FaHistory className="mx-auto text-3xl text-gray-300 mb-2" />
                  <p className="text-gray-600">No hay transacciones</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Bs</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendiente</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">A Favor</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {history.map((tx: any) => (
                          <tr key={tx.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                              {tx.createdAt ? formatDate(tx.createdAt) : '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {tx.student?.fullName || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                              {tx.description || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-800">
                              {tx.amount?.toFixed(2)} Bs
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {tx.pendingAmount > 0 ? `${tx.pendingAmount.toFixed(2)} Bs` : '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-green-700">
                              {tx.creditAmount > 0 ? `${tx.creditAmount.toFixed(2)} Bs` : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                tx.displayStatus === 'Completado' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {tx.displayStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación del historial */}
                  {historyPagination.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-gray-600">
                        Página {historyPagination.currentPage} de {historyPagination.totalPages}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          disabled={historyFilters.page === 1}
                          onClick={() => setHistoryFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                        >
                          <FaChevronLeft className="text-gray-600" />
                        </button>
                        <button
                          disabled={historyFilters.page === historyPagination.totalPages}
                          onClick={() => setHistoryFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                        >
                          <FaChevronRight className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Panel de resultados */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-5 border border-gray-200 shadow-lg h-full">
              <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-gray-200">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FaFileInvoiceDollar className="text-lg text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Resultados</h3>
                  <p className="text-gray-600 text-xs">Estado de verificación</p>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="bg-red-100 p-1.5 rounded-lg">
                      <FaTimesCircle className="text-lg text-red-600" />
                    </div>
                    <h4 className="text-base font-semibold text-red-800">Error</h4>
                  </div>
                  <p className="text-red-700 text-xs">{error}</p>
                </div>
              )}

              {depositResult && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaCheckCircle className="text-lg text-green-600" />
                    <h4 className="text-base font-semibold text-green-800">Depósito registrado</h4>
                  </div>
                  <p className="text-green-700 text-xs">
                    {depositResult.content.message}
                    {depositResult.content.appliedToStudent && (
                      <span className="block mt-1 font-semibold">
                        Aplicado a: {students.find(s => s.id === depositResult.content.appliedToStudent)?.fullName}
                      </span>
                    )}
                  </p>
                  <p className="text-green-700 text-xs mt-1">
                    Nuevo saldo: ${depositResult.content.newBalance?.toFixed(2)}
                  </p>
                </div>
              )}

              {result ? (
                <div className={`${getStatusColor(result.overallResult)} rounded-xl p-4 border-2 transition-all duration-300`}>
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(result.overallResult)}
                    <div>
                      <h4 className={`text-base font-bold ${getStatusTextColor(result.overallResult)}`}>
                        {result.overallResult === 'success' 
                          ? 'Validación Exitosa' 
                          : result.overallResult === 'manual_review'
                          ? 'Revisión Requerida'
                          : 'Error en Validación'}
                      </h4>
                      <p className={`${getStatusTextColor(result.overallResult)} text-xs`}>
                        {result.message}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    {/* P2P */}
                    <div className={`flex justify-between items-center p-3 rounded-lg border ${
                      result.details.validateP2P.movementExists 
                        ? 'bg-green-50 border-green-200' 
                        : result.details.validateP2P.executed
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <FaCreditCard className={
                          result.details.validateP2P.movementExists ? 'text-green-600' : result.details.validateP2P.executed ? 'text-red-600' : 'text-gray-600'
                        } size={14} />
                        <span className="text-gray-700 text-sm">P2P</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        result.details.validateP2P.movementExists ? 'bg-green-500 text-white' : result.details.validateP2P.executed ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {result.details.validateP2P.executed ? (result.details.validateP2P.movementExists ? '✓' : '✗') : '—'}
                      </span>
                    </div>

                    {/* Referencia */}
                    <div className={`flex justify-between items-center p-3 rounded-lg border ${
                      result.details.validateReference.movementExists 
                        ? 'bg-green-50 border-green-200' 
                        : result.details.validateReference.executed
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <FaCalendarDay className={
                          result.details.validateReference.movementExists ? 'text-green-600' : result.details.validateReference.executed ? 'text-red-600' : 'text-gray-600'
                        } size={14} />
                        <span className="text-gray-700 text-sm">Referencia</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        result.details.validateReference.movementExists ? 'bg-green-500 text-white' : result.details.validateReference.executed ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {result.details.validateReference.executed ? (result.details.validateReference.movementExists ? '✓' : '✗') : '—'}
                      </span>
                    </div>

                    {/* Existencia */}
                    <div className={`flex justify-between items-center p-3 rounded-lg border ${
                      result.details.validateExistence.movementExists 
                        ? 'bg-green-50 border-green-200' 
                        : result.details.validateExistence.executed
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <FaUniversity className={
                          result.details.validateExistence.movementExists ? 'text-green-600' : result.details.validateExistence.executed ? 'text-red-600' : 'text-gray-600'
                        } size={14} />
                        <span className="text-gray-700 text-sm">Existencia</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        result.details.validateExistence.movementExists ? 'bg-green-500 text-white' : result.details.validateExistence.executed ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {result.details.validateExistence.executed ? (result.details.validateExistence.movementExists ? '✓' : '✗') : '—'}
                      </span>
                    </div>
                  </div>

                  {(result.details.validateP2P.movementExists || 
                    result.details.validateReference.movementExists || 
                    result.details.validateExistence.movementExists) && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                      <h5 className="text-gray-800 font-semibold text-sm mb-2">Detalles</h5>
                      <div className="space-y-2 text-gray-600 text-xs">
                        <div className="flex justify-between">
                          <span>Concepto:</span>
                          <span className="text-gray-800 text-right max-w-[60%]">
                            {result.details.validateP2P.data?.Concept || 
                             result.details.validateReference.data?.Concept || 
                             result.details.validateExistence.data?.Concept || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Control:</span>
                          <span className="text-gray-800 font-mono">
                            {result.details.validateP2P.data?.ControlNumber || 
                             result.details.validateReference.data?.ControlNumber || 
                             result.details.validateExistence.data?.ControlNumber || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monto:</span>
                          <span className="text-gray-800 font-bold">
                            Bs {(result.details.validateP2P.data?.Amount || 
                               result.details.validateReference.data?.Amount || 
                               result.details.validateExistence.data?.Amount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <p className="text-gray-500 text-xs text-center">
                      {formatDate(result.timestamp)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <div className="mb-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-gray-100 rounded-full border-2 border-gray-300">
                      <FaSearch className="text-xl text-gray-400" />
                    </div>
                  </div>
                  <h4 className="text-base font-semibold text-gray-700 mb-1">Sin resultados</h4>
                  <p className="text-gray-500 text-xs max-w-xs mx-auto">
                    Complete los campos azules y ejecute la validación
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}