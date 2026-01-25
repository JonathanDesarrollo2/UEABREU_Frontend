// layouts/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaUserGraduate, 
  FaChalkboardTeacher,
  FaMoneyCheck,
  FaChartLine,
  FaSchool,
  FaExclamationTriangle,
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaPercentage,
  FaDollarSign,
  FaUserCheck,
  FaClock,
  FaBalanceScale
} from 'react-icons/fa';
import { getDashboardStatsAPI, type DashboardStats } from '../apis/dashboard';

interface SessionContext {
  sesionUser?: string;
  sesionEmail?: string;
  userStatus?: boolean;
  nivel?: number;
}

export default function AdminDashboard() {
  const sessionContext = useOutletContext<SessionContext>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'academic'>('overview');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStatsAPI();
      setStats(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Actualizar cada 5 minutos
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Función para calcular porcentaje
  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">Cargando dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Obteniendo datos en tiempo real</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl">
          <p className="font-bold">Error al cargar el dashboard</p>
          <p>No se pudieron obtener los datos del sistema.</p>
          <button 
            onClick={loadDashboardData}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <FaSync className="mr-2" /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Estadísticas principales
  const mainStats = [
    {
      title: "Docentes Activos",
      value: stats.teachers.active.toString(),
      change: `${stats.teachers.total} total`,
      icon: FaChalkboardTeacher,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      trend: "up",
      description: "Personal docente activo",
      percentage: calculatePercentage(stats.teachers.active, stats.teachers.total)
    },
    {
      title: "Estudiantes Regulares",
      value: stats.students.active.toString(),
      change: `${stats.students.total} total`,
      icon: FaUserGraduate,
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      trend: "up",
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
      title: "Recaudado",
      value: formatCurrency(stats.financial.monthlyCollected),
      change: `${formatCurrency(stats.financial.totalDebt)} por cobrar`,
      icon: FaDollarSign,
      color: "bg-gradient-to-r from-orange-500 to-yellow-500",
      trend: stats.financial.totalDebt === 0 ? "up" : "down",
      description: "Este mes",
      percentage: stats.financial.totalDebt > 0 ? 
        Math.round((stats.financial.monthlyCollected / stats.financial.totalDebt) * 100) : 100
    }
  ];

  // Datos de estudiantes por estado
  const studentStatusData = [
    { status: 'Regular', count: stats.students.byStatus.regular, color: 'bg-green-100 text-green-800' },
    { status: 'Pendiente', count: stats.students.byStatus.pendiente, color: 'bg-yellow-100 text-yellow-800' },
    { status: 'Repitiente', count: stats.students.byStatus.repitiente, color: 'bg-orange-100 text-orange-800' },
    { status: 'Condicionado', count: stats.students.byStatus.condicionado, color: 'bg-red-100 text-red-800' },
    { status: 'Inactivo', count: stats.students.byStatus.inactivo, color: 'bg-gray-100 text-gray-800' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-8 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-indigo-200">
              Sistema de Gestión Escolar - {sessionContext.sesionUser || 'Administrador'}
            </p>
            <div className="flex items-center mt-2 space-x-4 text-sm">
              <span className="flex items-center">
                <FaClock className="mr-2" />
                Última actualización: {lastUpdated}
              </span>
              <button 
                onClick={loadDashboardData}
                disabled={loading}
                className="flex items-center bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
              >
                <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
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
              <p className="text-xs opacity-75 mt-1">
                {stats.summary.totalUsers} usuarios activos
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs de Navegación */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaChartLine className="inline mr-2" />
            Resumen General
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'financial'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaMoneyCheck className="inline mr-2" />
            Financiero
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'academic'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaSchool className="inline mr-2" />
            Académico
          </button>
        </div>
      </div>

      {/* Contenido de Tabs */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
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
                  <div className={`p-3 rounded-xl ${stat.color} text-white shadow-md`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium flex items-center ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                      {stat.change}
                    </span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-900 font-semibold">{stat.title}</p>
                <p className="text-gray-600 text-sm mt-1">{stat.description}</p>
                {/* Barra de progreso */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso</span>
                    <span>{stat.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        stat.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sección de Balance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Balance Total */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 lg:col-span-2"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 mr-4">
                  <FaBalanceScale size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Balance Financiero</h3>
                  <p className="text-gray-600 text-sm">Resumen de ingresos y deudas</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700">Recaudado</span>
                    <FaArrowUp className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-800 mt-2">
                    {formatCurrency(stats.financial.monthlyCollected)}
                  </p>
                  <p className="text-sm text-green-600 mt-1">Este mes</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-700">Por Cobrar</span>
                    <FaArrowDown className="text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-800 mt-2">
                    {formatCurrency(stats.financial.totalDebt)}
                  </p>
                  <p className="text-sm text-red-600 mt-1">Deuda total</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">Saldo a Favor</span>
                    <FaArrowUp className="text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-800 mt-2">
                    {formatCurrency(stats.financial.totalCredit)}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">Crédito disponible</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-700">Por Cobrar</span>
                    <FaExclamationTriangle className="text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-800 mt-2">
                    {stats.financial.pendingTransactions}
                  </p>
                  <p className="text-sm text-purple-600 mt-1">Transacciones pendientes</p>
                </div>
              </div>

              {/* Progreso de recaudación */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso de recaudación mensual</span>
                  <span>{calculatePercentage(stats.financial.monthlyCollected, stats.financial.totalDebt + stats.financial.monthlyCollected)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-700"
                    style={{ 
                      width: `${calculatePercentage(stats.financial.monthlyCollected, stats.financial.totalDebt + stats.financial.monthlyCollected)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </motion.div>

            {/* Estado de Estudiantes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-600 mr-4">
                  <FaUserGraduate size={24} />
                </div>
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
                      <span className="text-xs text-gray-500">
                        ({calculatePercentage(status.count, stats.students.total)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gráfico de pastel simple */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.students.active}</div>
                    <div className="text-xs text-gray-500">Activos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.students.total - stats.students.active}</div>
                    <div className="text-xs text-gray-500">No activos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.students.total}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Top Deudores y Representantes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Deudores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-red-100 to-orange-100 text-red-600 mr-4">
                    <FaExclamationTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Top Deudores</h3>
                    <p className="text-gray-600 text-sm">Representantes con mayor deuda</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Total: {stats.representatives.withDebt}
                </span>
              </div>

              {stats.topDebtors.length === 0 ? (
                <div className="text-center py-8">
                  <FaUserCheck className="text-green-400 text-4xl mx-auto mb-3" />
                  <p className="text-gray-600">No hay deudores registrados</p>
                  <p className="text-sm text-gray-400 mt-1">Todos los pagos están al día</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.topDebtors.map((debtor, index) => (
                    <div key={debtor.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{debtor.fullName}</p>
                          <p className="text-sm text-gray-500">{debtor.identityCard}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{formatCurrency(debtor.debtAmount)}</p>
                        <p className="text-sm text-gray-500">{debtor.studentCount} estudiante(s)</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Estado de Representantes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 mr-4">
                    <FaUsers size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Estado de Representantes</h3>
                    <p className="text-gray-600 text-sm">Distribución por estado de pago</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Total: {stats.representatives.total}
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                      <span className="font-medium text-green-800">Al día</span>
                    </div>
                    <span className="text-2xl font-bold text-green-900">
                      {stats.representatives.total - stats.representatives.withDebt}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-green-500 transition-all duration-700"
                      style={{ 
                        width: `${calculatePercentage(stats.representatives.total - stats.representatives.withDebt, stats.representatives.total)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                      <span className="font-medium text-red-800">Con deuda</span>
                    </div>
                    <span className="text-2xl font-bold text-red-900">
                      {stats.representatives.withDebt}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-red-500 transition-all duration-700"
                      style={{ 
                        width: `${calculatePercentage(stats.representatives.withDebt, stats.representatives.total)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                      <span className="font-medium text-blue-800">Con saldo a favor</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">
                      {stats.representatives.withCredit}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500 transition-all duration-700"
                      style={{ 
                        width: `${calculatePercentage(stats.representatives.withCredit, stats.representatives.total)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Resumen */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.representatives.paymentPercentage}%</div>
                    <div className="text-xs text-gray-500">Tasa de pago</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {calculatePercentage(stats.representatives.withDebt, stats.representatives.total)}%
                    </div>
                    <div className="text-xs text-gray-500">En mora</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {activeTab === 'financial' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Panel Financiero Detallado</h2>
          {/* Agregar más detalles financieros aquí */}
          <p className="text-gray-600 text-center py-8">
            Panel financiero detallado - En desarrollo
          </p>
        </motion.div>
      )}

      {activeTab === 'academic' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Panel Académico</h2>
          <p className="text-gray-600 text-center py-8">
            Panel académico detallado - En desarrollo
          </p>
        </motion.div>
      )}

      {/* Footer informativo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 text-center text-gray-500 text-sm"
      >
        <p>Sistema de Gestión Escolar v1.0 • Última actualización: {lastUpdated}</p>
        <p className="mt-1">
          {stats.summary.totalUsers} usuarios • {stats.teachers.total} docentes • {stats.students.total} estudiantes
        </p>
      </motion.div>
    </div>
  );
}