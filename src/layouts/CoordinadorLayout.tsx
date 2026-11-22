// src/layouts/CoordinadorLayout.tsx
import { Outlet, useOutletContext, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  FaChartLine,
  FaUserGraduate,
  FaUsers,
  FaBook,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaFileAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
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

export default function CoordinadorLayout() {
  const sessionContext = useOutletContext<SessionContext>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('tokcattleraising_inCattleRanchCloud');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: FaChartLine, path: '/coordinador' },
    { name: 'Estudiantes', icon: FaUserGraduate, path: '/coordinador/students/list' },
    { name: 'Usuarios', icon: FaUsers, path: '/coordinador/users/list' },
    { name: 'Materias', icon: FaBook, path: '/coordinador/ListSubjects' },
    { name: 'Docentes', icon: FaChalkboardTeacher, path: '/coordinador/teachers/list' },
    { name: 'Horarios', icon: FaCalendarAlt, path: '/coordinador/Schedule' },
    { name: 'Solicitudes', icon: FaFileAlt, path: '/coordinador/registrations' },
  ];

  const linkClass = 'group flex items-center px-5 py-4 text-base font-semibold rounded-lg text-gray-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white transition-all duration-200';
  const iconClass = 'mr-4 h-6 w-6 text-gray-400 group-hover:text-white';

  const renderMenu = (onNavigate?: () => void) => (
    <>
      {menuItems.map((item) => (
        <Link key={item.name} to={item.path} onClick={onNavigate} className={linkClass}>
          <item.icon className={iconClass} />
          {item.name}
        </Link>
      ))}
      <button type="button" onClick={handleLogout} className={`${linkClass} w-full text-left`}>
        <FaSignOutAlt className={iconClass} />
        Cerrar sesión
      </button>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black opacity-70" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800 shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-12 w-12 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-400 bg-gray-700 hover:bg-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes className="h-6 w-6 text-gray-300" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-5 pb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-xl">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="ml-4">
                <span className="text-white text-lg font-bold block">U.E. José</span>
                <span className="text-purple-400 text-base font-bold block">Antonio Abreu</span>
                <span className="text-gray-400 text-xs font-medium block -mt-1">NAGUANAGUA</span>
              </div>
            </div>

            {sessionContext.sesionUser && (
              <div className="px-5 py-4 bg-gray-700 mx-3 mt-4 rounded-lg">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Coordinador de Evaluación</p>
                <p className="text-white font-bold text-lg mt-1">{sessionContext.sesionUser}</p>
              </div>
            )}

            <nav className="mt-6 px-3 space-y-2">
              {renderMenu(() => setSidebarOpen(false))}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72 bg-gray-800 shadow-sm">
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <div className="flex items-center px-6 pb-6">
              <div className="flex items-center justify-center w-24 h-24 rounded-xl">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="ml-4">
                <span className="text-white text-xl font-bold block">U.E. José</span>
                <span className="text-purple-400 text-lg font-bold block">Antonio Abreu</span>
                <span className="text-gray-400 text-sm font-medium block -mt-1">NAGUANAGUA</span>
              </div>
            </div>

            {sessionContext.sesionUser && (
              <div className="px-5 py-5 bg-gray-700 mx-4 mt-4 rounded-xl">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Coordinador de Evaluación</p>
                <p className="text-white font-bold text-lg mt-2">{sessionContext.sesionUser}</p>
              </div>
            )}

            <nav className="mt-6 flex-1 px-4 space-y-3">
              {renderMenu()}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-gray-100 px-5 py-4 shadow-sm">
            <div className="flex items-center">
              <button
                className="inline-flex items-center justify-center rounded-lg p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 focus:outline-none shadow-sm"
                onClick={() => setSidebarOpen(true)}
              >
                <FaBars className="h-6 w-6" />
              </button>
              <div className="ml-4">
                <span className="text-gray-800 font-bold text-base">U.E. José Antonio Abreu</span>
                <span className="text-purple-600 text-sm font-bold block">NAGUANAGUA</span>
              </div>
              <span className="ml-3 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                SOLO LECTURA
              </span>
            </div>
          </div>
        </div>

        <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-sm">
          <div className="flex justify-between items-center px-7 py-5">
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-white">Panel de Coordinación de Evaluación</h1>
              <p className="text-purple-100 text-base mt-2 font-medium">Consulta y exportación de información</p>
            </div>

            <div className="flex items-center space-x-5">
              <span className="px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-bold border border-amber-300 shadow-sm">
                SOLO LECTURA
              </span>

              <div className="text-right hidden sm:block bg-white/20 px-4 py-3 rounded-lg">
                <p className="text-base font-bold text-white">{sessionContext.sesionUser}</p>
                <p className="text-sm text-purple-100 font-medium">Coordinador de Evaluación</p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-lg transition-all duration-200 border-2 border-white/60 shadow-sm font-bold text-base"
              >
                <FaSignOutAlt className="h-5 w-5" />
                <span className="hidden lg:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-100">
          <div className="py-7">
            <div className="max-w-8xl mx-auto px-5 sm:px-7 lg:px-9">
              <Outlet context={sessionContext} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
