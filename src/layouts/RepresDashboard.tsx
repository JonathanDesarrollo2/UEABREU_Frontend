import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {  
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
  FaUserGraduate
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getChildrenSchedulesAPI } from '../apis/schedule';

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

// Datos de ejemplo de deuda (más adelante se obtendrán de la API)
const mockDebt = {
  totalDebt: 150.00,
  dueDate: '2024-01-30',
  isOverdue: false,
  childrenCount: 2
};

export default function RepresDashboard() {
  const sessionContext = useOutletContext<SessionContext>();
  const navigate = useNavigate();
  const [childrenCount, setChildrenCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener número de hijos (opcional, solo para mostrar)
    const fetchChildren = async () => {
      try {
        const data = await getChildrenSchedulesAPI();
        if (data.result) {
          setChildrenCount(data.content.length);
        }
      } catch (error) {
        console.error('Error fetching children count', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

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
                Panel de Representante
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 border-2 border-white/30">
            <p className="text-sm font-medium">Hijos registrados</p>
            <p className="text-lg font-bold text-blue-200">
              {loading ? '...' : childrenCount}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tarjeta de Deuda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="p-4 bg-red-100 rounded-xl">
              <FaMoneyBillWave className="text-red-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Estado de Deuda</h3>
              <p className="text-gray-600">Monto pendiente</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-4xl font-bold text-red-600">${mockDebt.totalDebt.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">
              Vence: {mockDebt.dueDate} • {mockDebt.isOverdue ? 'Vencido' : 'Próximo'}
            </p>
          </div>
        </div>
        {mockDebt.totalDebt > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-600 text-xl mr-4 flex-shrink-0" />
              <p className="text-red-800">
                Tienes una deuda pendiente. Por favor regulariza tu situación para evitar recargos.
              </p>
            </div>
          </div>
        )}
        {mockDebt.totalDebt === 0 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-600 text-xl mr-4 flex-shrink-0" />
              <p className="text-green-800">
                No tienes deudas pendientes. ¡Todo al día!
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Botón para ver horarios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Acceso Rápido</h3>
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
      </motion.div>
    </div>
  );
}