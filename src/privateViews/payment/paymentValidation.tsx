// views/PaymentValidation.tsx
import { useState, useEffect } from 'react';
import { 
  cascadedValidationAPI, 
  type BankValidationRequest,
  getBCVRateAPI,
  type BCVRateResponse
} from '../../apis/bank';
import { 
  FaUniversity, 
  FaSearch, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimesCircle, 
  FaMoneyBillWave, 
  FaPhone, 
  FaIdCard,
  FaDollarSign,
  FaExchangeAlt,
  FaCalendarAlt,
  FaInfoCircle,
  FaCreditCard,
  FaCalendarDay,
  FaFileInvoiceDollar
} from 'react-icons/fa';

export default function PaymentValidation() {
  const [formData, setFormData] = useState<BankValidationRequest>({
    AccountNumber: '',
    BankCode: 191,
    PhoneNumber: '',
    ClientID: '',
    Reference: '',
    RequestDate: new Date().toISOString().split('T')[0],
    Amount: 0
  });

  const [loading, setLoading] = useState(false);
  const [loadingRate, setLoadingRate] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [bcvRate, setBcvRate] = useState<BCVRateResponse | null>(null);
  const [rateError, setRateError] = useState<string>('');
  const [usdAmount, setUsdAmount] = useState<number>(0);

  // Obtener tasa BCV al cargar el componente
  useEffect(() => {
    const fetchBCVRate = async () => {
      try {
        setLoadingRate(true);
        const response = await getBCVRateAPI();
        if (response.result && response.content) {
          setBcvRate(response.content);
          console.log('✅ Tasa BCV cargada:', response.content);
        }
      } catch (err: any) {
        setRateError('No se pudo cargar la tasa BCV. Mostrando tasa de respaldo.');
        // Tasa de respaldo en caso de error
        setBcvRate({
          PriceRateBCV: 36.6642,
          dtRate: new Date().toLocaleDateString('es-VE')
        });
        console.warn('⚠️ Usando tasa BCV de respaldo');
      } finally {
        setLoadingRate(false);
      }
    };

    fetchBCVRate();
  }, []);

  // Calcular equivalente en dólares cuando cambia el monto o la tasa
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

    try {
      const response = await cascadedValidationAPI(formData);
      setResult(response.content);
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

  // Función para formatear la tasa BCV
  const formatBCVDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    return dateStr;
  };

  // Función para formatear fecha
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
        {/* Header más compacto */}
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
            
            {/* Información de pago móvil compacta */}
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
          {/* Formulario (2/3 del ancho) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaSearch className="text-lg text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Consulta de Transacción</h2>
                </div>
                
                {/* Tasa BCV compacta */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Número de Cuenta */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número de Cuenta *
                    </label>
                    <input
                      type="text"
                      name="AccountNumber"
                      value={formData.AccountNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="01910001482101010049"
                    />
                  </div>

                  {/* Código del Banco */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Banco *
                    </label>
                    <select
                      name="BankCode"
                      value={formData.BankCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value={191} className="text-gray-800">BNC (0191)</option>
                      <option value={101} className="text-gray-800">Bancaribe (0101)</option>
                      <option value={104} className="text-gray-800">BdV (0104)</option>
                      <option value={105} className="text-gray-800">Mercantil (0105)</option>
                    </select>
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="text"
                      name="PhoneNumber"
                      value={formData.PhoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="584128021120"
                    />
                  </div>

                  {/* Client ID */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ID Cliente *
                    </label>
                    <input
                      type="text"
                      name="ClientID"
                      value={formData.ClientID}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="J000121532"
                    />
                  </div>

                  {/* Referencia */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Referencia *
                    </label>
                    <input
                      type="text"
                      name="Reference"
                      value={formData.Reference}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="40067"
                    />
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      name="RequestDate"
                      value={formData.RequestDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Monto en Bolívares con conversión a Dólares */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Monto (Bs) *
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          name="Amount"
                          value={formData.Amount}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                          placeholder="0.00"
                          min="0"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-gray-600 font-bold text-sm">Bs</span>
                        </div>
                      </div>
                      
                      {/* Equivalente en Dólares - más compacto */}
                      {formData.Amount > 0 && bcvRate && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
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
                </div>

                {/* Información */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <FaInfoCircle className="text-blue-600 text-sm mt-0.5" />
                    <div>
                      <p className="text-blue-700 text-xs">
                        <strong>Nota:</strong> Todos los campos son obligatorios. La validación se realiza mediante tres métodos consecutivos.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botón de envío */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-md flex items-center space-x-2"
                  >
                    {loading ? (
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
          </div>

          {/* Panel de Resultados (1/3 del ancho) */}
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

              {result ? (
                <div className={`${getStatusColor(result.overallResult)} rounded-xl p-4 border-2 transition-all duration-300`}>
                  {/* Estado Principal */}
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

                  {/* Detalle de cada validación */}
                  <div className="space-y-3 mt-4">
                    <div className={`flex justify-between items-center p-3 rounded-lg border ${
                      result.details.validateP2P.movementExists 
                        ? 'bg-green-50 border-green-200' 
                        : result.details.validateP2P.executed
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded ${
                          result.details.validateP2P.movementExists 
                            ? 'bg-green-100' 
                            : result.details.validateP2P.executed
                            ? 'bg-red-100'
                            : 'bg-gray-200'
                        }`}>
                          <FaCreditCard className={
                            result.details.validateP2P.movementExists 
                              ? 'text-green-600' 
                              : result.details.validateP2P.executed
                              ? 'text-red-600'
                              : 'text-gray-600'
                          } size={14} />
                        </div>
                        <span className="text-gray-700 text-sm">P2P</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        result.details.validateP2P.movementExists 
                          ? 'bg-green-500 text-white' 
                          : result.details.validateP2P.executed
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {result.details.validateP2P.executed ? 
                         (result.details.validateP2P.movementExists ? '✓' : '✗') : '—'}
                      </span>
                    </div>

                    <div className={`flex justify-between items-center p-3 rounded-lg border ${
                      result.details.validateReference.movementExists 
                        ? 'bg-green-50 border-green-200' 
                        : result.details.validateReference.executed
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded ${
                          result.details.validateReference.movementExists 
                            ? 'bg-green-100' 
                            : result.details.validateReference.executed
                            ? 'bg-red-100'
                            : 'bg-gray-200'
                        }`}>
                          <FaCalendarDay className={
                            result.details.validateReference.movementExists 
                              ? 'text-green-600' 
                              : result.details.validateReference.executed
                              ? 'text-red-600'
                              : 'text-gray-600'
                          } size={14} />
                        </div>
                        <span className="text-gray-700 text-sm">Referencia</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        result.details.validateReference.movementExists 
                          ? 'bg-green-500 text-white' 
                          : result.details.validateReference.executed
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {result.details.validateReference.executed ? 
                         (result.details.validateReference.movementExists ? '✓' : '✗') : '—'}
                      </span>
                    </div>

                    <div className={`flex justify-between items-center p-3 rounded-lg border ${
                      result.details.validateExistence.movementExists 
                        ? 'bg-green-50 border-green-200' 
                        : result.details.validateExistence.executed
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded ${
                          result.details.validateExistence.movementExists 
                            ? 'bg-green-100' 
                            : result.details.validateExistence.executed
                            ? 'bg-red-100'
                            : 'bg-gray-200'
                        }`}>
                          <FaUniversity className={
                            result.details.validateExistence.movementExists 
                              ? 'text-green-600' 
                              : result.details.validateExistence.executed
                              ? 'text-red-600'
                              : 'text-gray-600'
                          } size={14} />
                        </div>
                        <span className="text-gray-700 text-sm">Existencia</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        result.details.validateExistence.movementExists 
                          ? 'bg-green-500 text-white' 
                          : result.details.validateExistence.executed
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {result.details.validateExistence.executed ? 
                         (result.details.validateExistence.movementExists ? '✓' : '✗') : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Información adicional si se encontró movimiento */}
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

                  {/* Timestamp */}
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <p className="text-gray-500 text-xs text-center">
                      {formatDate(result.timestamp)}
                    </p>
                  </div>
                </div>
              ) : (
                /* Estado inicial (sin resultados) */
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <div className="mb-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-gray-100 rounded-full border-2 border-gray-300">
                      <FaSearch className="text-xl text-gray-400" />
                    </div>
                  </div>
                  <h4 className="text-base font-semibold text-gray-700 mb-1">Sin resultados</h4>
                  <p className="text-gray-500 text-xs max-w-xs mx-auto">
                    Complete el formulario y ejecute la validación
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