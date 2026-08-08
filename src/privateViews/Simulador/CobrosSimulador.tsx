import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaForward, FaMoneyBillWave, FaCalendarAlt, FaHistory, FaSync, FaCog
} from 'react-icons/fa';
import {
  getSimulatedDate,
  setSimulatedDate,
  resetSimulatedDate,
  applyMonthlyFeesAPI
} from '../../apis/simulation';
import {
  searchRepresentatives,
  getTransactionHistory,
  manualDeposit
} from '../../apis/balance';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface Representative {
  id: string;
  fullName: string;
  identityCard: string;
  balance: number;
  balanceFormatted: string;
  balanceStatus: 'debt' | 'credit' | 'zero';
  studentCount: number;
  email: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  paymentMethod: string;
  reference: string;
  status: string;
  createdAt: string;
  balanceBefore: number;
  balanceAfter: number;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
const SimuladorCobros: React.FC = () => {
  // Fecha simulada
  const [simulatedDate, setSimulatedDateState] = useState<string | null>(null);
  const [dateLoading, setDateLoading] = useState(false);

  // Representantes
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);
  const [repLoading, setRepLoading] = useState(false);

  // Transacciones del representante seleccionado
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Depósito
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Carga inicial
  useEffect(() => {
    loadSimulatedDate();
    loadRepresentatives();
  }, []);

  // Cuando cambia la fecha simulada, recargar representantes
  useEffect(() => {
    if (simulatedDate) {
      loadRepresentatives();
    }
  }, [simulatedDate]);

  // Cargar fecha simulada
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

  // Cambiar fecha simulada
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

  // Avanzar una semana
  const advanceWeek = async () => {
    if (!simulatedDate) return;
    const current = new Date(simulatedDate + 'T00:00:00');
    current.setDate(current.getDate() + 7);
    const newDate = current.toISOString().split('T')[0];
    await handleDateChange(newDate);
  };

  // Avanzar un mes
  const advanceMonth = async () => {
    if (!simulatedDate) return;
    const current = new Date(simulatedDate + 'T00:00:00');
    current.setMonth(current.getMonth() + 1);
    const newDate = current.toISOString().split('T')[0];
    await handleDateChange(newDate);
  };

  // Restablecer a fecha real
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

  // Aplicar mensualidades a todos los estudiantes activos
  const handleApplyMonthlyFees = async () => {
    try {
      setDateLoading(true);
      await applyMonthlyFeesAPI();
      toast.success('Mensualidades aplicadas correctamente');
      loadRepresentatives();
    } catch (error) {
      toast.error('Error al aplicar mensualidades');
    } finally {
      setDateLoading(false);
    }
  };

  // Cargar lista de representantes
  const loadRepresentatives = async () => {
    try {
      setRepLoading(true);
      const res = await searchRepresentatives('', 50);
      if (res.result) {
        setRepresentatives(res.content.representatives || []);
      }
    } catch (error) {
      toast.error('Error cargando representantes');
    } finally {
      setRepLoading(false);
    }
  };

  // Seleccionar representante y cargar sus transacciones
  const selectRepresentative = async (repId: string) => {
    setSelectedRepId(repId);
    try {
      // Podríamos poner un loading local si quisiéramos, pero no es necesario
      const res = await getTransactionHistory(repId, { limit: 20 });
      if (res.result) {
        setTransactions(res.content.transactions || []);
      }
    } catch (error) {
      toast.error('Error cargando transacciones');
    }
  };

  // Realizar un depósito
  const handleDeposit = async () => {
    if (!selectedRepId) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Monto inválido');
      return;
    }
    try {
      setPaymentLoading(true);
      const res = await manualDeposit(selectedRepId, {
        amount,
        description: 'Depósito simulado',
        paymentMethod: 'cash'
      });
      if (res.result) {
        toast.success(`Depósito de ${amount} realizado`);
        setPaymentAmount('');
        loadRepresentatives();
        if (selectedRepId) selectRepresentative(selectedRepId);
      } else {
        toast.error(res.error?.[0] || 'Error en depósito');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error en depósito');
    } finally {
      setPaymentLoading(false);
    }
  };

  const selectedRep = representatives.find(r => r.id === selectedRepId);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-VE', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
    >
      {/* Cabecera azul */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl shadow-lg p-5 mb-6 text-white">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Simulador de Cobros (Test)</h2>
        <p className="text-blue-100 mt-1 text-base sm:text-lg">Controla la fecha y observa el comportamiento real</p>
        
        <div className="flex flex-wrap gap-3 mt-4">
          {/* Selector de fecha */}
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
            <FaCalendarAlt className="text-xl" />
            <input
              type="date"
              value={simulatedDate || ''}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-white font-semibold text-base focus:outline-none"
            />
          </div>
          
          {/* Avances rápidos */}
          <button onClick={advanceWeek} disabled={dateLoading}
            className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 hover:bg-white/30 transition text-base font-semibold disabled:opacity-50">
            <FaForward className="text-lg" /> +1 Semana
          </button>
          <button onClick={advanceMonth} disabled={dateLoading}
            className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 hover:bg-white/30 transition text-base font-semibold disabled:opacity-50">
            <FaForward className="text-lg" /> +1 Mes
          </button>
          <button onClick={resetDate} disabled={dateLoading}
            className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 hover:bg-white/30 transition text-base font-semibold disabled:opacity-50">
            <FaSync className="text-lg" /> Fecha real
          </button>

          {/* Aplicar mensualidades */}
          <button onClick={handleApplyMonthlyFees} disabled={dateLoading}
            className="flex items-center gap-2 bg-yellow-500/80 rounded-lg px-4 py-2 hover:bg-yellow-500 transition text-base font-semibold disabled:opacity-50">
            <FaCog className="text-lg" /> Aplicar mensualidades
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Panel izquierdo: lista de representantes */}
        <div className="lg:w-1/3 bg-white rounded-xl shadow-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Representantes</h3>
            <button onClick={loadRepresentatives} disabled={repLoading}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
              <FaSync className={`text-lg ${repLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {representatives.map(rep => (
              <div key={rep.id} onClick={() => selectRepresentative(rep.id)}
                className={`p-3 rounded-xl cursor-pointer transition border ${
                  selectedRepId === rep.id ? 'border-blue-500 bg-blue-50 shadow' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-800">{rep.fullName}</span>
                  <span className="text-sm text-gray-500">{rep.studentCount} est.</span>
                </div>
                <div className="text-base mt-1">
                  <span className={`font-bold ${
                    rep.balanceStatus === 'debt' ? 'text-red-600' : rep.balanceStatus === 'credit' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {rep.balanceFormatted}
                  </span>
                </div>
              </div>
            ))}
            {representatives.length === 0 && !repLoading && (
              <p className="text-gray-500 text-center py-10">No hay representantes</p>
            )}
          </div>
        </div>

        {/* Panel derecho: detalle del representante */}
        <div className="lg:w-2/3 bg-white rounded-xl shadow-lg p-5">
          {selectedRep ? (
            <>
              <div className="mb-5">
                <h3 className="text-2xl font-extrabold text-gray-800">{selectedRep.fullName}</h3>
                <div className="text-base text-gray-600 mt-1">
                  <p>Cédula: {selectedRep.identityCard} | Email: {selectedRep.email}</p>
                  <p>Estudiantes: {selectedRep.studentCount} | Balance: 
                    <span className={`font-bold ml-1 ${
                      selectedRep.balanceStatus === 'debt' ? 'text-red-600' : selectedRep.balanceStatus === 'credit' ? 'text-green-600' : ''
                    }`}>{selectedRep.balanceFormatted}</span>
                  </p>
                </div>
              </div>

              {/* Depósito rápido */}
              <div className="flex items-center gap-3 mb-5">
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Monto"
                />
                <button onClick={handleDeposit} disabled={paymentLoading}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-base font-bold shadow disabled:opacity-50">
                  <FaMoneyBillWave className="text-lg" /> Depositar
                </button>
              </div>

              {/* Historial de transacciones */}
              <h4 className="font-bold text-xl text-gray-800 flex items-center gap-2 mb-3">
                <FaHistory className="text-blue-600" /> Últimas transacciones
              </h4>
              <div className="overflow-x-auto max-h-64 rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 text-left font-bold text-gray-700">Fecha</th>
                      <th className="py-2 px-3 text-left font-bold text-gray-700">Tipo</th>
                      <th className="py-2 px-3 text-left font-bold text-gray-700">Descripción</th>
                      <th className="py-2 px-3 text-right font-bold text-gray-700">Monto</th>
                      <th className="py-2 px-3 text-right font-bold text-gray-700">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-600">{formatDate(tx.createdAt)}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            tx.type === 'fee' ? 'bg-red-100 text-red-700' :
                            tx.type === 'deposit' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {tx.type === 'fee' ? 'Cargo' : tx.type === 'deposit' ? 'Pago' : 'Ajuste'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-800">{tx.description}</td>
                        <td className={`py-2 px-3 text-right font-bold ${
                          tx.type === 'deposit' || tx.type === 'adjustment' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'adjustment' ? '+' : '-'}
                          {Math.abs(tx.amount).toFixed(2)} Bs
                        </td>
                        <td className="py-2 px-3 text-right text-gray-700">{tx.balanceAfter?.toFixed(2)} Bs</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-4 text-gray-500">Sin transacciones</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 text-base">
              Selecciona un representante para ver detalles
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SimuladorCobros;