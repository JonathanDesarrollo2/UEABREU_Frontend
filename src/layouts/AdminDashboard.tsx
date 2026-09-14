import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUsers, FaUserGraduate, FaChalkboardTeacher, FaMoneyCheck, FaChartLine,
  FaSchool, FaExclamationTriangle, FaSync, FaArrowUp, FaArrowDown,
  FaPercentage, FaDollarSign, FaUserCheck, FaClock, FaBalanceScale,
  FaExchangeAlt, FaUserShield, FaUserTie, FaCog, FaChartPie,
} from 'react-icons/fa';
import {
  getDashboardStatsAPI, getTransactionsByRoleAPI,
  type DashboardStats, type ChartStudent,
} from '../apis/dashboard';
import { getBCVRateAPI, type BCVRateResponse } from '../apis/bank';
import { toast } from 'react-toastify';

interface SessionContext {
  sesionUser?: string;
  sesionEmail?: string;
  userStatus?: boolean;
  nivel?: number;
}

const typeLabels: Record<string, string> = {
  deposit: 'Depósito', withdrawal: 'Retiro', payment: 'Pago',
  fee: 'Cargo', adjustment: 'Ajuste',
};

const getTypeLabel = (type: string) => typeLabels[type] || type;

const getTypeColor = (type: string) => {
  switch (type) {
    case 'deposit': return 'bg-green-100 text-green-800';
    case 'fee': return 'bg-red-100 text-red-800';
    case 'adjustment': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

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

export default function AdminDashboard() {
  const sessionContext = useOutletContext<SessionContext>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'academic'>('overview');
  const [retryCount, setRetryCount] = useState(0);

  const [bcvRate, setBcvRate] = useState<BCVRateResponse | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  const [studentFilter, setStudentFilter] = useState<'all' | 'debtors' | 'creditors' | 'zero'>('all');

  const [transactionRole, setTransactionRole] = useState<'' | 'admin' | 'representative' | 'system'>('');
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [loadingFilteredTx, setLoadingFilteredTx] = useState(false);

  useEffect(() => {
    const fetchBCVRate = async () => {
      try {
        setLoadingRate(true);
        const response = await getBCVRateAPI();
        if (response.result && response.content) setBcvRate(response.content);
      } catch (err: any) {
        setBcvRate({
          PriceRateBCV: 36.6642,
          dtRate: new Date().toLocaleDateString('es-VE').split('/').reverse().join('/')
        });
      } finally {
        setLoadingRate(false);
      }
    };
    fetchBCVRate();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStatsAPI();
      if (data && typeof data === 'object') {
        setStats(data);
        setLastUpdated(new Date().toLocaleTimeString());
        setRetryCount(0);
      } else {
        if (retryCount >= 2) {
          toast.warning('No se pudieron cargar los datos del dashboard.', { position: "top-right", autoClose: 5000 });
        }
        setRetryCount(prev => prev + 1);
      }
    } catch (error) {
      if (retryCount >= 2) {
        toast.error('Error crítico al cargar el dashboard', { position: "top-right", autoClose: 5000 });
      }
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchFilteredTransactions = useCallback(async (role: '' | 'admin' | 'representative' | 'system') => {
    setLoadingFilteredTx(true);
    try {
      const res = await getTransactionsByRoleAPI({ createdByRole: role, limit: 20, page: 1 });
      if (res.result) setFilteredTransactions(res.content.transactions || []);
      else setFilteredTransactions([]);
    } catch (err) {
      setFilteredTransactions([]);
    } finally {
      setLoadingFilteredTx(false);
    }
  }, []);

  useEffect(() => {
    fetchFilteredTransactions(transactionRole);
  }, [transactionRole, fetchFilteredTransactions]);

  const usdToBs = (usd: number) => {
    if (!bcvRate || bcvRate.PriceRateBCV <= 0) return 0;
    return usd * bcvRate.PriceRateBCV;
  };

  const formatCurrency = (amount: number, currency: 'VES' | 'USD' = 'VES') => {
    const formatter = new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === 'VES' ? 'VES' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  };

  const calculatePercentage = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0;

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">Cargando dashboard...</p>
          <button onClick={loadDashboardData} className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto">
            <FaSync className="mr-2" /> Reintentar ahora
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const totalDebtBs = usdToBs(stats.financial.totalDebt);
  const totalCreditBs = usdToBs(stats.financial.totalCredit);
  const monthlyCollectedBs = usdToBs(stats.financial.monthlyCollected);

  const mainStats = [
    {
      title: "Docentes Activos",
      value: stats.teachers.active.toString(),
      change: `${stats.teachers.total} total`,
      icon: FaChalkboardTeacher,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      trend: stats.teachers.active > 0 ? "up" : "neutral",
      description: "Personal docente activo",
      percentage: calculatePercentage(stats.teachers.active, stats.teachers.total)
    },
    {
      title: "Estudiantes Regulares",
      value: stats.students.active.toString(),
      change: `${stats.students.total} total`,
      icon: FaUserGraduate,
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      trend: stats.students.active > 0 ? "up" : "neutral",
      description: "Estudiantes activos",
      percentage: calculatePercentage(stats.students.active, stats.students.total)
    },
    {
      title: "Pagos al Día",
      value: `${stats.representatives.paymentPercentage}%`,
      change: `${stats.representatives.withDebt} con deuda`,
      icon: FaPercentage,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      trend: stats.representatives.paymentPercentage >= 80 ? "up" : "down",
      description: "Representantes al día",
      percentage: stats.representatives.paymentPercentage
    },
    {
      title: "Recaudado (Bs)",
      value: formatCurrency(monthlyCollectedBs, 'VES'),
      change: `${formatCurrency(totalDebtBs, 'VES')} por cobrar`,
      icon: FaDollarSign,
      color: "bg-gradient-to-r from-orange-500 to-yellow-500",
      trend: totalDebtBs === 0 ? "up" : monthlyCollectedBs > 0 ? "up" : "down",
      description: "Este mes",
      percentage: totalDebtBs > 0 ? Math.round((monthlyCollectedBs / totalDebtBs) * 100) : (monthlyCollectedBs > 0 ? 100 : 0)
    }
  ];

  const studentStatusData = [
    { status: 'Regular', count: stats.students.byStatus.regular, color: 'bg-green-100 text-green-800' },
    { status: 'Pendiente', count: stats.students.byStatus.pendiente, color: 'bg-yellow-100 text-yellow-800' },
    { status: 'Repitiente', count: stats.students.byStatus.repitiente, color: 'bg-orange-100 text-orange-800' },
    { status: 'Condicionado', count: stats.students.byStatus.condicionado, color: 'bg-red-100 text-red-800' },
    { status: 'Inactivo', count: stats.students.byStatus.inactivo, color: 'bg-gray-100 text-gray-800' }
  ];

  const filteredStudents: ChartStudent[] = (() => {
    const { debtors, creditors, zeroBalance } = stats.chartData;
    if (studentFilter === 'debtors') return debtors;
    if (studentFilter === 'creditors') return creditors;
    if (studentFilter === 'zero') return zeroBalance;
    return [...debtors, ...creditors, ...zeroBalance];
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-8 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard Administrativo</h1>
            <p className="text-indigo-200">Sistema de Gestión Escolar - {sessionContext.sesionUser || 'Administrador'}</p>
            <div className="flex items-center mt-2 space-x-4 text-sm">
              <span className="flex items-center"><FaClock className="mr-2" /> Última actualización: {lastUpdated || 'No disponible'}</span>
              <button onClick={loadDashboardData} disabled={loading} className="flex items-center bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors disabled:opacity-50">
                <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4 md:mt-0">
            <div className="text-center">
              <p className="text-sm opacity-90">Estado del Sistema</p>
              <div className="flex items-center justify-center mt-1">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse mr-2"></div>
                <p className="font-bold text-lg text-green-300">OPERATIVO</p>
              </div>
              <p className="text-xs opacity-75 mt-1">{stats.summary.totalUsers} usuarios registrados</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FaExchangeAlt className="text-blue-600" />
          <span className="text-sm text-blue-800 font-medium">Tasa BCV del día:</span>
        </div>
        {loadingRate ? (
          <div className="flex items-center space-x-1">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-blue-700 text-sm">Cargando...</span>
          </div>
        ) : bcvRate ? (
          <div className="text-right">
            <span className="text-lg font-bold text-blue-800">{bcvRate.PriceRateBCV.toFixed(2)} Bs/USD</span>
            <span className="text-xs text-blue-600 ml-2">{bcvRate.dtRate}</span>
          </div>
        ) : <span className="text-red-600 text-sm">No disponible</span>}
      </div>

      <div className="mb-8">
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm">
          <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <FaChartLine className="inline mr-2" /> Resumen General
          </button>
          <button onClick={() => setActiveTab('financial')} className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'financial' ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <FaMoneyCheck className="inline mr-2" /> Financiero
          </button>
          <button onClick={() => setActiveTab('academic')} className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'academic' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <FaSchool className="inline mr-2" /> Académico
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {mainStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-xl ${stat.color} text-white shadow-md`}><stat.icon size={24} /></div>
                  <div className="text-right">
                    <span className={`text-sm font-medium flex items-center ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                      {stat.trend === 'up' ? <FaArrowUp className="mr-1" /> : stat.trend === 'down' ? <FaArrowDown className="mr-1" /> : null}
                      {stat.change}
                    </span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-900 font-semibold">{stat.title}</p>
                <p className="text-gray-600 text-sm mt-1">{stat.description}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso</span><span>{stat.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-500 ${stat.trend === 'up' ? 'bg-green-500' : stat.trend === 'down' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(stat.percentage, 100)}%` }}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 mr-4"><FaChartPie size={24} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Distribución de Estudiantes</h3>
                  <p className="text-gray-600 text-sm">Estado de pago general</p>
                </div>
              </div>
              <DoughnutChart
                debtors={stats.chartData.debtors.length}
                creditors={stats.chartData.creditors.length}
                zero={stats.chartData.zeroBalance.length}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-600 mr-4"><FaUserGraduate size={24} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Estado de Estudiantes</h3>
                  <p className="text-gray-600 text-sm">Distribución por estado académico</p>
                </div>
              </div>
              <div className="space-y-4">
                {studentStatusData.map((status) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${status.color.split(' ')[0]}`}></div>
                      <span className="text-sm text-gray-700">{status.status}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">{status.count}</span>
                      <span className="text-xs text-gray-500">({calculatePercentage(status.count, stats.students.total)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-center"><div className="text-2xl font-bold text-gray-900">{stats.students.active}</div><div className="text-xs text-gray-500">Activos</div></div>
                  <div className="text-center"><div className="text-2xl font-bold text-gray-900">{stats.students.total - stats.students.active}</div><div className="text-xs text-gray-500">No activos</div></div>
                  <div className="text-center"><div className="text-2xl font-bold text-gray-900">{stats.students.total}</div><div className="text-xs text-gray-500">Total</div></div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 mr-4"><FaBalanceScale size={24} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Balance Financiero</h3>
                  <p className="text-gray-600 text-sm">Resumen de ingresos y deudas</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-green-700">Recaudado (Bs)</span><FaArrowUp className="text-green-600" /></div>
                  <p className="text-2xl font-bold text-green-800 mt-2">{formatCurrency(monthlyCollectedBs, 'VES')}</p>
                  <p className="text-sm text-green-600 mt-1">Este mes</p>
                  {bcvRate && <p className="text-sm text-green-700 mt-1 font-bold">≈ {formatCurrency(stats.financial.monthlyCollected, 'USD')}</p>}
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-red-700">Por Cobrar (Bs)</span><FaArrowDown className="text-red-600" /></div>
                  <p className="text-2xl font-bold text-red-800 mt-2">{formatCurrency(totalDebtBs, 'VES')}</p>
                  <p className="text-sm text-red-600 mt-1">Deuda total</p>
                  {bcvRate && <p className="text-sm text-red-700 mt-1 font-bold">≈ {formatCurrency(stats.financial.totalDebt, 'USD')}</p>}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-blue-700">Saldo a Favor (Bs)</span><FaArrowUp className="text-blue-600" /></div>
                  <p className="text-2xl font-bold text-blue-800 mt-2">{formatCurrency(totalCreditBs, 'VES')}</p>
                  <p className="text-sm text-blue-600 mt-1">Crédito disponible</p>
                  {bcvRate && <p className="text-sm text-blue-700 mt-1 font-bold">≈ {formatCurrency(stats.financial.totalCredit, 'USD')}</p>}
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-purple-700">Pendientes</span><FaExclamationTriangle className="text-purple-600" /></div>
                  <p className="text-2xl font-bold text-purple-800 mt-2">{stats.financial.pendingTransactions}</p>
                  <p className="text-sm text-purple-600 mt-1">Transacciones pendientes</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 mr-4"><FaUsers size={24} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Estado de Representantes</h3>
                  <p className="text-gray-600 text-sm">Distribución por estado de pago</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div><span className="font-medium text-green-800">Al día</span></div>
                    <span className="text-2xl font-bold text-green-900">{stats.representatives.total - stats.representatives.withDebt}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div><span className="font-medium text-red-800">Con deuda</span></div>
                    <span className="text-2xl font-bold text-red-900">{stats.representatives.withDebt}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div><span className="font-medium text-blue-800">Con saldo a favor</span></div>
                    <span className="text-2xl font-bold text-blue-900">{stats.representatives.withCredit}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div><div className="text-2xl font-bold text-green-600">{stats.representatives.paymentPercentage}%</div><div className="text-xs text-gray-500">Tasa de pago</div></div>
                  <div><div className="text-2xl font-bold text-red-600">{calculatePercentage(stats.representatives.withDebt, stats.representatives.total)}%</div><div className="text-xs text-gray-500">En mora</div></div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-red-100 to-orange-100 text-red-600 mr-4"><FaExclamationTriangle size={24} /></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Top Deudores</h3>
                    <p className="text-gray-600 text-sm">Estudiantes con mayor deuda</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-500">Total: {stats.chartData.debtors.length}</span>
              </div>
              {stats.topDebtors.length === 0 ? (
                <div className="text-center py-8">
                  <FaUserCheck className="text-green-400 text-4xl mx-auto mb-3" />
                  <p className="text-gray-600">No hay deudores registrados</p>
                  <p className="text-sm text-gray-400 mt-1">Todos los pagos están al día</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.topDebtors.map((debtor, index) => {
                    const debtBs = usdToBs(debtor.debtAmount);
                    return (
                      <div key={debtor.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold mr-3">{index + 1}</div>
                          <div>
                            <p className="font-medium text-gray-900">{debtor.fullName}</p>
                            <p className="text-sm text-gray-500">
                              {debtor.currentGrade || 'Sin grado'} {debtor.section ? `• ${debtor.section}` : ''} • {debtor.representativeName || '—'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{formatCurrency(debtBs, 'VES')}</p>
                          {bcvRate && <p className="text-sm text-red-700 font-bold">≈ {formatCurrency(debtor.debtAmount, 'USD')}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-600 mr-4"><FaUserCheck size={24} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Al día / Con crédito</h3>
                  <p className="text-gray-600 text-sm">Estudiantes solventes</p>
                </div>
              </div>
              {stats.chartData.creditors.length === 0 ? (
                <div className="text-center py-8">
                  <FaExclamationTriangle className="text-amber-400 text-4xl mx-auto mb-3" />
                  <p className="text-gray-600">Ningún estudiante con saldo a favor</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {stats.chartData.creditors.slice(0, 10).map((cred) => {
                    const creditBs = usdToBs(cred.creditAmountUSD || 0);
                    return (
                      <div key={cred.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">{cred.fullName}</p>
                          <p className="text-sm text-gray-500">
                            {cred.currentGrade || 'Sin grado'} {cred.section ? `• ${cred.section}` : ''} • {cred.representativeName || '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(creditBs, 'VES')}</p>
                          {bcvRate && <p className="text-sm text-green-700 font-bold">≈ {formatCurrency(cred.creditAmountUSD || 0, 'USD')}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}

      {activeTab === 'financial' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Panel Financiero Detallado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-medium text-green-700">Total Recaudado (Bs)</p>
                <p className="text-2xl font-bold text-green-800 mt-2">{formatCurrency(monthlyCollectedBs, 'VES')}</p>
                {bcvRate && <p className="text-sm text-green-700 mt-1 font-bold">≈ {formatCurrency(stats.financial.monthlyCollected, 'USD')}</p>}
                <p className="text-sm text-green-600 mt-1">Mes actual</p>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-medium text-red-700">Deuda Total (Bs)</p>
                <p className="text-2xl font-bold text-red-800 mt-2">{formatCurrency(totalDebtBs, 'VES')}</p>
                {bcvRate && <p className="text-sm text-red-700 mt-1 font-bold">≈ {formatCurrency(stats.financial.totalDebt, 'USD')}</p>}
                <p className="text-sm text-red-600 mt-1">Por cobrar</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-medium text-blue-700">Saldo a Favor (Bs)</p>
                <p className="text-2xl font-bold text-blue-800 mt-2">{formatCurrency(totalCreditBs, 'VES')}</p>
                {bcvRate && <p className="text-sm text-blue-700 mt-1 font-bold">≈ {formatCurrency(stats.financial.totalCredit, 'USD')}</p>}
                <p className="text-sm text-blue-600 mt-1">Crédito disponible</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                <p className="text-sm font-medium text-purple-700">Transacciones</p>
                <p className="text-2xl font-bold text-purple-800 mt-2">{stats.financial.pendingTransactions}</p>
                <p className="text-sm text-purple-600 mt-1">Pendientes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 mr-4"><FaUserGraduate size={24} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Listado de Estudiantes</h3>
                  <p className="text-gray-600 text-sm">Filtra por estado de pago</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
                  { key: 'debtors', label: `Deudores (${stats.chartData.debtors.length})`, color: 'bg-red-100 text-red-700 hover:bg-red-200' },
                  { key: 'creditors', label: `Al día (${stats.chartData.creditors.length})`, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                  { key: 'zero', label: `Sin saldo (${stats.chartData.zeroBalance.length})`, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
                ].map(btn => (
                  <button
                    key={btn.key}
                    onClick={() => setStudentFilter(btn.key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${studentFilter === btn.key ? 'bg-indigo-600 text-white shadow-md' : btn.color}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay estudiantes para este filtro.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sección</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Representante</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo (Bs)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo (USD)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map(s => {
                      const balance = s.balanceUSD || 0;
                      const stateLabel = balance < 0 ? 'Deudor' : balance > 0 ? 'Al día' : 'Sin saldo';
                      const stateColor = balance < 0 ? 'bg-red-100 text-red-800' : balance > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                      return (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.fullName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.currentGrade || 'Sin grado'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.section || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.representativeName || '—'}</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-800">{formatCurrency(usdToBs(balance), 'VES')}</td>
                          <td className="px-4 py-3 text-sm font-extrabold text-green-600">{formatCurrency(balance, 'USD')}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${stateColor}`}>{stateLabel}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 mr-4"><FaMoneyCheck size={24} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Transacciones por responsable</h3>
                  <p className="text-gray-600 text-sm">Pagos realizados por administradores o representantes</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: '', label: 'Todas', icon: <FaMoneyCheck className="text-xs" /> },
                  { key: 'admin', label: 'Admin', icon: <FaUserShield className="text-xs" /> },
                  { key: 'representative', label: 'Representante', icon: <FaUserTie className="text-xs" /> },
                  { key: 'system', label: 'Sistema', icon: <FaCog className="text-xs" /> },
                ].map(btn => (
                  <button
                    key={btn.key}
                    onClick={() => setTransactionRole(btn.key as any)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${transactionRole === btn.key ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {btn.icon}{btn.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingFilteredTx ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div></div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaMoneyCheck className="text-gray-400 text-4xl mx-auto mb-3" />
                <p className="text-gray-600">No hay transacciones para este filtro</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Representante</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto (Bs)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">USD</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((tx: any) => {
                      const creator = tx.creator;
                      const roleLabel = creator?.role === 'admin' ? 'Admin' : creator?.role === 'representative' ? 'Representante' : (tx.type === 'fee' || tx.type === 'adjustment') ? 'Sistema' : '—';
                      const RoleIcon = creator?.role === 'admin' ? FaUserShield : creator?.role === 'representative' ? FaUserTie : FaCog;
                      const roleColor = creator?.role === 'admin' ? 'text-blue-700' : creator?.role === 'representative' ? 'text-green-700' : 'text-gray-500';
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('es-VE') : '—'}</td>
                          <td className={`px-4 py-3 text-sm font-semibold ${roleColor} inline-flex items-center gap-1`}><RoleIcon className="text-xs" /> {roleLabel}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{tx.representative?.fullName || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{tx.student?.fullName || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-[250px] truncate">
                            {tx.description || '—'}
                            {tx.metadata?.isMoved && tx.metadata.movedFromStudentName && tx.metadata.movedToStudentName && (
                              <span className="block text-xs text-indigo-600 font-medium">
                                Movido: {tx.metadata.movedFromStudentName} → {tx.metadata.movedToStudentName}
                              </span>
                            )}
                          </td>
                          <td className={`px-4 py-3 text-sm font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount || 0, 'VES')}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-green-600">{tx.amountUSD !== undefined ? formatCurrency(tx.amountUSD, 'USD') : '—'}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(tx.type)}`}>{getTypeLabel(tx.type)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'academic' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Panel Académico</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4"><FaChalkboardTeacher size={20} /></div>
                  <div><p className="text-sm font-medium text-blue-700">Docentes</p><p className="text-2xl font-bold text-blue-800 mt-1">{stats.teachers.total}</p></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-blue-600">Activos</span><span className="font-medium">{stats.teachers.active}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-blue-600">Inactivos</span><span className="font-medium">{stats.teachers.inactive}</span></div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4"><FaUserGraduate size={20} /></div>
                  <div><p className="text-sm font-medium text-green-700">Estudiantes</p><p className="text-2xl font-bold text-green-800 mt-1">{stats.students.total}</p></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-green-600">Regulares</span><span className="font-medium">{stats.students.byStatus.regular}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-green-600">Pendientes</span><span className="font-medium">{stats.students.byStatus.pendiente}</span></div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4"><FaUsers size={20} /></div>
                  <div><p className="text-sm font-medium text-purple-700">Representantes</p><p className="text-2xl font-bold text-purple-800 mt-1">{stats.representatives.total}</p></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-purple-600">Al día</span><span className="font-medium">{stats.representatives.total - stats.representatives.withDebt}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-purple-600">Con deuda</span><span className="font-medium">{stats.representatives.withDebt}</span></div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Estudiantes por Estado</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {studentStatusData.map((status) => (
                  <div key={status.status} className={`${status.color} rounded-lg p-4 text-center`}>
                    <div className="text-2xl font-bold mb-1">{status.count}</div>
                    <div className="text-sm font-medium">{status.status}</div>
                    <div className="text-xs opacity-75 mt-1">{calculatePercentage(status.count, stats.students.total)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center text-gray-500 text-sm">
        <p>Sistema de Gestión Escolar v1.0 • Última actualización: {lastUpdated || 'No disponible'}</p>
        <p className="mt-1">{stats.summary.totalUsers} usuarios • {stats.teachers.total} docentes • {stats.students.total} estudiantes • {stats.representatives.total} representantes</p>
      </motion.div>
    </div>
  );
}