// src/pages/representante/RepresDashboard.tsx
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
  FaUserGraduate,
  FaCreditCard
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getRepresentativeByEmail, getRepresentativeBalance } from '../apis/balance';

interface SessionContext {
  sesionUser?: string;
  sesionEmail?: string;
  userStatus?: boolean;
  nivel?: number;
  studentInfo?: {
    name?: string;
    status?: boolean;
  } | null;
}

export default function RepresDashboard() {
  const sessionContext = useOutletContext<SessionContext>();
  const navigate = useNavigate();

  const [representativeId, setRepresentativeId] = useState<string | null>(null);
  const [balanceData, setBalanceData] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [childrenCount, setChildrenCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (sessionContext.sesionEmail) {
          // 1. Obtener el ID del representante por email
          const repEmailRes = await getRepresentativeByEmail(sessionContext.sesionEmail);
          if (repEmailRes.result) {
            const repId = repEmailRes.content.id;
            setRepresentativeId(repId);

            // 2. Obtener el balance completo
            const balanceRes = await getRepresentativeBalance(repId);
            if (balanceRes.result) {
              setBalanceData(balanceRes.content);
              // El número de hijos se obtiene del arreglo students dentro de representative
              setChildrenCount(balanceRes.content.representative.students?.length || 0);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar datos financieros', error);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchData();
  }, [sessionContext.sesionEmail]);

  // Datos reales de deuda/saldo (ahora desde balanceData.representative)
  const representative = balanceData?.representative;
  const balance = representative?.balance ?? 0;
  const isDebt = balance < 0;
  const debtAmount = isDebt ? Math.abs(balance) : 0;
  const fullName = representative?.fullName || sessionContext.sesionUser;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header de Bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-6 text-white mb-8 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <FaUserGraduate className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">
                ¡Bienvenido, {fullName}!
              </h1>
              <p className="text-blue-200 text-lg">
                Panel de Representante
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 border-2 border-white/30">
            <p className="text-sm font-medium">Hijos registrados</p>
            <p className="text-lg font-bold text-blue-200">
              {loadingBalance ? '...' : childrenCount}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tarjeta de Estado de Cuenta (REAL) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className={`p-4 ${isDebt ? 'bg-red-100' : 'bg-green-100'} rounded-xl`}>
              <FaMoneyBillWave className={`${isDebt ? 'text-red-600' : 'text-green-600'} text-2xl`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Estado de Cuenta</h3>
              <p className="text-gray-600">Saldo actual</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className={`text-4xl font-bold ${isDebt ? 'text-red-600' : 'text-green-600'}`}>
              ${balance.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isDebt ? 'Deuda pendiente' : 'Saldo a favor'}
            </p>
          </div>
        </div>

        {isDebt && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-600 text-xl mr-4 flex-shrink-0" />
              <p className="text-red-800">
                Tienes una deuda de ${debtAmount.toFixed(2)}. Por favor regulariza tu situación para evitar recargos.
              </p>
            </div>
          </div>
        )}
        {!isDebt && balance === 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center">
              <FaCheckCircle className="text-blue-600 text-xl mr-4 flex-shrink-0" />
              <p className="text-blue-800">
                No tienes deudas ni saldo a favor.
              </p>
            </div>
          </div>
        )}
        {!isDebt && balance > 0 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-600 text-xl mr-4 flex-shrink-0" />
              <p className="text-green-800">
                Tienes un saldo a favor de ${balance.toFixed(2)}. ¡Todo al día!
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Acceso Rápido */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Botón Validar Pago */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Validar Pago</h3>
          <button
            onClick={() => {
              if (representativeId) {
                navigate(`/representante/validar-pago/${representativeId}`);
              }
            }}
            disabled={!representativeId}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-3 text-lg font-semibold"
          >
            <FaCreditCard />
            <span>Validar Pago Bancario</span>
          </button>
          <p className="text-center text-gray-500 text-sm mt-3">
            Registra un pago mediante verificación bancaria automática.
          </p>
        </div>

        {/* Botón Horarios */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Horarios de Clases</h3>
          <button
            onClick={() => navigate('/representante/ChildrenSchedule')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-3 text-lg font-semibold"
          >
            <FaCalendarAlt />
            <span>Ver Horarios de Mis Hijos</span>
          </button>
          <p className="text-center text-gray-500 text-sm mt-3">
            Consulta los horarios de clases de todos tus hijos.
          </p>
        </div>
      </motion.div>
    </div>
  );
}