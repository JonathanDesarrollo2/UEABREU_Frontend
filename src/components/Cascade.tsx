// src/components/CascadedValidationForm.tsx
import { useState } from 'react';
import { cascadedValidationAPI, type BankValidationRequest } from '../apis/bank';

export default function CascadedValidationForm() {
  const [formData, setFormData] = useState<BankValidationRequest>({
    AccountNumber: '',
    BankCode: 191, // Código por defecto para BNC
    PhoneNumber: '',
    ClientID: '',
    Reference: '',
    RequestDate: new Date().toISOString().split('T')[0],
    Amount: 0,
    ChildClientID: '',
    BranchID: ''
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
          {/* Número de Cuenta */}
          <div>
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
              placeholder="Ej: 01910001482101010049"
            />
          </div>

          {/* Código del Banco */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código del Banco *
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

          {/* Teléfono */}
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
              placeholder="Ej: 04121234567"
            />
          </div>

          {/* Client ID */}
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
              placeholder="ID del cliente"
            />
          </div>

          {/* Referencia */}
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
              placeholder="Número de referencia"
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Solicitud *
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

          {/* Monto */}
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
            />
          </div>

          {/* Child Client ID (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child Client ID
            </label>
            <input
              type="text"
              name="ChildClientID"
              value={formData.ChildClientID}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Opcional"
            />
          </div>

          {/* Branch ID (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch ID
            </label>
            <input
              type="text"
              name="BranchID"
              value={formData.BranchID}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Opcional"
            />
          </div>
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
          <h4 className="text-red-800 font-semibold mb-2">❌ Error</h4>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-green-800 font-semibold mb-2">
            {result.overallResult === 'success' ? '✅ Validación Exitosa' : 
             result.overallResult === 'manual_review' ? '⚠️ Revisión Manual' : '❌ Error'}
          </h4>
          <p className="text-green-700 mb-3">{result.message}</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>P2P:</span>
              <span className={result.details.validateP2P.movementExists ? 'text-green-600' : 'text-red-600'}>
                {result.details.validateP2P.executed ? 
                 (result.details.validateP2P.movementExists ? '✅ Encontrado' : '❌ No encontrado') : '⚪ No ejecutado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Referencia:</span>
              <span className={result.details.validateReference.movementExists ? 'text-green-600' : 'text-red-600'}>
                {result.details.validateReference.executed ? 
                 (result.details.validateReference.movementExists ? '✅ Encontrado' : '❌ No encontrado') : '⚪ No ejecutado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Existencia:</span>
              <span className={result.details.validateExistence.movementExists ? 'text-green-600' : 'text-red-600'}>
                {result.details.validateExistence.executed ? 
                 (result.details.validateExistence.movementExists ? '✅ Encontrado' : '❌ No encontrado') : '⚪ No ejecutado'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}