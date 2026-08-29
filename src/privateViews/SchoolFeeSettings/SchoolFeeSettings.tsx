import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaSave, FaSpinner, FaMoneyBillWave, FaCalendarAlt, FaHandHoldingUsd,
  FaPercentage, FaCalendarCheck, FaCalendarPlus, FaCalendarTimes, FaCoins, FaLock,
  FaHistory, FaUser, FaClock
} from 'react-icons/fa';
import type { SchoolFee } from '../../types/SchoolFee';
import { getSchoolFees, updateSchoolFees, getAuditLogs } from '../../apis/SchoolFee';

const SchoolFeeSettings: React.FC = () => {
  const [fees, setFees] = useState<SchoolFee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Estados locales para cada campo
  const [inscriptionFeeUSD, setInscriptionFeeUSD] = useState<number>(80);
  const [monthlyFeeUSD, setMonthlyFeeUSD] = useState<number>(100);
  const [prontoPagoDiscount, setProntoPagoDiscount] = useState<number>(10);
  const [prontoPagoDeadlineDay, setProntoPagoDeadlineDay] = useState<number>(10);
  const [administrativeFeeUSD, setAdministrativeFeeUSD] = useState<number>(20);
  const [august2027HalfPaymentUSD, setAugust2027HalfPaymentUSD] = useState<number>(45);
  const [monthlyFeeStartDate, setMonthlyFeeStartDate] = useState<string>('2026-09-01');
  const [inscriptionStartDate, setInscriptionStartDate] = useState<string>('2026-07-15');
  const [inscriptionEndDate, setInscriptionEndDate] = useState<string>('2026-10-01');
  const [schoolYearEndDate, setSchoolYearEndDate] = useState<string>('2026-12-15');
  const [adminPassword, setAdminPassword] = useState<string>('');

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const data = await getSchoolFees();
        setFees(data);
        setInscriptionFeeUSD(data.inscriptionFeeUSD ?? 80);
        setMonthlyFeeUSD(data.monthlyFeeUSD ?? 100);
        setProntoPagoDiscount(data.prontoPagoDiscount ?? 10);
        setProntoPagoDeadlineDay(data.prontoPagoDeadlineDay ?? 10);
        setAdministrativeFeeUSD(data.administrativeFeeUSD ?? 20);
        setAugust2027HalfPaymentUSD(data.august2027HalfPaymentUSD ?? 45);
        setMonthlyFeeStartDate(data.monthlyFeeStartDate || '2026-09-01');
        setInscriptionStartDate(data.inscriptionStartDate || '2026-07-15');
        setInscriptionEndDate(data.inscriptionEndDate || '2026-10-01');
        setSchoolYearEndDate(data.schoolYearEndDate || '2026-12-15');
      } catch (error: any) {
        toast.error(error.message || 'No se pudieron cargar las tarifas');
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const logs = await getAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error al cargar historial de cambios', error);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleSave = async () => {
    if (!adminPassword) {
      toast.error('Debes ingresar la contraseña administrativa');
      return;
    }
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
        schoolYearEndDate,
        password: adminPassword,
      });
      setFees(updated);
      setAdminPassword('');
      toast.success('Tarifas actualizadas correctamente');
      fetchAuditLogs(); // refrescar historial
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar las tarifas');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <FaSpinner className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  const inputClasses = "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm transition-all duration-200";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-6 mb-8 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full">
            <FaCoins className="text-4xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Tarifas Escolares</h2>
            <p className="text-blue-100 mt-1 text-lg">
              Año escolar {fees?.schoolYear || '2026-2027'} · Configure los montos en dólares
            </p>
          </div>
        </div>
      </div>

      {/* Formulario en dos tarjetas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tarjeta: Cuotas Principales */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaMoneyBillWave className="text-blue-600" />
            Cuotas Generales
          </h3>
          <div className="space-y-6">
            <div>
              <label className={labelClasses}>
                <FaHandHoldingUsd /> Inscripción (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input type="number" step="0.01" min="0" value={inscriptionFeeUSD} onChange={(e) => setInscriptionFeeUSD(parseFloat(e.target.value) || 0)} className={inputClasses} />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">Válido durante el periodo de inscripción</p>
            </div>

            <div>
              <label className={labelClasses}>
                <FaCoins /> Mensualidad (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input type="number" step="0.01" min="0" value={monthlyFeeUSD} onChange={(e) => setMonthlyFeeUSD(parseFloat(e.target.value) || 0)} className={inputClasses} />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">Monto completo antes del descuento por pronto pago</p>
            </div>

            <div>
              <label className={labelClasses}>
                <FaHandHoldingUsd /> Gasto Administrativo (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input type="number" step="0.01" min="0" value={administrativeFeeUSD} onChange={(e) => setAdministrativeFeeUSD(parseFloat(e.target.value) || 0)} className={inputClasses} />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">Solo para estudiantes de nuevo ingreso</p>
            </div>

            <div>
              <label className={labelClasses}>
                <FaPercentage /> Anticipo Agosto 2027 (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input type="number" step="0.01" min="0" value={august2027HalfPaymentUSD} onChange={(e) => setAugust2027HalfPaymentUSD(parseFloat(e.target.value) || 0)} className={inputClasses} />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">50% de la mensualidad de agosto 2027</p>
            </div>
          </div>
        </div>

        {/* Tarjeta: Pronto Pago y Fechas */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" />
            Pronto Pago y Fechas
          </h3>
          <div className="space-y-6">
            <div>
              <label className={labelClasses}>
                <FaMoneyBillWave /> Descuento Pronto Pago (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input type="number" step="0.01" min="0" value={prontoPagoDiscount} onChange={(e) => setProntoPagoDiscount(parseFloat(e.target.value) || 0)} className={inputClasses} />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">Descuento aplicado si paga dentro de los primeros días del mes</p>
            </div>

            <div>
              <label className={labelClasses}>
                <FaCalendarCheck /> Día límite para Pronto Pago
              </label>
              <input type="number" min="1" max="31" value={prontoPagoDeadlineDay} onChange={(e) => setProntoPagoDeadlineDay(parseInt(e.target.value) || 1)} className={inputClasses} />
              <p className="text-xs text-gray-500 mt-1 ml-1">Si paga antes de este día, recibe el descuento</p>
            </div>

            <div>
              <label className={labelClasses}>
                <FaCalendarPlus /> Inicio de Mensualidades
              </label>
              <input type="date" value={monthlyFeeStartDate} onChange={(e) => setMonthlyFeeStartDate(e.target.value)} className={inputClasses} />
              <p className="text-xs text-gray-500 mt-1 ml-1">A partir de esta fecha se generan las mensualidades</p>
            </div>

            <div>
              <label className={labelClasses}>
                <FaCalendarTimes /> Fin de Año Escolar
              </label>
              <input type="date" value={schoolYearEndDate} onChange={(e) => setSchoolYearEndDate(e.target.value)} className={inputClasses} />
              <p className="text-xs text-gray-500 mt-1 ml-1">Usada para calcular mensualidades de regulares</p>
            </div>

            <div>
              <label className={labelClasses}>
                <FaCalendarPlus /> Inicio de Inscripciones
              </label>
              <input type="date" value={inscriptionStartDate} onChange={(e) => setInscriptionStartDate(e.target.value)} className={inputClasses} />
            </div>

            <div>
              <label className={labelClasses}>
                <FaCalendarTimes /> Fin de Inscripciones
              </label>
              <input type="date" value={inscriptionEndDate} onChange={(e) => setInscriptionEndDate(e.target.value)} className={inputClasses} />
            </div>

            {/* Campo de contraseña administrativa */}
            <div>
              <label className={labelClasses}>
                <FaLock /> Contraseña administrativa
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className={inputClasses}
                placeholder="Contraseña requerida para guardar cambios"
              />
              <p className="text-xs text-gray-500 mt-1">
                La primera vez que guardes, esta contraseña quedará registrada y no podrá cambiarse.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-center mt-10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-12 py-4 text-lg font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? (
            <>
              <FaSpinner className="animate-spin text-2xl" />
              Guardando cambios...
            </>
          ) : (
            <>
              <FaSave className="text-2xl" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      {/* Historial de cambios */}
      <div className="mt-10 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaHistory className="text-blue-600" /> Historial de Cambios
        </h3>
        {auditLogs.length === 0 ? (
          <p className="text-gray-500">No hay cambios registrados.</p>
        ) : (
          <ul className="space-y-3">
            {auditLogs.map((log: any) => (
              <li key={log.id} className="border-b pb-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaUser className="text-gray-400" />
                  <span className="font-semibold">{log.user?.username || log.user?.userlogin || 'Admin'}</span>
                  <FaClock className="ml-4 text-gray-400" />
                  <span>{new Date(log.createdAt).toLocaleString('es-VE')}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Acción: {log.action}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-8" />
    </motion.div>
  );
};

export default SchoolFeeSettings;