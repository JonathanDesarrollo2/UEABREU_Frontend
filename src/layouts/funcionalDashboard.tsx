// src/layouts/FuncionalDashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUserPlus,
  FaUser,
  FaSync,
  FaClock,
  FaArrowRight,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaPercentage,
  FaDollarSign,
  FaExclamationTriangle,
  FaChartPie,
} from 'react-icons/fa';
import api from '../library/axios';
import { getDashboardStatsAPI, type DashboardStats } from '../apis/dashboard';
import { getStoredRateAPI, type BCVRateResponse } from '../apis/bank';

interface SessionContext {
  sesionUser?: string;
  sesionEmail?: string;
  userStatus?: boolean;
  nivel?: number;
}

interface RepRow {
  id: string;
  fullName: string;
  identityCard: string;
  phone?: string;
  email?: string;
  createdAt?: string;
}

// Componente interno para el Gráfico de Dona (Reutilizado del Admin)
const DoughnutChart: React.FC<{ debtors: number; creditors: number; zero: number }> = ({ debtors, creditors, zero }) => {
  const total = debtors + creditors + zero;
  if (total === 0) {
    return <div className="flex items-center justify-center py-10 text-gray-400 text-sm">Sin datos para mostrar</div>;
  }

  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { value: debtors, color: '#dc2626', label: 'En deuda' },
    { value: creditors, color: '#16a34a', label: 'Al día' },
    { value: zero, color: '#6b7280', label: 'Sin movimientos' },
  ];

  let offset = 0;

  return (
    <div className="flex items-center justify-center gap-6 flex-wrap">
      <div className="relative">
        <svg width={160} height={160} viewBox="0 0 160 160">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={20} />
          {segments.map((seg, i) => {
            const fraction = seg.value / total;
            const dash = fraction * circumference;
            const currentOffset = offset;
            offset += dash;
            if (seg.value === 0) return null;
            return (
              <circle
                key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={20}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-currentOffset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{total}</span>
          <span className="text-xs text-gray-500">Estudiantes</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm" style={{ background: seg.color }}></span>
            <span className="text-gray-700">{seg.label}:</span>
            <span className="font-bold text-gray-900">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function FuncionalDashboard() {
  const sessionContext = useOutletContext<SessionContext>();
  const navigate = useNavigate();

  // Estados de los representantes recientes
  const [representatives, setRepresentatives] = useState<RepRow[]>([]);
  
  // Estados del Dashboard Administrativo
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bcvRate, setBcvRate] = useState<BCVRateResponse | null>(null);
  
  // Estados de carga general
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // 1. Cargar últimos representantes
  const loadRepresentatives = useCallback(async () => {
    try {
      const res = await api.get('/private/user/listpag', {
        params: {
          page: 1,
          limit: 5,
          idBus: 4,          // ordenar por createdAt DESC
          DeBus: '',
          nivelFilter: 1,    // solo representantes
        },
      });

      if (res.data?.result && Array.isArray(res.data.content)) {
        const list: RepRow[] = res.data.content.map((u: any) => ({
          id: u.id,
          fullName: u.representative?.fullName || u.username || u.userlogin,
          identityCard: u.representative?.identityCard || '—',
          phone: u.representative?.phone || '—',
          email: u.usermail,
          createdAt: u.createdAt,
        }));
        setRepresentatives(list);
      }
    } catch (err: any) {
      console.error('Error cargando representantes:', err);
    }
  }, []);

  // 2. Cargar estadísticas del dashboard administrativo
  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const data = await getDashboardStatsAPI();
      if (data && typeof data === 'object') {
        setStats(data);
      }
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 3. Cargar tasa BCV
  const loadRate = useCallback(async () => {
    try {
      const response = await getStoredRateAPI();
      if (response.result && response.content) {
        setBcvRate(response.content);
      }
    } catch (err) {
      console.error('Error cargando tasa:', err);
    }
  }, []);

  // Función general para actualizar todo
  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadRepresentatives(), loadStats(), loadRate()]);
    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  }, [loadRepresentatives, loadStats, loadRate]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Helper para conversiones
  const usdToBs = (usd: number) => {
    if (!bcvRate || bcvRate.PriceRateBCV <= 0) return 0;
    return usd * bcvRate.PriceRateBCV;
  };

  const formatCurrency = (amount: number, currency: 'VES' | 'USD' = 'VES') => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === 'VES' ? 'VES' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Arreglo de Tarjetas de Estadísticas (Admin)
  const mainStats = stats ? [
    {
      title: "Docentes Activos",
      value: stats.teachers.active.toString(),
      icon: FaChalkboardTeacher,
      color: "bg-blue-500",
    },
    {
      title: "Estudiantes Regulares",
      value: stats.students.active.toString(),
      icon: FaUserGraduate,
      color: "bg-green-500",
    },
    {
      title: "Pagos al Día",
      value: `${stats.representatives.paymentPercentage}%`,
      icon: FaPercentage,
      color: "bg-purple-500",
    },
    {
      title: "Recaudado (Bs)",
      value: formatCurrency(usdToBs(stats.financial.monthlyCollected), 'VES'),
      icon: FaDollarSign,
      color: "bg-orange-500",
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-2xl p-6 text-white mb-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Panel Funcional</h1>
            <p className="text-cyan-100">Bienvenido, {sessionContext.sesionUser || 'Usuario'}</p>
            <div className="flex items-center mt-3 space-x-4 text-sm">
              <span className="flex items-center text-cyan-100">
                <FaClock className="mr-2" /> Última actualización: {lastUpdated || 'No disponible'}
              </span>
              <button
                onClick={refreshAll}
                disabled={loading}
                className="flex items-center bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-sm font-semibold"
              >
                <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4 md:mt-0">
            <div className="text-center">
              <p className="text-sm opacity-90">Tu Rol</p>
              <p className="font-bold text-lg">FUNCIONAL</p>
              <p className="text-xs opacity-75 mt-1">Nivel de acceso 3</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── TASA BCV ── */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FaSync className="text-blue-600" />
          <span className="text-sm text-blue-800 font-medium">Tasa BCV del día:</span>
        </div>
        {bcvRate ? (
          <div className="text-right">
            <span className="text-lg font-bold text-blue-800">{bcvRate.PriceRateBCV.toFixed(2)} Bs/USD</span>
            <span className="text-xs text-blue-600 ml-2">{bcvRate.dtRate}</span>
          </div>
        ) : (
          <span className="text-red-600 text-sm">No disponible</span>
        )}
      </div>

      {/* ── TARJETAS DE ESTADÍSTICAS (ADMIN) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loadingStats ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-pulse h-28"></div>
          ))
        ) : mainStats.length > 0 ? (
          mainStats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg text-white ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
              </div>
            </div>
          ))
        ) : null}
      </div>

      {/* ── BOTONES DE ACCIÓN RÁPIDA ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/funcional/users/insert')}
          className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-all text-left group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <FaUserPlus size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Nuevo Representante</h3>
              <p className="text-gray-500 text-sm">Registrar cuenta y estudiantes</p>
            </div>
          </div>
          <FaArrowRight className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/funcional/students/list')}
          className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-all text-left group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <FaUserGraduate size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ver Estudiantes</h3>
              <p className="text-gray-500 text-sm">Lista de alumnos en modo lectura</p>
            </div>
          </div>
          <FaArrowRight className="text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
        </motion.button>
      </div>

      {/* ── GRÁFICOS Y MÉTRICAS (ADMIN) ── */}
      {!loadingStats && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Gráfico de Dona */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-5 border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600 mr-3">
                <FaChartPie size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Distribución de Estudiantes</h3>
            </div>
            <DoughnutChart
              debtors={stats.chartData.debtors.length}
              creditors={stats.chartData.creditors.length}
              zero={stats.chartData.zeroBalance.length}
            />
          </motion.div>

          {/* Top Deudores */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-5 border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-red-100 text-red-600 mr-3">
                <FaExclamationTriangle size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Top Deudores</h3>
            </div>
            <div className="space-y-3">
              {stats.topDebtors.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">No hay deudores registrados</div>
              ) : (
                stats.topDebtors.slice(0, 3).map((d, i) => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{d.fullName}</p>
                        <p className="text-xs text-gray-500">{d.representativeName || '—'}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(usdToBs(d.debtAmount), 'VES')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── ÚLTIMOS REPRESENTANTES ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-5 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-600 mr-3">
              <FaUser size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Últimos Representantes</h3>
          </div>
          <button
            onClick={() => navigate('/funcional/users/list')}
            className="text-sm font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            Ver todos <FaArrowRight className="text-xs" />
          </button>
        </div>

        {loading && representatives.length === 0 ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        ) : representatives.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Aún no hay representantes registrados.
          </div>
        ) : (
          <div className="space-y-2">
            {representatives.map((rep) => (
              <div
                key={rep.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm">
                    {rep.fullName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{rep.fullName}</p>
                    <p className="text-xs text-gray-500">
                      CI: {rep.identityCard} • {rep.email || 'Sin correo'}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('es-VE') : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-gray-500 text-sm"
      >
        <p>Sistema de Gestión Escolar • Panel Funcional</p>
      </motion.div>
    </div>
  );
}