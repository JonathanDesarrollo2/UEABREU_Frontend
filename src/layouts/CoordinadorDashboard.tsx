import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUserGraduate, FaUsers, FaBook, FaChalkboardTeacher,
  FaCalendarAlt, FaFileAlt,
} from 'react-icons/fa';

interface SessionContext {
  sesionUser?: string;
  sesionEmail?: string;
  nivel?: number;
}

const cards = [
  { title: 'Estudiantes',     desc: 'Ver listado completo de estudiantes',    icon: FaUserGraduate,      route: '/coordinador/students/list',  color: 'from-green-500 to-emerald-500' },
  { title: 'Usuarios',        desc: 'Ver listado de usuarios del sistema',    icon: FaUsers,             route: '/coordinador/users/list',     color: 'from-blue-500 to-cyan-500' },
  { title: 'Materias',        desc: 'Ver todas las materias',                 icon: FaBook,              route: '/coordinador/ListSubjects',   color: 'from-purple-500 to-pink-500' },
  { title: 'Docentes',        desc: 'Ver todos los docentes',                 icon: FaChalkboardTeacher, route: '/coordinador/teachers/list',  color: 'from-orange-500 to-yellow-500' },
  { title: 'Horarios',        desc: 'Ver horarios por grado y sección',       icon: FaCalendarAlt,       route: '/coordinador/Schedule',       color: 'from-indigo-500 to-blue-500' },
  { title: 'Solicitudes',     desc: 'Ver solicitudes de inscripción',         icon: FaFileAlt,           route: '/coordinador/registrations',  color: 'from-teal-500 to-green-500' },
];

export default function CoordinadorDashboard() {
  const ctx = useOutletContext<SessionContext>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white mb-8 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Panel de Coordinación de Evaluación</h1>
            <p className="text-purple-100">Bienvenido, {ctx?.sesionUser || 'Coordinador'}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
            <p className="text-sm opacity-90">Modo</p>
            <p className="font-bold text-lg">SOLO LECTURA</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <motion.button
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(c.route)}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all text-left"
          >
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${c.color} text-white shadow-md mb-4`}>
              <c.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{c.title}</h3>
            <p className="text-gray-600 text-sm">{c.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
