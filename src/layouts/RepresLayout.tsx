// layouts/RepresLayout.tsx
import { Outlet, useOutletContext, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import {
  FaHome,
  FaMoneyCheck,
  FaClock,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
import { getRepresentativeByEmail } from '../apis/balance'; // Ajusta la ruta si es necesario

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

export default function RepresLayout() {
  const sessionContext = useOutletContext<SessionContext>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('tokcattleraising_inCattleRanchCloud');
    navigate('/login');
  };

  const goToPaymentValidation = useCallback(async () => {
    if (!sessionContext.sesionEmail) {
      navigate('/login');
      return;
    }
    setRedirectingToPayment(true);
    try {
      const res = await getRepresentativeByEmail(sessionContext.sesionEmail);
      if (res.result && res.content.id) {
        navigate(`/representante/validar-pago/${res.content.id}`);
      } else {
        alert('No se pudo obtener la información del representante. Intente de nuevo.');
      }
    } catch (error) {
      alert('Error al cargar datos del representante.');
    } finally {
      setRedirectingToPayment(false);
    }
  }, [sessionContext.sesionEmail, navigate]);

  const menuItems = [
    { name: 'Dashboard', icon: FaHome, path: '/representante', isAction: false },
    { 
      name: 'Pagos', 
      icon: redirectingToPayment ? FaSpinner : FaMoneyCheck, 
      path: null, 
      isAction: true, 
      action: goToPaymentValidation 
    },
    { name: 'Horario', icon: FaClock, path: '/representante/ChildrenSchedule', isAction: false },
  ];

  const renderMenuItem = (item: any) => {
    const baseClasses = "group flex items-center px-4 py-4 text-base font-semibold rounded-lg text-gray-300 hover:bg-gray-700 hover:text-blue-500 transition-all duration-200";
    const iconClasses = "mr-4 h-6 w-6 text-gray-400 group-hover:text-blue-600";

    if (item.isAction) {
      return (
        <button
          key={item.name}
          onClick={item.action}
          disabled={redirectingToPayment}
          className={baseClasses}
        >
          <item.icon className={`${iconClasses} ${redirectingToPayment ? 'animate-spin' : ''}`} />
          {item.name}
        </button>
      );
    }

    return (
      <a
        key={item.name}
        href={item.path}
        className={baseClasses}
      >
        <item.icon className={iconClasses} />
        {item.name}
      </a>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar para móviles */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black opacity-70" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800 shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-12 w-12 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-700 bg-gray-700 hover:bg-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes className="h-6 w-6 text-gray-300" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
            {/* Logo y nombre */}
            <div className="flex-shrink-0 flex items-center px-5 pb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-xl">
                <img 
                  src="/logo.png" 
                  alt="Logo U.E. José Antonio Abreu" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="ml-4">
                <span className="text-white text-lg font-bold block">U.E. José</span>
                <span className="text-blue-500 text-base font-bold block">Antonio Abreu</span>
                <span className="text-gray-400 text-xs font-medium block -mt-1">NAGUANAGUA</span>
              </div>
            </div>
            
            {/* Información del estudiante (sin el estado) */}
            {sessionContext.studentInfo?.name && (
              <div className="px-5 py-4 bg-gray-700 mx-3 mt-4 rounded-lg">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Representante</p>
                <p className="text-white font-bold text-lg mt-1">{sessionContext.studentInfo.name}</p>
              </div>
            )}
            
            <nav className="mt-6 px-3 space-y-2">
              {menuItems.map(item => renderMenuItem(item))}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar estático para desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72 bg-gray-800 shadow-sm">
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <div className="flex items-center px-6 pb-6">
              <div className="flex items-center justify-center w-24 h-24 rounded-xl">
                <img 
                  src="/logo.png" 
                  alt="Logo U.E. José Antonio Abreu" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="ml-4">
                <span className="text-white text-xl font-bold block">U.E. José</span>
                <span className="text-blue-500 text-lg font-bold block">Antonio Abreu</span>
                <span className="text-gray-400 text-sm font-medium block -mt-1">NAGUANAGUA</span>
              </div>
            </div>
            
              {/* Información del representante */}
              {sessionContext.sesionUser && (
                <div className="px-5 py-4 bg-gray-700 mx-3 mt-4 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Representante</p>
                  <p className="text-white font-bold text-lg mt-1">{sessionContext.sesionUser}</p>
                </div>
              )}
            
            <nav className="mt-6 flex-1 px-4 space-y-3">
              {menuItems.map(item => renderMenuItem(item))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        {/* Header móvil */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-gray-800 px-5 py-4 shadow-sm">
            <div className="flex items-center">
              <button
                className="inline-flex items-center justify-center rounded-lg p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 focus:outline-none shadow-sm"
                onClick={() => setSidebarOpen(true)}
              >
                <FaBars className="h-6 w-6" />
              </button>
              <div className="ml-4">
                <span className="text-white font-bold text-base">U.E. José Antonio Abreu</span>
                <span className="text-blue-500 text-sm font-bold block">NAGUANAGUA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header principal */}
        <header className="bg-gray-800 shadow-sm">
          <div className="flex justify-between items-center px-7 py-5">
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-white">Panel de Representante</h1>
              <p className="text-gray-400 text-base mt-2 font-medium">Seguimiento educativo integral</p>
            </div>
            
            <div className="flex items-center space-x-5">
              <div className="text-right hidden sm:block bg-gray-700 px-4 py-3 rounded-lg">
                <p className="text-base font-bold text-white">{sessionContext.sesionUser}</p>
                <p className="text-sm text-gray-400 font-medium">Representante</p>
              </div>
              
              {/* Botón de cerrar sesión ligeramente más grande */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 bg-gray-700 hover:bg-blue-700 text-gray-300 hover:text-white px-6 py-3.5 rounded-lg transition-all duration-200 border-2 border-blue-700 hover:border-blue-600 shadow-sm font-bold text-lg"
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
}import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
  FaUserGraduate,
  FaCreditCard
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getRepresentativeByEmail, getRepresentativeBalance } from '../apis/balance';

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
  const navigate = useNavigate();

  const [representativeId, setRepresentativeId] = useState<string | null>(null);
  const [balanceData, setBalanceData] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [childrenCount, setChildrenCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (sessionContext.sesionEmail) {
          const repEmailRes = await getRepresentativeByEmail(sessionContext.sesionEmail);
          if (repEmailRes.result) {
            const repId = repEmailRes.content.id;
            setRepresentativeId(repId);

            const balanceRes = await getRepresentativeBalance(repId);
            if (balanceRes.result) {
              setBalanceData(balanceRes.content);
              setChildrenCount(balanceRes.content.representative.students?.length || 0);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar datos financieros', error);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchData();
  }, [sessionContext.sesionEmail]);

  const representative = balanceData?.representative;
  const students = representative?.students || [];
  const balance = representative?.balance ?? 0;
  const fullName = representative?.fullName || sessionContext.sesionUser;

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
                ¡Bienvenido, {fullName}!
              </h1>
              <p className="text-blue-200 text-lg">
                Panel de Representante
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 border-2 border-white/30">
            <p className="text-sm font-medium">Hijos registrados</p>
            <p className="text-lg font-bold text-blue-200">
              {loadingBalance ? '...' : childrenCount}
            </p>
          </div>
        </div>
      </motion.div>

      {/* --- NUEVA SECCIÓN: Estado de Cuenta por Estudiante --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h2 className="text-2xl font-bold text-gray-800">Estado de Cuenta</h2>
          <div
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              balance < 0
                ? 'bg-red-50 text-red-700'
                : balance > 0
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Total: ${balance.toFixed(2)}
          </div>
        </div>

        {loadingBalance ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center text-gray-500">
            Cargando información de estudiantes...
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center text-gray-500">
            No hay estudiantes registrados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student: any) => {
              const sBalance = student.balance || 0;
              const isDebt = sBalance < 0;
              const isCredit = sBalance > 0;
              const balanceColor = isDebt ? 'text-red-600' : isCredit ? 'text-green-600' : 'text-gray-600';
              const bgColor = isDebt
                ? 'bg-red-50 border-red-200'
                : isCredit
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200';
              const icon = isDebt ? (
                <FaExclamationTriangle className="text-red-600 text-xl" />
              ) : isCredit ? (
                <FaCheckCircle className="text-green-600 text-xl" />
              ) : (
                <FaMoneyBillWave className="text-gray-400 text-xl" />
              );

              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-xl border ${bgColor} p-5 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">
                        {student.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {student.currentGrade || 'Sin grado'} • {student.status}
                      </p>
                    </div>
                    <div className="ml-3">{icon}</div>
                  </div>

                  <div className="mt-4">
                    <p className={`text-2xl font-bold ${balanceColor}`}>
                      ${sBalance.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isDebt
                        ? `Deuda de $${Math.abs(sBalance).toFixed(2)}`
                        : isCredit
                        ? 'Saldo a favor'
                        : 'Sin movimientos'}
                    </p>
                  </div>

                  {isDebt && (
                    <div className="mt-3 bg-red-100/50 rounded-lg px-3 py-2 text-sm text-red-800 font-medium flex items-center">
                      <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                      Pendiente de pago
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Acceso Rápido */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Botón Validar Pago */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Validar Pago</h3>
          <button
            onClick={() => {
              if (representativeId) {
                navigate(`/representante/validar-pago/${representativeId}`);
              }
            }}
            disabled={!representativeId}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-3 text-lg font-semibold"
          >
            <FaCreditCard />
            <span>Validar Pago Bancario</span>
          </button>
          <p className="text-center text-gray-500 text-sm mt-3">
            Registra un pago mediante verificación bancaria automática.
          </p>
        </div>

        {/* Botón Horarios */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Horarios de Clases</h3>
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
        </div>
      </motion.div>
    </div>
  );
};