// layouts/AdminLayout.tsx
import { Outlet, useOutletContext, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  FaGraduationCap, 
  FaHome, 
  FaMoneyCheck,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser,
  FaUserPlus,
  FaCalendar,
  FaChalkboardTeacher
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

export default function AdminLayout() {
  const sessionContext = useOutletContext<SessionContext>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('tokcattleraising_inCattleRanchCloud');
    navigate('/login');
  };

  // Solo estas opciones administrativas esenciales
  const menuItems = [
    { name: 'Dashboard', icon: FaHome, path: '/admin' },
    { name: 'Pagos', icon: FaMoneyCheck, path: '/admin/Balance' },
    { name: 'Usuarios', icon: FaUser, path: '/admin/users/list' },
    { name: 'Nuevo Usuario', icon: FaUserPlus, path: '/admin/users/insert' },
    { name: 'Horario', icon: FaCalendar, path: '/admin/Schedule' },
    { name: 'Materias', icon: FaGraduationCap, path: '/admin/ListSubjects' },
    { name: 'Estudiantes', icon: FaGraduationCap, path: '/admin/listStudents' },
    { name: 'Profesores', icon: FaChalkboardTeacher, path: '/admin/teachers/list' }, // Solo listado
  ];

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar para móviles */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black opacity-70" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800 shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-12 w-12 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 bg-gray-700 hover:bg-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes className="h-6 w-6 text-gray-300" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
            {/* Logo y nombre */}
            <div className="flex-shrink-0 flex items-center px-5 pb-6">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-md">
                <FaGraduationCap className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <span className="text-white text-lg font-bold block">U.E. José</span>
                <span className="text-blue-400 text-base font-bold block">Antonio Abreu</span>
                <span className="text-gray-400 text-xs font-medium block -mt-1">NAGUANAGUA</span>
              </div>
            </div>
            
            {/* Información del administrador */}
            {sessionContext.sesionUser && (
              <div className="px-5 py-4 bg-gray-700 mx-3 mt-4 rounded-lg">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Administrativo</p>
                <p className="text-white font-bold text-lg mt-1">{sessionContext.sesionUser}</p>
                <p className="text-sm mt-3">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">● ACTIVO</span>
                </p>
              </div>
            )}
            
            {/* Menú simplificado */}
            <nav className="mt-6 px-3 space-y-2">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className="group flex items-center px-4 py-4 text-base font-semibold rounded-lg text-gray-300 hover:bg-gray-700 hover:text-blue-300 transition-all duration-200"
                >
                  <item.icon className="mr-4 h-6 w-6 text-gray-400 group-hover:text-blue-400" />
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar estático para desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72 bg-gray-800 shadow-sm">
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            {/* Logo y nombre */}
            <div className="flex items-center px-6 pb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-md">
                <FaGraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <span className="text-white text-xl font-bold block">U.E. José</span>
                <span className="text-blue-400 text-lg font-bold block">Antonio Abreu</span>
                <span className="text-gray-400 text-sm font-medium block -mt-1">NAGUANAGUA</span>
              </div>
            </div>
            
            {/* Información del administrador */}
            {sessionContext.sesionUser && (
              <div className="px-5 py-5 bg-gray-700 mx-4 mt-4 rounded-xl">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Administrativo</p>
                <p className="text-white font-bold text-lg mt-2">{sessionContext.sesionUser}</p>
                <p className="text-sm mt-3">
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">● ACTIVO</span>
                </p>
              </div>
            )}
            
            {/* Menú simplificado */}
            <nav className="mt-6 flex-1 px-4 space-y-3">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className="group flex items-center px-5 py-4 text-base font-semibold rounded-lg text-gray-300 hover:bg-gray-700 hover:text-blue-300 transition-all duration-200"
                >
                  <item.icon className="mr-4 h-6 w-6 text-gray-400 group-hover:text-blue-400" />
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        {/* Header móvil */}
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
                <span className="text-white font-bold text-base">U.E. José Antonio Abreu</span>
                <span className="text-blue-400 text-sm font-bold block">NAGUANAGUA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header principal */}
        <header className="bg-gray-800 shadow-sm">
          <div className="flex justify-between items-center px-7 py-5">
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-white">Panel Administrativo</h1>
              <p className="text-gray-400 text-base mt-2 font-medium">Gestión administrativa</p>
            </div>
            
            <div className="flex items-center space-x-5">
              {/* Información del usuario */}
              <div className="text-right hidden sm:block bg-gray-700 px-4 py-3 rounded-lg">
                <p className="text-base font-bold text-white">{sessionContext.sesionUser}</p>
                <p className="text-sm text-gray-400 font-medium">Administrativo</p>
              </div>
              
              {/* Badge de estado */}
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-5 py-3 rounded-lg text-base font-bold shadow-md">
                Administrativo
              </div>
              
              {/* Botón de salir */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 bg-gray-700 hover:bg-blue-500 text-gray-300 hover:text-white px-5 py-3 rounded-lg transition-all duration-200 border-2 border-blue-500 hover:border-blue-400 shadow-sm font-bold text-base"
              >
                <FaSignOutAlt className="h-5 w-5" />
                <span className="hidden lg:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
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