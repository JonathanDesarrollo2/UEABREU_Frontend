import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FaList, FaPlus, FaChartBar, FaUsers } from 'react-icons/fa';
import { useQueryClient } from "@tanstack/react-query";
import AnimatedPage from "../components/AnimatedPage";

export default function LayoutUsers() {
  const queryClient = useQueryClient();
  const location = useLocation();
  
  // Invalidar cache cuando la ubicación cambia
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  }, [location.pathname, queryClient]);

  // Función para detectar rutas activas
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/admin/users' && location.pathname.startsWith(path));
  };

  // Estilos unificados con colores más suaves
  const selectedStyle = 'bg-blue-100 text-blue-800 shadow-sm border-l-4 border-blue-500'; 
  const unselectedStyle = 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'; 
  const getButtonClass = (path: string) => 
    `flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
      isActive(path) ? selectedStyle : unselectedStyle
    }`;

  return (
    <>
      <AnimatedPage>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
          {/* Barra de navegación superior */}
          <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="w-full mx-auto px-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3">
                <Link 
                  to="/admin/users" 
                  className="flex items-center space-x-2 text-xl mb-3 lg:mb-0 hover:text-blue-600 transition-colors"
                >
                  <FaUsers className="text-blue-600 mr-3 inline-block" />
                  <span className="text-blue-800 font-bold" >Gestión de Usuarios</span>
                </Link>
                
                <ul className="flex flex-col lg:flex-row lg:space-x-2 space-y-2 lg:space-y-0">
                  <li>
                    <Link
                      to="/admin/users/list"
                      className={getButtonClass('/admin/users/list')}
                    >
                      <FaList className="mr-2" />
                      <span>Lista de Usuarios</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/users/insert"
                      className={getButtonClass('/admin/users/insert')}
                    >
                      <FaPlus className="mr-2" />
                      <span>Agregar Usuario</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          {/* Contenido principal */}
          <main className="w-full p-4 lg:p-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 min-h-[calc(100vh-200px)]">
              <Outlet />
            </div>
          </main>

          {/* Barra de navegación móvil */}
          <div className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-lg z-10">
            <nav className="flex justify-around py-2">
              <Link
                to="/admin/users"
                className={`flex flex-col items-center p-2 text-xs ${
                  isActive('/admin/users') ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <FaChartBar className="text-lg mb-1" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/users/list"
                className={`flex flex-col items-center p-2 text-xs ${
                  isActive('/admin/users/list') ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <FaList className="text-lg mb-1" />
                <span>Lista</span>
              </Link>
              <Link
                to="/admin/users/insert"
                className={`flex flex-col items-center p-2 text-xs ${
                  isActive('/admin/users/insert') ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <FaPlus className="text-lg mb-1" />
                <span>Agregar</span>
              </Link>
            </nav>
          </div>
        </div>
      </AnimatedPage>
    </>
  );
}