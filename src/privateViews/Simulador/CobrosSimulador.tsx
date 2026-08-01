// src/privateViews/SimuladorCobros/SimuladorCobros.tsx
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaPlus, FaTrash, FaForward, FaMoneyBillWave, FaUserCheck,
  FaCalendarAlt, FaHistory, FaCog
} from 'react-icons/fa';

// ---------------------------------------------------------------------------
// Tipos simulados
// ---------------------------------------------------------------------------
interface SimulatedTransaction {
  id: string;
  type: 'fee' | 'deposit' | 'adjustment';
  amountBS: number;
  amountUSD: number;
  bcvRate: number;
  description: string;
  date: Date;
  balanceBefore: number;
  balanceAfter: number;
}

interface SimulatedStudent {
  id: string;
  fullName: string;
  exonerationPercent: number;
  hasPaidInscription: boolean;
  balance: number;
  status: 'pendiente' | 'regular';
  activationDate: Date | null;
  transactions: SimulatedTransaction[];
}

interface SimulatedFeeConfig {
  inscriptionFeeUSD: number;
  monthlyFeeUSD: number;
  prontoPagoDiscount: number;
  prontoPagoDeadlineDay: number;
  administrativeFeeUSD: number;
  august2027HalfPaymentUSD: number;
  monthlyFeeStartDate: string;
  inscriptionStartDate: string;
  inscriptionEndDate: string;
}

// Valores iniciales
const DEFAULT_FEES: SimulatedFeeConfig = {
  inscriptionFeeUSD: 80,
  monthlyFeeUSD: 100,
  prontoPagoDiscount: 10,
  prontoPagoDeadlineDay: 10,
  administrativeFeeUSD: 20,
  august2027HalfPaymentUSD: 45,
  monthlyFeeStartDate: '2026-09-01',
  inscriptionStartDate: '2026-07-15',
  inscriptionEndDate: '2026-10-01',
};

