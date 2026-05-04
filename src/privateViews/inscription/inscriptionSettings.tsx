import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface StatusResponse {
  result: boolean;
  content: {
    registrationsEnabled: boolean;
  };
}

const InscriptionSettings: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const token = localStorage.getItem('tokcattleraising_inCattleRanchCloud') || '';

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.ueabreu.com'}/api/private/settings/registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data: StatusResponse = await res.json();
      if (data.result) {
        setIsEnabled(data.content.registrationsEnabled);
      }
    } catch (error) {
      toast.error('Error al obtener estado de inscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.ueabreu.com'}/api/private/settings/registrations/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enable: !isEnabled })
      });
      const data = await res.json();
      if (data.result) {
        setIsEnabled(!isEnabled);
        toast.success(`Inscripciones ${!isEnabled ? 'activadas' : 'desactivadas'} correctamente`);
      } else {
        toast.error(data.error?.[0] || 'Error al cambiar estado');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setToggling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8"
    >
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Control de Inscripciones Públicas</h2>
      <p className="text-slate-600 mb-8">
        Active o desactive la posibilidad de que nuevos representantes se registren a través del formulario público.
      </p>

      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : (
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-6">
          <div>
            <span className="text-lg font-semibold text-slate-700">Estado actual:</span>
            <span className={`ml-2 text-lg font-bold ${isEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {isEnabled ? 'Activado' : 'Desactivado'}
            </span>
            <p className="text-sm text-slate-500 mt-1">
              {isEnabled ? 'Los usuarios pueden enviar solicitudes de registro.' : 'El registro público está cerrado.'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold text-white transition ${
              isEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            } disabled:opacity-50`}
          >
            {isEnabled ? (
              <><FaToggleOff className="mr-2" /> Desactivar</>
            ) : (
              <><FaToggleOn className="mr-2" /> Activar</>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default InscriptionSettings;