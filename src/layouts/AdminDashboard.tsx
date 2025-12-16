// layouts/AdminDashboard.tsx
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaUserGraduate, 
  FaChalkboardTeacher,
  FaMoneyCheck,
  FaChartLine,
  FaSchool,
  FaFileInvoiceDollar
} from 'react-icons/fa';

interface SessionContext {
  sesionUser?: string;
  sesionEmail?: string;
  userStatus?: boolean;
  nivel?: number;
}

export default function AdminDashboard() {
  const sessionContext = useOutletContext<SessionContext>();

  const adminStats = [
    {
      title: "Total Estudiantes",
      value: "1,245",
      icon: FaUserGraduate,
      color: "bg-blue-500",
      change: "+45 este mes",
      description: "Estudiantes activos"
    },
    {
      title: "Docentes",
      value: "68",
      icon: FaChalkboardTeacher,
      color: "bg-green-500",
      change: "3 nuevos",
      description: "Profesores activos"
    },
    {
      title: "Pagos del Mes",
      value: "92%",
      icon: FaMoneyCheck,
      color: "bg-green-500",
      change: "+5% vs mes pasado",
      description: "Pagos realizados"
    },
    {
      title: "Ingresos",
      value: "$45,230",
      icon: FaChartLine,
      color: "bg-purple-500",
      change: "+12% vs mes pasado",
      description: "Ingresos mensuales"
    }
  ];

  const paymentOverview = {
    total: "$156,800",
    collected: "$144,256",
    pending: "$12,544",
    percentage: 92
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-8 shadow-lg"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              ¡Bienvenido, Admin {sessionContext.sesionUser}!
            </h1>
            <p className="text-indigo-100">
              Panel de control administrativo
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-sm">Estado del Sistema</p>
            <p className="font-bold text-green-300">ACTIVO</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <p className="text-xs">Todos los servicios operativos</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {adminStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <stat.icon size={24} />
              </div>
              <span className="text-sm text-gray-500">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-900 font-medium">{stat.title}</p>
            <p className="text-gray-600 text-sm">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Resumen de Pagos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumen de Pagos - Este Mes</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <span className="text-sm font-medium">Total Esperado</span>
            <p className="text-2xl font-bold text-blue-700 mt-2">
              {paymentOverview.total}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <span className="text-sm font-medium">Recaudado</span>
            <p className="text-2xl font-bold text-green-700 mt-2">
              {paymentOverview.collected}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <span className="text-sm font-medium">Pendiente</span>
            <p className="text-2xl font-bold text-orange-700 mt-2">
              {paymentOverview.pending}
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <span className="text-sm font-medium">Porcentaje</span>
            <p className="text-2xl font-bold text-purple-700 mt-2">
              {paymentOverview.percentage}%
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="h-4 rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${paymentOverview.percentage}%` }}
          ></div>
        </div>
      </motion.div>

      {/* Acciones Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
            <FaUsers className="text-gray-400 group-hover:text-blue-600 mx-auto mb-2" size={24} />
            <p className="text-sm font-medium text-gray-600 group-hover:text-blue-700">Estudiantes</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group">
            <FaChalkboardTeacher className="text-gray-400 group-hover:text-green-600 mx-auto mb-2" size={24} />
            <p className="text-sm font-medium text-gray-600 group-hover:text-green-700">Docentes</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group">
            <FaFileInvoiceDollar className="text-gray-400 group-hover:text-purple-600 mx-auto mb-2" size={24} />
            <p className="text-sm font-medium text-gray-600 group-hover:text-purple-700">Pagos</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group">
            <FaSchool className="text-gray-400 group-hover:text-orange-600 mx-auto mb-2" size={24} />
            <p className="text-sm font-medium text-gray-600 group-hover:text-orange-700">Cursos</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}