const SIMULATED_BCV_RATE = 40;

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// ---------------------------------------------------------------------------
// Lógica de simulación
// ---------------------------------------------------------------------------
const useSimulation = () => {
  const [students, setStudents] = useState<SimulatedStudent[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-08-15'));
  const [feeConfig, setFeeConfig] = useState<SimulatedFeeConfig>(DEFAULT_FEES);
  const [bcvRate, setBcvRate] = useState<number>(SIMULATED_BCV_RATE);

  const addStudent = useCallback(() => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const newStudent: SimulatedStudent = {
      id,
      fullName: `Estudiante ${students.length + 1}`,
      exonerationPercent: 0,
      hasPaidInscription: false,
      balance: 0,
      status: 'pendiente',
      activationDate: null,
      transactions: [],
    };
    setStudents(prev => [...prev, newStudent]);
  }, [students.length]);

  const removeStudent = useCallback((id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  const activateStudent = useCallback((studentId: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId || s.status === 'regular') return s;
        const txs: SimulatedTransaction[] = [];
        let bal = s.balance;
        const now = new Date(currentDate);
        const bcv = bcvRate;

        if (!s.hasPaidInscription) {
          const usd = feeConfig.inscriptionFeeUSD;
          const bs = Math.round(usd * bcv * 100) / 100;
          txs.push({
            id: Date.now().toString(36) + Math.random().toString(36),
            type: 'fee', amountBS: bs, amountUSD: usd, bcvRate: bcv,
            description: 'Inscripción año escolar', date: new Date(now),
            balanceBefore: bal, balanceAfter: bal - bs,
          });
          bal -= bs;
        }
        if (!s.hasPaidInscription && s.transactions.length === 0) {
          const usd = feeConfig.administrativeFeeUSD;
          const bs = Math.round(usd * bcv * 100) / 100;
          txs.push({
            id: Date.now().toString(36) + Math.random().toString(36),
            type: 'fee', amountBS: bs, amountUSD: usd, bcvRate: bcv,
            description: 'Gasto administrativo (nuevo ingreso)', date: new Date(now),
            balanceBefore: bal, balanceAfter: bal - bs,
          });
          bal -= bs;
        }
        if (!s.hasPaidInscription) {
          const usd = feeConfig.august2027HalfPaymentUSD;
          const bs = Math.round(usd * bcv * 100) / 100;
          txs.push({
            id: Date.now().toString(36) + Math.random().toString(36),
            type: 'fee', amountBS: bs, amountUSD: usd, bcvRate: bcv,
            description: 'Anticipo 50% mensualidad Agosto 2027', date: new Date(now),
            balanceBefore: bal, balanceAfter: bal - bs,
          });
          bal -= bs;
        }
        const monthlyStart = new Date(feeConfig.monthlyFeeStartDate);
        if (now >= monthlyStart) {
          const year = now.getFullYear();
          const month = now.getMonth();
          const desc = `Mensualidad ${monthNames[month]} ${year}`;
          if (!s.transactions.find(tx => tx.description === desc)) {
            const exon = s.exonerationPercent / 100;
            const usd = Math.round(feeConfig.monthlyFeeUSD * (1 - exon) * 100) / 100;
            const bs = Math.round(usd * bcv * 100) / 100;
            txs.push({
              id: Date.now().toString(36) + Math.random().toString(36),
              type: 'fee', amountBS: bs, amountUSD: usd, bcvRate: bcv,
              description: desc, date: new Date(now),
              balanceBefore: bal, balanceAfter: bal - bs,
            });
            bal -= bs;
          }
        }

        return {
          ...s, status: 'regular', activationDate: new Date(now),
          hasPaidInscription: true, balance: bal,
          transactions: [...s.transactions, ...txs],
        };
      })
    );
  }, [currentDate, feeConfig, bcvRate]);

  const advanceWeek = useCallback(() => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
    setStudents(prev =>
      prev.map(s => {
        if (s.status !== 'regular') return s;
        const now = new Date(currentDate);
        const monthlyStart = new Date(feeConfig.monthlyFeeStartDate);
        if (now < monthlyStart) return s;
        const year = now.getFullYear();
        const month = now.getMonth();
        const desc = `Mensualidad ${monthNames[month]} ${year}`;
        if (s.transactions.find(tx => tx.description === desc)) return s;
        const exon = s.exonerationPercent / 100;
        const usd = Math.round(feeConfig.monthlyFeeUSD * (1 - exon) * 100) / 100;
        const bcv = bcvRate;
        const bs = Math.round(usd * bcv * 100) / 100;
        const tx: SimulatedTransaction = {
          id: Date.now().toString(36) + Math.random().toString(36),
          type: 'fee', amountBS: bs, amountUSD: usd, bcvRate: bcv,
          description: desc, date: new Date(now),
          balanceBefore: s.balance, balanceAfter: s.balance - bs,
        };
        return { ...s, balance: s.balance - bs, transactions: [...s.transactions, tx] };
      })
    );
  }, [currentDate, feeConfig, bcvRate]);

  const simulatePayment = useCallback((studentId: string, amountUSD: number) => {
    const bcv = bcvRate;
    const amountBS = Math.round(amountUSD * bcv * 100) / 100;
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId) return s;
        const tx: SimulatedTransaction = {
          id: Date.now().toString(36) + Math.random().toString(36),
          type: 'deposit', amountBS, amountUSD, bcvRate: bcv,
          description: `Depósito manual ($${amountUSD})`, date: new Date(currentDate),
          balanceBefore: s.balance, balanceAfter: s.balance + amountBS,
        };
        return { ...s, balance: s.balance + amountBS, transactions: [...s.transactions, tx] };
      })
    );
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId || s.status !== 'regular') return s;
        const today = new Date(currentDate);
        if (today.getDate() > feeConfig.prontoPagoDeadlineDay) return s;
        const year = today.getFullYear();
        const month = today.getMonth();
        const desc = `Mensualidad ${monthNames[month]} ${year}`;
        const feeTx = s.transactions.find(tx => tx.description === desc);
        if (feeTx) {
          const discountUSD = feeConfig.prontoPagoDiscount;
          const discountBS = Math.round(discountUSD * bcv * 100) / 100;
          const discTx: SimulatedTransaction = {
            id: Date.now().toString(36) + Math.random().toString(36),
            type: 'adjustment', amountBS: discountBS, amountUSD: discountUSD, bcvRate: bcv,
            description: `Descuento Pronto Pago ${monthNames[month]} ${year}`,
            date: new Date(currentDate), balanceBefore: s.balance, balanceAfter: s.balance + discountBS,
          };
          return { ...s, balance: s.balance + discountBS, transactions: [...s.transactions, discTx] };
        }
        return s;
      })
    );
  }, [currentDate, feeConfig, bcvRate]);

  const checkDepositLimit = (studentId: string): boolean => {
    const s = students.find(st => st.id === studentId);
    if (!s) return false;
    const now = new Date(currentDate);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const depositsThisMonth = s.transactions.filter(
      tx => tx.type === 'deposit' && new Date(tx.date) >= monthStart && new Date(tx.date) <= monthEnd
    ).length;
    return depositsThisMonth >= 2;
  };

  return {
    students, currentDate, feeConfig, bcvRate,
    addStudent, removeStudent, activateStudent,
    advanceWeek, simulatePayment, checkDepositLimit,
    setCurrentDate, setFeeConfig, setBcvRate,
  };
};

