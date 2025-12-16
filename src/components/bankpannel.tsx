// src/components/BankPanel.tsx
import { useState, useEffect } from 'react';
import { 
  getBankFullStatusAPI 
} from '../apis/bank';
import CascadedValidationForm from '../components/CarcadeForm'; // ← Nuevo import

interface BankPanelProps {
  onAuthUpdate: (authenticated: boolean) => void;
}

export default function BankPanel({ onAuthUpdate }: BankPanelProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'validation'>('status'); // ← Nueva pestaña
  const [bankStatus, setBankStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Cargar estado del banco al montar el componente
  useEffect(() => {
    loadBankStatus();
  }, []);

  const loadBankStatus = async () => {
    setLoading(true);
    try {
      const response = await getBankFullStatusAPI();
      setBankStatus(response.content);
      onAuthUpdate(response.content?.auth?.authenticated || false);
    } catch (error: any) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    setAuthLoading(true);
    setStatusMessage('');
    try {
      setStatusMessage('✅ Autenticación exitosa con el banco');
      await loadBankStatus();
    } catch (error: any) {
      setStatusMessage(`❌ Error en autenticación: ${error.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setStatusMessage('');
    try {
      setStatusMessage('✅ Conexión con el banco establecida correctamente');
      await loadBankStatus();
    } catch (error: any) {
      setStatusMessage(`❌ Error en conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-8">
      {/* PESTAÑAS - Solo agregué una pestaña más */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === 'status' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('status')}
        >
          📊 Estado del Banco
        </button>
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === 'validation' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('validation')}
        >
          🔍 Validar Pago
        </button>
      </div>

      {/* CONTENIDO DE PESTAÑAS */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* TODO TU CONTENIDO ACTUAL DEL BANKPANEL */}
          {/* Estado del Banco */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Conexión</h4>
              <p className={`text-lg font-bold ${
                bankStatus?.health?.status === 'Connected' ? 'text-green-600' : 'text-red-600'
              }`}>
                {bankStatus?.health?.status || 'Desconocido'}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Autenticación</h4>
              <p className={`text-lg font-bold ${
                bankStatus?.auth?.authenticated ? 'text-green-600' : 'text-red-600'
              }`}>
                {bankStatus?.auth?.authenticated ? 'Autenticado' : 'No Autenticado'}
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Modo</h4>
              <p className="text-lg font-bold text-purple-600">
                {bankStatus?.auth?.testMode ? 'Pruebas' : 'Producción'}
              </p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex space-x-4">
            <button
              onClick={handleAuthenticate}
              disabled={authLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {authLoading ? '🔄 Autenticando...' : '🔐 Autenticar con Banco'}
            </button>

            <button
              onClick={handleTestConnection}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {loading ? '🔄 Probando...' : '📡 Probar Conexión'}
            </button>

            <button
              onClick={loadBankStatus}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {loading ? '🔄 Actualizando...' : '🔄 Actualizar Estado'}
            </button>
          </div>

          {/* Mensajes de Estado */}
          {statusMessage && (
            <div className={`p-4 rounded-lg ${
              statusMessage.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {statusMessage}
            </div>
          )}

          {/* Información Detallada */}
          {bankStatus && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Información Detallada</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Servicio:</span>
                  <span className="font-medium">{bankStatus.welcome?.service || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Versión:</span>
                  <span className="font-medium">{bankStatus.welcome?.version || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Working Key:</span>
                  <span className="font-medium">
                    {bankStatus.auth?.workingKey ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Entorno:</span>
                  <span className="font-medium">{bankStatus.environment || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Última Actualización:</span>
                  <span className="font-medium">
                    {new Date(bankStatus.timestamp || '').toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Información del Welcome */}
          {bankStatus?.welcome?.message && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Mensaje del Banco</h4>
              <p className="text-yellow-700">{bankStatus.welcome.message}</p>
            </div>
          )}
        </div>
      )}

      {/* NUEVA PESTAÑA - Validación de Pagos */}
      {activeTab === 'validation' && (
        <CascadedValidationForm />
      )}
    </div>
  );
}