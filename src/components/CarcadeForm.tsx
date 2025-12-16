// src/components/CascadedValidationForm.tsx
import { useState } from 'react';
import { cascadedValidationAPI, type BankValidationRequest } from '../apis/bank';

export default function CascadedValidationForm() {
  const [formData, setFormData] = useState<BankValidationRequest>({
    AccountNumber: '',
    BankCode: 191, // BNC por defecto
    PhoneNumber: '',
    ClientID: '',
    Reference: '',
    RequestDate: new Date().toISOString().split('T')[0],
    Amount: 0
    // Eliminados: ChildClientID, BranchID - NO son necesarios
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

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

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        🔍 Validación de Pagos en Cascada
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Número de Cuenta - REQUERIDO */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Cuenta *
            </label>
            <input
              type="text"
              name="AccountNumber"
              value={formData.AccountNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="01910001482101010049 (20 dígitos)"
            />
          </div>

          {/* Código del Banco - REQUERIDO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banco *
            </label>
            <select
              name="BankCode"
              value={formData.BankCode}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={191}>BNC (0191)</option>
              <option value={101}>Bancaribe (0101)</option>
              <option value={104}>Venezuela (0104)</option>
              <option value={105}>Mercantil (0105)</option>
            </select>
          </div>

          {/* Teléfono - REQUERIDO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="text"
              name="PhoneNumber"
              value={formData.PhoneNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="584128021120 (código país + número)"
            />
          </div>

          {/* Client ID - REQUERIDO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client ID *
            </label>
            <input
              type="text"
              name="ClientID"
              value={formData.ClientID}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="J000121532 (Tipo + Identificación)"
            />
          </div>

          {/* Referencia - REQUERIDO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referencia *
            </label>
            <input
              type="text"
              name="Reference"
              value={formData.Reference}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="40067 (últimos 4 dígitos)"
            />
          </div>

          {/* Fecha - REQUERIDO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha del Movimiento *
            </label>
            <input
              type="date"
              name="RequestDate"
              value={formData.RequestDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Monto - REQUERIDO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto *
            </label>
            <input
              type="number"
              step="0.01"
              name="Amount"
              value={formData.Amount}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              min="0"
            />
          </div>
        </div>

        {/* Información de campos requeridos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-700">
            💡 <strong>Nota:</strong> Todos los campos marcados con * son obligatorios. 
            Los campos opcionales (ChildClientID, BranchID) no son necesarios para la verificación.
          </p>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? '🔄 Validando...' : '🔍 Validar Pago'}
          </button>
        </div>
      </form>

      {/* Mostrar Resultados */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-semibold mb-2">❌ Error en Validación</h4>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className={`mt-6 p-4 rounded-lg border ${
          result.overallResult === 'success' 
            ? 'bg-green-50 border-green-200' 
            : result.overallResult === 'manual_review'
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            result.overallResult === 'success' 
              ? 'text-green-800' 
              : result.overallResult === 'manual_review'
              ? 'text-yellow-800'
              : 'text-red-800'
          }`}>
            {result.overallResult === 'success' 
              ? '✅ Pago Verificado Exitosamente' 
              : result.overallResult === 'manual_review'
              ? '⚠️ Requiere Revisión Manual'
              : '❌ Error en Validación'}
          </h4>
          
          <p className={`mb-3 ${
            result.overallResult === 'success' 
              ? 'text-green-700' 
              : result.overallResult === 'manual_review'
              ? 'text-yellow-700'
              : 'text-red-700'
          }`}>
            {result.message}
          </p>
          
          {/* Detalles de cada validación */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium">Validación P2P:</span>
              <span className={result.details.validateP2P.movementExists ? 'text-green-600 font-semibold' : 'text-red-600'}>
                {result.details.validateP2P.executed ? 
                 (result.details.validateP2P.movementExists ? '✅ Movimiento Encontrado' : '❌ No Encontrado') : '⚪ No Ejecutado'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Validación por Referencia:</span>
              <span className={result.details.validateReference.movementExists ? 'text-green-600 font-semibold' : 'text-red-600'}>
                {result.details.validateReference.executed ? 
                 (result.details.validateReference.movementExists ? '✅ Movimiento Encontrado' : '❌ No Encontrado') : '⚪ No Ejecutado'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Validación por Existencia:</span>
              <span className={result.details.validateExistence.movementExists ? 'text-green-600 font-semibold' : 'text-red-600'}>
                {result.details.validateExistence.executed ? 
                 (result.details.validateExistence.movementExists ? '✅ Movimiento Encontrado' : '❌ No Encontrado') : '⚪ No Ejecutado'}
              </span>
            </div>
          </div>

          {/* Información adicional del movimiento si se encontró */}
          {(result.details.validateP2P.movementExists || 
            result.details.validateReference.movementExists || 
            result.details.validateExistence.movementExists) && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">📋 Información del Movimiento:</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Concepto:</strong> {result.details.validateP2P.data?.Concept || 
                                            result.details.validateReference.data?.Concept || 
                                            result.details.validateExistence.data?.Concept}</p>
                <p><strong>Número de Control:</strong> {result.details.validateP2P.data?.ControlNumber || 
                                                      result.details.validateReference.data?.ControlNumber || 
                                                      result.details.validateExistence.data?.ControlNumber}</p>
                <p><strong>Fecha:</strong> {result.details.validateP2P.data?.Date || 
                                          result.details.validateReference.data?.Date || 
                                          result.details.validateExistence.data?.Date}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}