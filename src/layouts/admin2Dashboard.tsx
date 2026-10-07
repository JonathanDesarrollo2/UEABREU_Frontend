// src/layouts/Admin2Dashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaExchangeAlt,
  FaTrophy,
  FaHistory,
  FaMoneyCheck,
  FaSync,
  FaClock,
  FaArrowRight,
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

export default function Admin2Dashboard() {
  const sessionContext = useOutletContext<SessionContext>();
  const navigate = useNavigate();

  const [bcvRate, setBcvRate] = useState<BCVRateResponse | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalRepresentatives, setTotalRepresentatives] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

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

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, repsRes] = await Promise.allSettled([
        api.get('/private/balance/transactions', { params: { page: 1, limit: 1 } }),
        api.get('/private/balance/representatives', { params: { page: 1, limit: 1 } }),
      ]);

      if (txRes.status === 'fulfilled' && txRes.value.data?.result) {
        setTotalTransactions(txRes.value.data.content?.pagination?.totalRecords || 0);
      }
      if (repsRes.status === 'fulfilled' && repsRes.value.data?.result) {
        const content = repsRes.value.data.content;
        setTotalRepresentatives(
          content?.pagination?.totalRecords || content?.representatives?.length || 0
        );
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('Error cargando estadísticas:', err);
      toast.error('No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const cards = [
    {
      title: 'TasaLista',
      description: 'Consulta las tasas BCV registradas por mes (solo lectura).',
      icon: FaExchangeAlt,
      path: '/admin2/tasa-lista',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Ranking Estudiantes',
      description: 'Revisa el ranking de estudiantes deudores y al día.',
      icon: FaTrophy,
      path: '/admin2/ranking',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      title: 'Historial de Pagos',
      description: 'Consulta todos los movimientos registrados.',
      icon: FaHistory,
      path: '/admin2/transactions',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Pagos y Balance',
      description: 'Registra depósitos, retiros y gestiona saldos manualmente.',
      icon: FaMoneyCheck,
      path: '/admin2/Balance',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 text-white mb-8 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Panel Administrativo 2</h1>
            <p className="text-orange-100">
              Bienvenido, {sessionContext.sesionUser || 'Usuario'}
            </p>
            <div className="flex items-center mt-2 space-x-4 text-sm">
              <span className="flex items-center">
                <FaClock className="mr-2" /> Última actualización: {lastUpdated || 'No disponible'}
              </span>
              <button
                onClick={loadStats}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
              <FaHistory size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Total Transacciones</p>
              <p className="text-2xl font-bold text-gray-800">{totalTransactions}</p>
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
              <FaMoneyCheck size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Total Representantes</p>
              <p className="text-2xl font-bold text-gray-800">{totalRepresentatives}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {cards.map((card, idx) => (
          <motion.button
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-xl bg-gradient-to-r ${card.color} text-white shadow-md`}>
                <card.icon size={28} />
              </div>
              <FaArrowRight
                className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"
                size={20}
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
            <p className="text-gray-600 text-sm">{card.description}</p>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-gray-500 text-sm"
      >
        <p>Sistema de Gestión Escolar • Panel Administrativo 2</p>
      </motion.div>
    </div>
  );
}