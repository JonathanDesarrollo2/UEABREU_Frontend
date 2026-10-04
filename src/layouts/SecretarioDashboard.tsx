// src/layouts/SecretarioDashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMoneyCheck,
  FaHistory,
  FaSync,
  FaClock,
  FaArrowRight,
  FaExchangeAlt,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../library/axios';
import { getStoredRateAPI, type BCVRateResponse } from '../apis/bank';

interface SessionContext {
  sesionUser?: string;
  sesionEmail?: string;
  userStatus?: boolean;
  nivel?: number;
}

interface TxRow {
  id: string;
  type: string;
  amount: number;
  amountUSD?: number;
  description?: string;
  createdAt?: string;
  status?: string;
  representative?: { fullName?: string };
  student?: { fullName?: string };
}

export default function SecretarioDashboard() {
  const sessionContext = useOutletContext<SessionContext>();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalUSD, setTotalUSD] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [bcvRate, setBcvRate] = useState<BCVRateResponse | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setLoadingRate(true);
        const res = await getStoredRateAPI();
        if (res.result && res.content) setBcvRate(res.content);
      } catch {
        setBcvRate(null);
      } finally {
        setLoadingRate(false);
      }
    };
    fetchRate();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/private/balance/transactions', {
        params: { page: 1, limit: 5 },
      });

      if (res.data?.result) {
        const list: TxRow[] = res.data.content?.transactions || [];
        setTransactions(list);
        setTotalRecords(res.data.content?.pagination?.totalRecords || 0);

        const deposits = list
          .filter((t) => t.type === 'deposit')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const usd = list
          .filter((t) => t.type === 'deposit')
          .reduce((sum, t) => sum + (t.amountUSD || 0), 0);

        setTotalDeposits(deposits);
        setTotalUSD(usd);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      console.error('Error cargando dashboard secretario:', err);
      toast.error('No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatBs = (amount: number) =>
    new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);
  const formatUsd = (amount: number) =>
    new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white mb-8 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Panel de Secretaría</h1>
            <p className="text-purple-100">
              Bienvenido, {sessionContext.sesionUser || 'Usuario'}
            </p>
            <div className="flex items-center mt-2 space-x-4 text-sm">
              <span className="flex items-center">
                <FaClock className="mr-2" /> Última actualización: {lastUpdated || 'No disponible'}
              </span>
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
              >
                <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4 md:mt-0">
            <div className="text-center">
              <p className="text-sm opacity-90">Tasa BCV del día</p>
              {loadingRate ? (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="text-sm">Cargando...</span>
                </div>
              ) : bcvRate ? (
                <>
                  <p className="font-bold text-lg">{bcvRate.PriceRateBCV.toFixed(2)} Bs/USD</p>
                  <p className="text-xs opacity-75 mt-1">{bcvRate.dtRate}</p>
                </>
              ) : (
                <p className="text-sm">No disponible</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
              <FaHistory size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Total Transacciones</p>
              <p className="text-2xl font-bold text-gray-800">{totalRecords}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md">
              <FaMoneyCheck size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Depósitos recientes</p>
              <p className="text-lg font-bold text-gray-800">{formatBs(totalDeposits)}</p>
              <p className="text-xs text-green-600 font-semibold">≈ {formatUsd(totalUSD)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md">
              <FaExchangeAlt size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Rol</p>
              <p className="text-lg font-bold text-gray-800">Secretario</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate('/secretario/registrar-pago')}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md">
              <FaMoneyCheck size={28} />
            </div>
            <FaArrowRight className="text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Registrar Pago</h3>
          <p className="text-gray-600 text-sm">
            Busca un representante y adjunta la validación de un nuevo pago.
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate('/secretario/pagos')}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
              <FaHistory size={28} />
            </div>
            <FaArrowRight className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Historial de Pagos</h3>
          <p className="text-gray-600 text-sm">
            Consulta todos los movimientos registrados en el sistema.
          </p>
        </motion.button>
      </div>

      {/* Últimas transacciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 mr-4">
              <FaHistory size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Últimas Transacciones</h3>
              <p className="text-gray-600 text-sm">Los 5 movimientos más recientes</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/secretario/pagos')}
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
          >
            Ver todos <FaArrowRight className="text-xs" />
          </button>
        </div>

        {loading && transactions.length === 0 ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No hay transacciones registradas.</div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const isDeposit = tx.type === 'deposit';
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                      isDeposit ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-rose-500'
                    }`}>
                      {isDeposit ? <FaCheckCircle /> : <FaTimesCircle />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {tx.representative?.fullName || '—'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {tx.description || '—'} • {tx.student?.fullName || 'Sin estudiante'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className={`font-bold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                      {isDeposit ? '+' : '-'}{formatBs(tx.amount || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('es-VE') : '—'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-gray-500 text-sm"
      >
        <p>Sistema de Gestión Escolar • Panel de Secretaría</p>
      </motion.div>
    </div>
  );
}