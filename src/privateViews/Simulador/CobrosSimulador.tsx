import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaForward, FaCalendarAlt, FaSync, FaCog } from 'react-icons/fa';
import {
  getSimulatedDate,
  setSimulatedDate,
  resetSimulatedDate,
  applyMonthlyFeesAPI
} from '../../apis/simulation';

const SimuladorCobros: React.FC = () => {
  const [simulatedDate, setSimulatedDateState] = useState<string | null>(null);
  const [dateLoading, setDateLoading] = useState(false);

  useEffect(() => {
    loadSimulatedDate();
  }, []);

  const loadSimulatedDate = async () => {
    try {
      const res = await getSimulatedDate();
      if (res.result) {
        setSimulatedDateState(res.content.simulatedDate);
      }
    } catch (error) {
      console.error('Error cargando fecha simulada', error);
    }
  };

  const handleDateChange = async (newDate: string) => {
    try {
      setDateLoading(true);
      const res = await setSimulatedDate(newDate);
      if (res.result) {
        setSimulatedDateState(res.content.simulatedDate);
        toast.success(`Fecha simulada: ${newDate}`);
      }
    } catch (error) {
      toast.error('Error al cambiar fecha');
    } finally {
      setDateLoading(false);
    }
  };

  const advanceWeek = async () => {
    if (!simulatedDate) return;
    const current = new Date(simulatedDate + 'T00:00:00');
    current.setDate(current.getDate() + 7);
    const newDate = current.toISOString().split('T')[0];
    await handleDateChange(newDate);
  };

  const advanceMonth = async () => {
    if (!simulatedDate) return;
    const current = new Date(simulatedDate + 'T00:00:00');
    current.setMonth(current.getMonth() + 1);
    const newDate = current.toISOString().split('T')[0];
    await handleDateChange(newDate);
  };

  const resetDate = async () => {
    try {
      setDateLoading(true);
      const res = await resetSimulatedDate();
      if (res.result) {
        setSimulatedDateState(null);
        toast.success('Fecha restablecida a la real');
      }
    } catch (error) {
      toast.error('Error al restablecer fecha');
    } finally {
      setDateLoading(false);
    }
  };

  const handleApplyMonthlyFees = async () => {
    try {
      setDateLoading(true);
      await applyMonthlyFeesAPI();
      toast.success('Mensualidades aplicadas a todos los estudiantes activos');
    } catch (error) {
      toast.error('Error al aplicar mensualidades');
    } finally {
      setDateLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
    >
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Control de Fecha para Pruebas</h2>
        <p className="text-blue-100 mt-2 text-base sm:text-lg">
          Modifica la fecha del sistema de pruebas. Afecta a todos los cálculos de cobros, mensualidades y pronto pago.
        </p>

        {/* ✅ Indicador de fecha simulada activa */}
        <p className="mt-3 text-white text-lg font-semibold">
          {simulatedDate
            ? `📅 Fecha simulada activa: ${new Date(simulatedDate + 'T00:00:00').toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}`
            : '📅 Usando fecha real del servidor'}
        </p>

        <div className="flex flex-wrap gap-3 mt-5">
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-3">
            <FaCalendarAlt className="text-xl" />
            <input
              type="date"
              value={simulatedDate || ''}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-white font-semibold text-base focus:outline-none"
            />
          </div>

          <button onClick={advanceWeek} disabled={dateLoading}
            className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-3 hover:bg-white/30 transition text-base font-semibold disabled:opacity-50">
            <FaForward className="text-lg" /> +1 Semana
          </button>

          <button onClick={advanceMonth} disabled={dateLoading}
            className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-3 hover:bg-white/30 transition text-base font-semibold disabled:opacity-50">
            <FaForward className="text-lg" /> +1 Mes
          </button>

          <button onClick={resetDate} disabled={dateLoading}
            className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-3 hover:bg-white/30 transition text-base font-semibold disabled:opacity-50">
            <FaSync className="text-lg" /> Fecha real
          </button>

          <button onClick={handleApplyMonthlyFees} disabled={dateLoading}
            className="flex items-center gap-2 bg-yellow-500/80 rounded-lg px-4 py-3 hover:bg-yellow-500 transition text-base font-semibold disabled:opacity-50">
            <FaCog className="text-lg" /> Aplicar mensualidades ahora
          </button>
        </div>

        <div className="mt-5 bg-white/10 rounded-lg p-3 text-sm">
          <p><strong>Funcionamiento:</strong> Las secciones de Pagos, Balance y Usuarios usarán esta fecha. 
          Avanza la fecha y luego usa las herramientas normales para ver cómo cambian las deudas y los pagos.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SimuladorCobros;