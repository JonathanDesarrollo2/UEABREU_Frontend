import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaSave, FaSpinner } from 'react-icons/fa';
import type { SchoolFee } from '../../types/SchoolFee';
import { getSchoolFees, updateSchoolFees } from '../../apis/SchoolFee';

const SchoolFeeSettings: React.FC = () => {
  const [fees, setFees] = useState<SchoolFee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados locales para los campos del formulario
  const [inscriptionFeeUSD, setInscriptionFeeUSD] = useState<number>(80);
  const [monthlyFeeUSD, setMonthlyFeeUSD] = useState<number>(100);
  const [prontoPagoDiscount, setProntoPagoDiscount] = useState<number>(10);
  const [prontoPagoDeadlineDay, setProntoPagoDeadlineDay] = useState<number>(10);
  const [administrativeFeeUSD, setAdministrativeFeeUSD] = useState<number>(20);
  const [august2027HalfPaymentUSD, setAugust2027HalfPaymentUSD] = useState<number>(45);
  const [monthlyFeeStartDate, setMonthlyFeeStartDate] = useState<string>('2026-09-01');
  const [inscriptionStartDate, setInscriptionStartDate] = useState<string>('2026-07-15');
  const [inscriptionEndDate, setInscriptionEndDate] = useState<string>('2026-10-01');

  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const data = await getSchoolFees();
        setFees(data);
        setInscriptionFeeUSD(data.inscriptionFeeUSD || 80);
        setMonthlyFeeUSD(data.monthlyFeeUSD || 100);
        setProntoPagoDiscount(data.prontoPagoDiscount || 10);
        setProntoPagoDeadlineDay(data.prontoPagoDeadlineDay || 10);
        setAdministrativeFeeUSD(data.administrativeFeeUSD || 20);
        setAugust2027HalfPaymentUSD(data.august2027HalfPaymentUSD || 45);
        setMonthlyFeeStartDate(data.monthlyFeeStartDate || '2026-09-01');
        setInscriptionStartDate(data.inscriptionStartDate || '2026-07-15');
        setInscriptionEndDate(data.inscriptionEndDate || '2026-10-01');
      } catch (error: any) {
        toast.error(error.message || 'No se pudieron cargar las tarifas');
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateSchoolFees('2026-2027', {
        inscriptionFeeUSD,
        monthlyFeeUSD,
        prontoPagoDiscount,
        prontoPagoDeadlineDay,
        administrativeFeeUSD,
        august2027HalfPaymentUSD,
        monthlyFeeStartDate,
        inscriptionStartDate,
        inscriptionEndDate,
      });
      setFees(updated);
      toast.success('Tarifas actualizadas correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar las tarifas');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <FaSpinner className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Configuración de Tarifas – Año Escolar {fees?.schoolYear || '2026-2027'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inscripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inscripción (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={inscriptionFeeUSD}
              onChange={(e) => setInscriptionFeeUSD(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mensualidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensualidad (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={monthlyFeeUSD}
              onChange={(e) => setMonthlyFeeUSD(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Descuento Pronto Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descuento Pronto Pago (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={prontoPagoDiscount}
              onChange={(e) => setProntoPagoDiscount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Día límite pronto pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Día límite pronto pago
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={prontoPagoDeadlineDay}
              onChange={(e) => setProntoPagoDeadlineDay(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gasto Administrativo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gasto Administrativo (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={administrativeFeeUSD}
              onChange={(e) => setAdministrativeFeeUSD(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 50% agosto 2027 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              50% Agosto 2027 (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={august2027HalfPaymentUSD}
              onChange={(e) => setAugust2027HalfPaymentUSD(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha inicio mensualidades */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inicio Mensualidades
            </label>
            <input
              type="date"
              value={monthlyFeeStartDate}
              onChange={(e) => setMonthlyFeeStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha inicio inscripciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inicio Inscripciones
            </label>
            <input
              type="date"
              value={inscriptionStartDate}
              onChange={(e) => setInscriptionStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha fin inscripciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fin Inscripciones
            </label>
            <input
              type="date"
              value={inscriptionEndDate}
              onChange={(e) => setInscriptionEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 text-base font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="text-lg" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SchoolFeeSettings;