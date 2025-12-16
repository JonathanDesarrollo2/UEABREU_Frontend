// layouts/RepresDashboard.tsx
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {  
  FaBook, 
  FaChartLine, 
  FaMoneyCheck,
  FaClock,
  FaBell,
  FaFileInvoiceDollar,
  FaCreditCard,
  FaHistory,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaUserGraduate
} from 'react-icons/fa';

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

  // Datos de ejemplo
  const studentStats = [
    {
      title: "Cursos Inscritos",
      value: "8",
      icon: FaBook,
      color: "bg-gradient-to-r from-blue-700 to-blue-800",
      change: "Todos activos",
      description: "Cursos este semestre"
    },
    {
      title: "Asistencia",
      value: "95%",
      icon: FaChartLine,
      color: "bg-gradient-to-r from-green-600 to-green-700",
      change: "+2% vs mes pasado",
      description: "Porcentaje de asistencia"
    },
    {
      title: "Tareas Pendientes",
      value: "3",
      icon: FaClock,
      color: "bg-gradient-to-r from-orange-600 to-orange-700",
      change: "2 próximas 24h",
      description: "Tareas por entregar"
    },
    {
      title: "Estado de Pagos",
      value: sessionContext.studentInfo?.status ? "Al día" : "Pendiente",
      icon: FaMoneyCheck,
      color: sessionContext.studentInfo?.status 
        ? "bg-gradient-to-r from-green-600 to-green-700" 
        : "bg-gradient-to-r from-blue-700 to-blue-800",
      change: sessionContext.studentInfo?.status ? "Al corriente" : "Vencido",
      description: "Estado de cuenta"
    }
  ];

  const upcomingEvents = [
    { id: 1, name: "Examen de Matemáticas", date: "2024-01-15", type: "exam" },
    { id: 2, name: "Excursión Cultural", date: "2024-01-20", type: "activity" },
    { id: 3, name: "Entrega Proyecto Ciencias", date: "2024-01-25", type: "project" },
    { id: 4, name: "Pago Mensualidad", date: "2024-01-30", type: "payment" }
  ];

  const recentGrades = [
    { course: "Matemáticas", grade: "9.5/10", date: "2024-01-10" },
    { course: "Historia", grade: "8.0/10", date: "2024-01-08" },
    { course: "Ciencias Naturales", grade: "10/10", date: "2024-01-05" },
    { course: "Inglés", grade: "9.0/10", date: "2024-01-03" }
  ];

  const paymentStatus = {
    current: sessionContext.studentInfo?.status,
    dueDate: "2024-01-30",
    amount: "$150.00",
    pending: sessionContext.studentInfo?.status ? 0 : 1
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam': return '🔄';
      case 'activity': return '🎯';
      case 'project': return '📋';
      case 'payment': return '💳';
      default: return '📅';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'exam': return 'text-red-600 bg-red-50 border-red-200';
      case 'activity': return 'text-green-600 bg-green-50 border-green-200';
      case 'project': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'payment': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

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
                ¡Bienvenido, {sessionContext.sesionUser}!
              </h1>
              <p className="text-blue-200 text-lg">
                {sessionContext.studentInfo?.name 
                  ? `Seguimiento de ${sessionContext.studentInfo.name}`
                  : 'Seguimiento estudiantil'
                }
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 border-2 border-white/30">
            <p className="text-sm font-medium">Estado de Cuenta</p>
            <p className={`text-lg font-bold ${paymentStatus.current ? 'text-green-300' : 'text-blue-300'}`}>
              {paymentStatus.current ? 'AL DÍA' : 'PENDIENTE'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {studentStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-xl ${stat.color} text-white shadow-md`}>
                <stat.icon size={20} />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-900 font-semibold text-lg">{stat.title}</p>
            <p className="text-gray-600 text-sm mt-2">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Próximos Eventos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Próximos Eventos</h3>
            <span className="text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
              4 eventos
            </span>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-300">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${getEventColor(event.type)} border-2`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div>
                    <span className="text-gray-900 font-semibold block">{event.name}</span>
                    <span className="text-sm text-gray-500">{event.date}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.type === 'exam' ? 'bg-red-100 text-red-800' :
                  event.type === 'activity' ? 'bg-green-100 text-green-800' :
                  event.type === 'project' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {event.type === 'exam' ? 'Examen' :
                   event.type === 'activity' ? 'Actividad' :
                   event.type === 'project' ? 'Proyecto' : 'Pago'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Calificaciones Recientes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Calificaciones Recientes</h3>
            <span className="text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
              Promedio: 9.1
            </span>
          </div>
          <div className="space-y-4">
            {recentGrades.map((grade, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl flex items-center justify-center text-white font-bold">
                    {parseFloat(grade.grade).toFixed(1)}
                  </div>
                  <span className="text-gray-900 font-semibold text-lg">{grade.course}</span>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    parseFloat(grade.grade) >= 9 ? 'text-green-700' :
                    parseFloat(grade.grade) >= 7 ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {grade.grade}
                  </p>
                  <p className="text-sm text-gray-500">{grade.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sección de Pagos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <h3 className="text-xl font-bold text-gray-900">Estado de Pagos</h3>
          <div className="flex space-x-3">
            <button className="bg-gradient-to-r from-blue-700 to-blue-800 text-white px-5 py-3 rounded-xl hover:from-blue-800 hover:to-blue-900 transition-all duration-200 shadow-md hover:shadow-lg flex items-center font-semibold">
              <FaCreditCard className="mr-3" />
              Pagar Ahora
            </button>
            <button className="border border-gray-300 text-gray-700 px-5 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center font-semibold hover:border-blue-700">
              <FaHistory className="mr-3" />
              Historial
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-5 rounded-xl border-2 ${
            paymentStatus.current ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Estado</span>
              {paymentStatus.current ? 
                <FaCheckCircle className="text-green-600 text-lg" /> : 
                <FaTimesCircle className="text-blue-600 text-lg" />
              }
            </div>
            <p className={`text-xl font-bold ${
              paymentStatus.current ? 'text-green-800' : 'text-blue-800'
            }`}>
              {paymentStatus.current ? 'Al Día' : 'Pendiente'}
            </p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 p-5 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Próximo Vencimiento</span>
            <p className="text-xl font-bold text-blue-800 mt-2">{paymentStatus.dueDate}</p>
          </div>

          <div className="bg-purple-50 border-2 border-purple-300 p-5 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Monto Pendiente</span>
            <p className="text-xl font-bold text-purple-800 mt-2">{paymentStatus.amount}</p>
          </div>

          <div className="bg-orange-50 border-2 border-orange-300 p-5 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Pagos Pendientes</span>
            <p className="text-xl font-bold text-orange-800 mt-2">{paymentStatus.pending}</p>
          </div>
        </div>

        {!paymentStatus.current && (
          <div className="p-5 bg-blue-50 border-2 border-blue-300 rounded-xl">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-blue-600 text-xl mr-4" />
              <div>
                <p className="font-bold text-blue-800 text-lg">Pago Pendiente</p>
                <p className="text-blue-700 mt-1">
                  Tienes un pago pendiente. Realiza el pago antes del {paymentStatus.dueDate} para evitar recargos.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Acciones Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-700 hover:bg-blue-50 transition-all duration-300 group hover:shadow-md">
            <FaFileInvoiceDollar className="text-gray-400 group-hover:text-blue-700 mx-auto mb-3 text-xl" />
            <p className="text-sm font-semibold text-gray-600 group-hover:text-blue-800 text-center">Pagos</p>
          </button>
          <button className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-700 hover:bg-green-50 transition-all duration-300 group hover:shadow-md">
            <FaChartLine className="text-gray-400 group-hover:text-green-700 mx-auto mb-3 text-xl" />
            <p className="text-sm font-semibold text-gray-600 group-hover:text-green-800 text-center">Calificaciones</p>
          </button>
          <button className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-700 hover:bg-orange-50 transition-all duration-300 group hover:shadow-md">
            <FaClock className="text-gray-400 group-hover:text-orange-700 mx-auto mb-3 text-xl" />
            <p className="text-sm font-semibold text-gray-600 group-hover:text-orange-800 text-center">Horario</p>
          </button>
          <button className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-700 hover:bg-purple-50 transition-all duration-300 group hover:shadow-md">
            <FaBell className="text-gray-400 group-hover:text-purple-700 mx-auto mb-3 text-xl" />
            <p className="text-sm font-semibold text-gray-600 group-hover:text-purple-800 text-center">Notificaciones</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}