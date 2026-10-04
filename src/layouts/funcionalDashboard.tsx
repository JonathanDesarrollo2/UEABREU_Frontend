// src/layouts/FuncionalDashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUserPlus,
  FaUser,
  FaUsers,
  FaSync,
  FaClock,
  FaArrowRight,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../library/axios';

interface SessionContext {
  sesionUser?: string;
  sesionEmail?: string;
  userStatus?: boolean;
  nivel?: number;
}

interface RepRow {
  id: string;
  fullName: string;
  identityCard: string;
  phone?: string;
  email?: string;
  createdAt?: string;
}

export default function FuncionalDashboard() {
  const sessionContext = useOutletContext<SessionContext>();
  const navigate = useNavigate();

  const [representatives, setRepresentatives] = useState<RepRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/private/user/listpag', {
        params: {
          page: 1,
          limit: 5,
          idBus: 4,          // ordenar por createdAt DESC
          DeBus: '',
          nivelFilter: 1,    // solo representantes
        },
      });

      if (res.data?.result && Array.isArray(res.data.content)) {
        const list: RepRow[] = res.data.content.map((u: any) => ({
          id: u.id,
          fullName: u.representative?.fullName || u.username || u.userlogin,
          identityCard: u.representative?.identityCard || '—',
          phone: u.representative?.phone || '—',
          email: u.usermail,
          createdAt: u.createdAt,
        }));
        setRepresentatives(list);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      console.error('Error cargando dashboard funcional:', err);
      toast.error('No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-2xl p-6 text-white mb-8 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Panel Funcional</h1>
            <p className="text-cyan-100">
              Bienvenido, {sessionContext.sesionUser || 'Usuario'}
            </p>
            <div className="flex items-center mt-2 space-x-4 text-sm">
              <span className="flex items-center">
                <FaClock className="mr-2" /> Última actualización: {lastUpdated || 'No disponible'}
              </span>
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
              >
                <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4 md:mt-0">
            <div className="text-center">
              <p className="text-sm opacity-90">Tu Rol</p>
              <p className="font-bold text-lg">FUNCIONAL</p>
              <p className="text-xs opacity-75 mt-1">Nivel de acceso 3</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tarjetas de acción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/funcional/users/insert')}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md">
              <FaUserPlus size={28} />
            </div>
            <FaArrowRight className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Registrar Nuevo Representante</h3>
          <p className="text-gray-600 text-sm">
            Crea una cuenta de representante con sus estudiantes asociados.
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/funcional/users/list')}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
              <FaUsers size={28} />
            </div>
            <FaArrowRight className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ver Representantes</h3>
          <p className="text-gray-600 text-sm">
            Consulta la lista completa de representantes registrados.
          </p>
        </motion.button>
      </div>

      {/* Últimos representantes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-600 mr-4">
              <FaUser size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Últimos Representantes</h3>
              <p className="text-gray-600 text-sm">Los 5 más recientes</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/funcional/users/list')}
            className="text-sm font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            Ver todos <FaArrowRight className="text-xs" />
          </button>
        </div>

        {loading && representatives.length === 0 ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        ) : representatives.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Aún no hay representantes registrados.
          </div>
        ) : (
          <div className="space-y-3">
            {representatives.map((rep) => (
              <div
                key={rep.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold">
                    {rep.fullName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{rep.fullName}</p>
                    <p className="text-xs text-gray-500">
                      CI: {rep.identityCard} • {rep.email || 'Sin correo'}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('es-VE') : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-gray-500 text-sm"
      >
        <p>Sistema de Gestión Escolar • Panel Funcional</p>
      </motion.div>
    </div>
  );
}