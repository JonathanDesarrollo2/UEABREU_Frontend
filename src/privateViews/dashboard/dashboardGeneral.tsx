import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUserGraduate, 
  FaBook, 
  FaChartLine, 
  FaCalendarAlt,
  FaBell,
  FaCog,
  FaPiggyBank,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getBankWelcomeAPI} from '../../apis/bank'; 
import type {BankWelcomeResponse} from '../../apis/bank'; 
// Tipo para el contexto de sesión
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

// Tipo para el estado del mensaje del banco
interface BankWelcomeState {
  data: BankWelcomeResponse | null;
  loading: boolean;
  error: string | null;
}

export default function Dashboard() {
  const sessionContext = useOutletContext<SessionContext>();
  const [bankWelcome, setBankWelcome] = useState<BankWelcomeState>({
    data: null,
    loading: false,
    error: null
  });

  // Cargar mensaje de bienvenida del banco
  useEffect(() => {
    const loadBankWelcome = async () => {
      setBankWelcome(prev => ({ ...prev, loading: true, error: null }));
      try {
        const response = await getBankWelcomeAPI();
        if (response.result && response.content) {
          setBankWelcome({
            data: response.content,
            loading: false,
            error: null
          });
        } else {
          setBankWelcome({
            data: null,
            loading: false,
            error: response.error?.[0] || 'Error al cargar mensaje del banco'
          });
        }
      } catch (error: any) {
        setBankWelcome({
          data: null,
          loading: false,
          error: error.message || 'Error de conexión con el banco'
        });
      }
    };

    loadBankWelcome();
  }, []);

  // Datos de ejemplo para las tarjetas
  const statsCards = [
    {
      title: "Cursos Activos",
      value: "5",
      icon: FaBook,
      color: "bg-blue-500",
      change: "+2 este mes"
    },
    {
      title: "Asistencias",
      value: "95%",
      icon: FaChartLine,
      color: "bg-green-500",
      change: "+5% vs mes pasado"
    },
    {
      title: "Tareas Pendientes",
      value: "3",
      icon: FaCalendarAlt,
      color: "bg-orange-500",
      change: "2 próximas 24h"
    },
    {
      title: "Notificaciones",
      value: "7",
      icon: FaBell,
      color: "bg-purple-500",
      change: "3 sin leer"
    }
  ];

  // Actividades recientes
  const recentActivities = [
    { id: 1, action: "Completó tarea de Matemáticas", time: "Hace 2 horas", type: "success" },
    { id: 2, action: "Nueva tarea: Ciencias Naturales", time: "Hace 5 horas", type: "assignment" },
    { id: 3, action: "Calificación: Historia 9.5/10", time: "Ayer", type: "grade" },
    { id: 4, action: "Mensaje del profesor", time: "Ayer", type: "message" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Bienvenido de vuelta</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <FaBell size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <FaCog size={20} />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                  {sessionContext.sesionUser?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{sessionContext.sesionUser || 'Usuario'}</p>
                  <p className="text-sm text-gray-500">{sessionContext.nivel === 1 ? 'Estudiante' : 'Profesor'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white mb-8 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                ¡Hola, {sessionContext.sesionUser || 'Estudiante'}!
              </h2>
              <p className="text-emerald-100">
                {sessionContext.studentInfo?.name 
                  ? `Bienvenido ${sessionContext.studentInfo.name}`
                  : 'Es un buen día para aprender algo nuevo'
                }
              </p>
              <p className="text-emerald-100 text-sm mt-2">
                {sessionContext.sesionEmail}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-sm">EstadoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA</p>
                <p className="font-bold">
                  {sessionContext.userStatus ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color} text-white`}>
                  <card.icon size={24} />
                </div>
                <span className="text-sm text-gray-500">{card.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
              <p className="text-gray-600">{card.title}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
              <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                Ver todo
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'assignment' ? 'bg-blue-500' :
                    activity.type === 'grade' ? 'bg-yellow-500' : 'bg-purple-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                <FaBook className="text-gray-400 group-hover:text-emerald-600 mx-auto mb-2" size={24} />
                <p className="text-sm font-medium text-gray-600 group-hover:text-emerald-700">Mis Cursos</p>
              </button>
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <FaCalendarAlt className="text-gray-400 group-hover:text-blue-600 mx-auto mb-2" size={24} />
                <p className="text-sm font-medium text-gray-600 group-hover:text-blue-700">Calendario</p>
              </button>
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group">
                <FaChartLine className="text-gray-400 group-hover:text-orange-600 mx-auto mb-2" size={24} />
                <p className="text-sm font-medium text-gray-600 group-hover:text-orange-700">Progreso</p>
              </button>
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group">
                <FaUserGraduate className="text-gray-400 group-hover:text-purple-600 mx-auto mb-2" size={24} />
                <p className="text-sm font-medium text-gray-600 group-hover:text-purple-700">Perfil</p>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Próximos Eventos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-900">Examen de Matemáticas</span>
              </div>
              <span className="text-sm text-gray-500">Mañana, 10:00 AM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-900">Entrega Proyecto Ciencias</span>
              </div>
              <span className="text-sm text-gray-500">Viernes, 3:00 PM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-900">Reunión de Padres</span>
              </div>
              <span className="text-sm text-gray-500">Lunes, 2:00 PM</span>
            </div>
          </div>
        </motion.div>

        {/* Bank Welcome Message - NUEVA SECCIÓN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mt-8 shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <FaPiggyBank className="mr-3" size={24} />
                <h3 className="text-xl font-bold">Banco Nacional de Crédito</h3>
              </div>
              
              {bankWelcome.loading && (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <p className="text-blue-100">Cargando mensaje del banco...</p>
                </div>
              )}

              {bankWelcome.error && (
                <div className="flex items-start space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <FaExclamationTriangle className="text-yellow-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">No se pudo conectar con el banco</p>
                    <p className="text-blue-100 text-sm mt-1">{bankWelcome.error}</p>
                  </div>
                </div>
              )}

              {bankWelcome.data && (
                <div className="space-y-3">
                  <p className="text-blue-100 text-lg leading-relaxed">
                    {bankWelcome.data.message}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-blue-200">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="font-medium">Servicio:</span> {bankWelcome.data.service}
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="font-medium">Versión:</span> {bankWelcome.data.version}
                    </div>
                    {bankWelcome.data.timestamp && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="font-medium">Actualizado:</span> {new Date(bankWelcome.data.timestamp).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="ml-6 flex-shrink-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <p className="text-sm opacity-90">Estado del Sistema</p>
                <p className="font-bold text-lg mt-1">
                  {bankWelcome.loading ? 'Conectando...' : 
                   bankWelcome.error ? 'Sin Conexión' : 
                   'Conectado'}
                </p>
                <div className={`w-3 h-3 rounded-full mx-auto mt-2 ${
                  bankWelcome.loading ? 'bg-yellow-400' : 
                  bankWelcome.error ? 'bg-red-400' : 
                  'bg-green-400'
                }`} />
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}