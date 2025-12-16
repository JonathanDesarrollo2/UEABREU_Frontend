// src/components/ValidationExample.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPlay,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaListOl
} from 'react-icons/fa';
import { cascadedValidationAPI } from '../apis/bank';

export default function ValidationExample() {
  const [exampleResult, setExampleResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Datos de ejemplo que pasarán por las 3 verificaciones
  const exampleData = {
    AccountNumber: "01910001482101041049",
    BankCode: 191,
    PhoneNumber: "584242207524", 
    ClientID: "J000121532",
    Reference: "40067",
    RequestDate: "2024-12-26",
    Amount: 101.00,
    ChildClientID: "",
    BranchID: ""
  };

  const runThreeStepValidation = async () => {
    setLoading(true);
    setExampleResult(null);
    
    try {
      // Simulamos un delay para mostrar el proceso paso a paso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await cascadedValidationAPI(exampleData);
      
      if (response.result) {
        setExampleResult(response.content);
      } else {
        setExampleResult({
          overallResult: 'error',
          message: 'Error en la validación: ' + (response.error?.[0] || 'Desconocido')
        });
      }
    } catch (error: any) {
      setExampleResult({
        overallResult: 'error',
        message: 'Error: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <FaListOl className="text-blue-600" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ejemplo: Validación en 3 Pasos</h3>
          <p className="text-sm text-gray-600">
            Simulación de un pago que pasa por las 3 verificaciones del banco
          </p>
        </div>
      </div>

      {/* Proceso de Validación */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
            <span className="font-medium">Validación P2P</span>
          </div>
          <FaArrowRight className="text-gray-400" />
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
            <span className="font-medium">Validación con Referencia</span>
          </div>
          <FaArrowRight className="text-gray-400" />
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
            <span className="font-medium">Validación de Existencia</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-blue-700 font-medium">Flujo del ejemplo:</p>
              <ul className="text-blue-600 text-sm mt-1 list-disc list-inside space-y-1">
                <li>Paso 1: Validación P2P → <span className="text-orange-600">Movimiento no encontrado</span></li>
                <li>Paso 2: Validación con Referencia → <span className="text-orange-600">Movimiento no encontrado</span></li>
                <li>Paso 3: Validación de Existencia → <span className="text-green-600">✓ Movimiento encontrado</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Datos del Ejemplo */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Datos utilizados en el ejemplo:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="font-medium text-gray-600">Cuenta:</span>
            <p className="mt-1 font-mono">{exampleData.AccountNumber}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="font-medium text-gray-600">Referencia:</span>
            <p className="mt-1 font-mono">{exampleData.Reference}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="font-medium text-gray-600">Monto:</span>
            <p className="mt-1 font-mono">${exampleData.Amount}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="font-medium text-gray-600">Teléfono:</span>
            <p className="mt-1 font-mono">{exampleData.PhoneNumber}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="font-medium text-gray-600">Banco:</span>
            <p className="mt-1 font-mono">{exampleData.BankCode}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="font-medium text-gray-600">Fecha:</span>
            <p className="mt-1 font-mono">{exampleData.RequestDate}</p>
          </div>
        </div>
      </div>

      {/* Botón de Ejecución */}
      <div className="flex justify-center mb-6">
        <button
          onClick={runThreeStepValidation}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 flex items-center space-x-2 transition-colors font-medium"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : (
            <FaPlay />
          )}
          <span>{loading ? 'Ejecutando ejemplo...' : 'Ejecutar Ejemplo de 3 Pasos'}</span>
        </button>
      </div>

      {/* Resultados */}
      {exampleResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border rounded-lg overflow-hidden"
        >
          {/* Header del Resultado */}
          <div className={`p-4 ${
            exampleResult.overallResult === 'success' 
              ? 'bg-green-500 text-white' 
              : exampleResult.overallResult === 'manual_review'
              ? 'bg-yellow-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center space-x-3">
              {exampleResult.overallResult === 'success' && <FaCheckCircle size={24} />}
              {exampleResult.overallResult === 'manual_review' && <FaExclamationTriangle size={24} />}
              {exampleResult.overallResult === 'error' && <FaTimesCircle size={24} />}
              <div>
                <h4 className="font-bold text-lg">Resultado del Ejemplo</h4>
                <p className="opacity-90">{exampleResult.message}</p>
              </div>
            </div>
          </div>

          {/* Detalles de las Validaciones */}
          <div className="p-4 bg-gray-50">
            <h5 className="font-medium text-gray-900 mb-3">Detalle por cada validación:</h5>
            
            <div className="space-y-4">
              {/* Validación P2P */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-gray-900">1. Validación P2P</h6>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    !exampleResult.details.validateP2P.movementExists 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {!exampleResult.details.validateP2P.movementExists ? 'No encontrado' : 'Encontrado'}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Esta validación no encontró el movimiento. El sistema continúa con la siguiente validación.
                </p>
                {exampleResult.details.validateP2P.data && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="font-medium">Concepto:</span> {exampleResult.details.validateP2P.data.Concept}
                  </div>
                )}
              </div>

              {/* Validación con Referencia */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-gray-900">2. Validación con Referencia</h6>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    !exampleResult.details.validateReference.movementExists 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {!exampleResult.details.validateReference.movementExists ? 'No encontrado' : 'Encontrado'}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Esta validación tampoco encontró el movimiento. El sistema procede con la tercera y última validación.
                </p>
                {exampleResult.details.validateReference.data && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="font-medium">Concepto:</span> {exampleResult.details.validateReference.data.Concept}
                  </div>
                )}
              </div>

              {/* Validación de Existencia */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-gray-900">3. Validación de Existencia</h6>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    exampleResult.details.validateExistence.movementExists 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {exampleResult.details.validateExistence.movementExists ? 'Encontrado' : 'No encontrado'}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {exampleResult.details.validateExistence.movementExists 
                    ? '¡Éxito! Esta validación encontró el movimiento. El pago ha sido verificado correctamente.'
                    : 'Esta validación tampoco encontró el movimiento. Se requerirá verificación manual.'
                  }
                </p>
                {exampleResult.details.validateExistence.data && exampleResult.details.validateExistence.movementExists && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">Detalles del movimiento encontrado:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                      <div><span className="font-medium">Control:</span> {exampleResult.details.validateExistence.data.ControlNumber}</div>
                      <div><span className="font-medium">Monto:</span> ${exampleResult.details.validateExistence.data.Amount}</div>
                      <div><span className="font-medium">Concepto:</span> {exampleResult.details.validateExistence.data.Concept}</div>
                      <div><span className="font-medium">Fecha:</span> {exampleResult.details.validateExistence.data.Date}</div>
                      <div><span className="font-medium">Tipo:</span> {exampleResult.details.validateExistence.data.Type}</div>
                      <div><span className="font-medium">Balance:</span> {exampleResult.details.validateExistence.data.BalanceDelta}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resumen del Proceso */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h6 className="font-medium text-blue-900 mb-2">Resumen del Proceso:</h6>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="text-2xl font-bold text-blue-600">1</p>
                  <p className="text-blue-700">P2P ejecutada</p>
                  <p className="text-blue-600 text-xs">Movimiento no encontrado</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">2</p>
                  <p className="text-blue-700">Referencia ejecutada</p>
                  <p className="text-blue-600 text-xs">Movimiento no encontrado</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">3</p>
                  <p className="text-green-700">Existencia ejecutada</p>
                  <p className="text-green-600 text-xs">Movimiento encontrado</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-blue-700 text-sm text-center">
                  <strong>Conclusión:</strong> El sistema recorrió las 3 validaciones y encontró el movimiento en la tercera verificación.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}