// ---------------------------------------------------------------------------
// Componente Visual
// ---------------------------------------------------------------------------
const SimuladorCobros: React.FC = () => {
  const {
    students, currentDate, feeConfig, bcvRate,
    addStudent, removeStudent, activateStudent,
    advanceWeek, simulatePayment, checkDepositLimit,
    setCurrentDate, setFeeConfig, setBcvRate,
  } = useSimulation();

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('100');
  const [showFeeEditor, setShowFeeEditor] = useState(false);

  const selected = students.find(s => s.id === selectedStudent) || null;

  const handleDateChange = (value: string) => setCurrentDate(new Date(value));

  const handlePay = () => {
    if (!selected) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) { toast.error('Monto inválido'); return; }
    if (checkDepositLimit(selected.id)) { toast.error('Límite de 2 abonos mensuales alcanzado'); return; }
    simulatePayment(selected.id, amount);
    toast.success(`Pago de $${amount} simulado`);
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('es-VE', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
    >
      {/* Cabecera azul */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl shadow-lg p-5 mb-6 text-white">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Simulador de Cobros</h2>
        <p className="text-blue-100 mt-1 text-base sm:text-lg">Prueba la lógica de facturación en tiempo real</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
            <FaCalendarAlt className="text-xl" />
            <input type="date" value={currentDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-white font-semibold text-base focus:outline-none" />
          </div>
          <button onClick={advanceWeek}
            className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 hover:bg-white/30 transition text-base font-semibold">
            <FaForward className="text-lg" /> Avanzar semana
          </button>
          <button onClick={() => setShowFeeEditor(!showFeeEditor)}
            className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 hover:bg-white/30 transition text-base font-semibold">
            <FaCog className="text-lg" /> {showFeeEditor ? 'Ocultar tarifas' : 'Editar tarifas'}
          </button>
        </div>
        {showFeeEditor && (
          <div className="mt-4 bg-white/10 rounded-xl p-4">
            <h4 className="text-lg font-bold mb-3 text-white">Configuración de tarifas simuladas</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <div><label className="text-white font-semibold block mb-1 text-sm">Inscripción (USD)</label>
                <input type="number" value={feeConfig.inscriptionFeeUSD}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, inscriptionFeeUSD: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-white/20 rounded px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white" /></div>
              <div><label className="text-white font-semibold block mb-1 text-sm">Mensualidad (USD)</label>
                <input type="number" value={feeConfig.monthlyFeeUSD}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, monthlyFeeUSD: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-white/20 rounded px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white" /></div>
              <div><label className="text-white font-semibold block mb-1 text-sm">Desc. pronto pago (USD)</label>
                <input type="number" value={feeConfig.prontoPagoDiscount}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, prontoPagoDiscount: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-white/20 rounded px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white" /></div>
              <div><label className="text-white font-semibold block mb-1 text-sm">Día límite pronto pago</label>
                <input type="number" min="1" max="31" value={feeConfig.prontoPagoDeadlineDay}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, prontoPagoDeadlineDay: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-white/20 rounded px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white" /></div>
              <div><label className="text-white font-semibold block mb-1 text-sm">Gasto admin. (USD)</label>
                <input type="number" value={feeConfig.administrativeFeeUSD}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, administrativeFeeUSD: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-white/20 rounded px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white" /></div>
              <div><label className="text-white font-semibold block mb-1 text-sm">Anticipo Ago 2027 (USD)</label>
                <input type="number" value={feeConfig.august2027HalfPaymentUSD}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, august2027HalfPaymentUSD: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-white/20 rounded px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white" /></div>
              <div><label className="text-white font-semibold block mb-1 text-sm">Inicio mensualidades</label>
                <input type="date" value={feeConfig.monthlyFeeStartDate}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, monthlyFeeStartDate: e.target.value }))}
                  className="w-full bg-white/20 rounded px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white" /></div>
              <div><label className="text-white font-semibold block mb-1 text-sm">Inicio inscripciones</label>
                <input type="date" value={feeConfig.inscriptionStartDate}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, inscriptionStartDate: e.target.value }))}
                  className="w-full bg-white/20 rounded px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white" /></div>
              <div><label className="text-white font-semibold block mb-1 text-sm">Fin inscripciones</label>
                <input type="date" value={feeConfig.inscriptionEndDate}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, inscriptionEndDate: e.target.value }))}
                  className="w-full bg-white/20 rounded px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white" /></div>
              <div><label className="text-white font-semibold block mb-1 text-sm">Tasa BCV (Bs/USD)</label>
                <input type="number" value={bcvRate}
                  onChange={(e) => setBcvRate(parseFloat(e.target.value) || 1)}
                  className="w-full bg-white/20 rounded px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white" /></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Panel izquierdo: lista de estudiantes */}
        <div className="lg:w-1/3 bg-white rounded-xl shadow-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Estudiantes</h3>
            <button onClick={addStudent}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
              <FaPlus className="text-lg" />
            </button>
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {students.map(s => (
              <div key={s.id} onClick={() => setSelectedStudent(s.id)}
                className={`p-3 rounded-xl cursor-pointer transition border ${
                  selected?.id === s.id ? 'border-blue-500 bg-blue-50 shadow' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-800">{s.fullName}</span>
                  <span className={`text-sm px-2 py-0.5 rounded-full font-semibold ${
                    s.status === 'regular' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {s.status === 'regular' ? 'Activo' : 'Pendiente'}
                  </span>
                </div>
                <div className="text-base text-gray-600 mt-1">Balance: <span className="font-bold">{s.balance.toFixed(2)} Bs</span></div>
              </div>
            ))}
            {students.length === 0 && <p className="text-gray-500 text-center py-10 text-base">Agrega un estudiante para comenzar</p>}
          </div>
        </div>

        {/* Panel derecho: detalle y acciones */}
        <div className="lg:w-2/3 bg-white rounded-xl shadow-lg p-5">
          {selected ? (
            <>
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-800">{selected.fullName}</h3>
                  <div className="text-base text-gray-600 mt-1 space-y-0.5">
                    <p>Estado: <span className={`font-bold ${selected.status === 'regular' ? 'text-green-600' : 'text-yellow-600'}`}>{selected.status === 'regular' ? 'Activo' : 'Pendiente'}</span>
                      {selected.activationDate && ` · Activado: ${formatDate(selected.activationDate)}`}</p>
                    <p>Exoneración: {selected.exonerationPercent}% · Inscripción pagada: {selected.hasPaidInscription ? 'Sí' : 'No'}</p>
                    <p className="text-xl font-bold mt-1">Balance: <span className={selected.balance < 0 ? 'text-red-600' : 'text-green-600'}>{selected.balance.toFixed(2)} Bs</span></p>
                  </div>
                </div>
                <button onClick={() => removeStudent(selected.id)} className="text-red-500 hover:text-red-700 p-2"><FaTrash className="text-xl" /></button>
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                {selected.status === 'pendiente' && (
                  <button onClick={() => activateStudent(selected.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-base font-bold shadow">
                    <FaUserCheck className="text-lg" /> Activar estudiante
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="$" />
                  <button onClick={handlePay}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-base font-bold shadow">
                    <FaMoneyBillWave className="text-lg" /> Pagar
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-xl text-gray-800 flex items-center gap-2 mb-3"><FaHistory className="text-blue-600" /> Historial de transacciones</h4>
              <div className="overflow-x-auto max-h-64 rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 text-left font-bold text-gray-700">Fecha</th>
                      <th className="py-2 px-3 text-left font-bold text-gray-700">Tipo</th>
                      <th className="py-2 px-3 text-left font-bold text-gray-700">Descripción</th>
                      <th className="py-2 px-3 text-right font-bold text-gray-700">Monto Bs</th>
                      <th className="py-2 px-3 text-right font-bold text-gray-700">Monto USD</th>
                      <th className="py-2 px-3 text-right font-bold text-gray-700">Tasa BCV</th>
                      <th className="py-2 px-3 text-right font-bold text-gray-700">Balance Bs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selected.transactions.slice().reverse().map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-600">{formatDate(new Date(tx.date))}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            tx.type === 'fee' ? 'bg-red-100 text-red-700' : tx.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {tx.type === 'fee' ? 'Cargo' : tx.type === 'deposit' ? 'Pago' : 'Ajuste'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-800">{tx.description}</td>
                        <td className={`py-2 px-3 text-right font-bold ${tx.type === 'deposit' || tx.type === 'adjustment' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'deposit' || tx.type === 'adjustment' ? '+' : '-'}{Math.abs(tx.amountBS).toFixed(2)} Bs
                        </td>
                        <td className="py-2 px-3 text-right text-gray-700 font-semibold">
                          {tx.type === 'deposit' || tx.type === 'adjustment' ? '+' : '-'}${Math.abs(tx.amountUSD).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-600">{tx.bcvRate.toFixed(4)}</td>
                        <td className="py-2 px-3 text-right text-gray-700 font-semibold">{tx.balanceAfter.toFixed(2)} Bs</td>
                      </tr>
                    ))}
                    {selected.transactions.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-4 text-gray-500 text-sm">Sin transacciones</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 text-base">Selecciona un estudiante para ver sus detalles</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SimuladorCobros;