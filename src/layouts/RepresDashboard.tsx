import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
  FaUserGraduate,
  FaCreditCard,
  FaExchangeAlt
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getRepresentativeByEmail, getRepresentativeBalance } from '../apis/balance';
import { getBCVRateAPI, type BCVRateResponse } from '../apis/bank';

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
  const [bcvRate, setBcvRate] = useState<BCVRateResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (sessionContext.sesionEmail) {
          const repEmailRes = await getRepresentativeByEmail(sessionContext.sesionEmail);
          if (repEmailRes.result) {
            const repId = repEmailRes.content.id;
            setRepresentativeId(repId);

            const balanceRes = await getRepresentativeBalance(repId);
            if (balanceRes.result) {
              setBalanceData(balanceRes.content);
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

    const fetchBCVRate = async () => {
      try {
        const res = await getBCVRateAPI();
        if (res.result && res.content) {
          setBcvRate(res.content);
        } else {
          setBcvRate({ PriceRateBCV: 36.66, dtRate: new Date().toLocaleDateString('es-VE') });
        }
      } catch (error) {
        console.error('Error al obtener tasa BCV', error);
        setBcvRate({ PriceRateBCV: 36.66, dtRate: new Date().toLocaleDateString('es-VE') });
      }
    };

    fetchData();
    fetchBCVRate();
  }, [sessionContext.sesionEmail]);

  const representative = balanceData?.representative;
  const students = representative?.students || [];
  const balanceUSD = representative?.balance ?? 0; // balance está en USD
  const fullName = representative?.fullName || sessionContext.sesionUser;

  // Funciones de conversión y formato
  const formatBs = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatUsd = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const usdToBs = (usd: number) => {
    if (!bcvRate || bcvRate.PriceRateBCV <= 0) return 0;
    return usd * bcvRate.PriceRateBCV;
  };

  const balanceBs = usdToBs(balanceUSD);
  const isDebt = balanceUSD < 0;
  const isCredit = balanceUSD > 0;

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

        {/* Tasa BCV */}
        <div className="mt-4 inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
          <FaExchangeAlt className="mr-2" />
          {bcvRate ? (
            <span>Tasa BCV: <strong>{bcvRate.PriceRateBCV.toFixed(2)} Bs/USD</strong> ({bcvRate.dtRate})</span>
          ) : (
            <span>Cargando tasa...</span>
          )}
        </div>
      </motion.div>

      {/* --- NUEVA SECCIÓN: Estado de Cuenta por Estudiante --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h2 className="text-2xl font-bold text-gray-800">Estado de Cuenta</h2>
          <div
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              isDebt
                ? 'bg-red-50 text-red-700'
                : isCredit
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Total: {formatBs(balanceBs)} <span className="text-xs">≈ {formatUsd(balanceUSD)}</span>
          </div>
        </div>

        {loadingBalance ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center text-gray-500">
            Cargando información de estudiantes...
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center text-gray-500">
            No hay estudiantes registrados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student: any) => {
              const sBalanceUSD = student.balance || 0; // balance en USD
              const sBalanceBs = usdToBs(sBalanceUSD);
              const studentIsDebt = sBalanceUSD < 0;
              const studentIsCredit = sBalanceUSD > 0;
              const balanceColor = studentIsDebt ? 'text-red-600' : studentIsCredit ? 'text-green-600' : 'text-gray-600';
              const bgColor = studentIsDebt
                ? 'bg-red-50 border-red-200'
                : studentIsCredit
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200';
              const icon = studentIsDebt ? (
                <FaExclamationTriangle className="text-red-600 text-xl" />
              ) : studentIsCredit ? (
                <FaCheckCircle className="text-green-600 text-xl" />
              ) : (
                <FaMoneyBillWave className="text-gray-400 text-xl" />
              );

              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-xl border ${bgColor} p-5 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">
                        {student.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {student.currentGrade || 'Sin grado'} • {student.status}
                      </p>
                    </div>
                    <div className="ml-3">{icon}</div>
                  </div>

                  <div className="mt-4">
                    <p className={`text-2xl font-bold ${balanceColor}`}>
                      {formatBs(sBalanceBs)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ≈ {formatUsd(sBalanceUSD)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {studentIsDebt
                        ? `Deuda de ${formatBs(Math.abs(sBalanceBs))}`
                        : studentIsCredit
                        ? 'Saldo a favor'
                        : 'Sin movimientos'}
                    </p>
                  </div>

                  {studentIsDebt && (
                    <div className="mt-3 bg-red-100/50 rounded-lg px-3 py-2 text-sm text-red-800 font-medium flex items-center">
                      <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                      Pendiente de pago
                    </div>
                  )}
                </motion.div>
              );
            })}
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