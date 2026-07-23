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
  amount: number;
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

// Valores iniciales (simulados)
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

// Tasa BCV simulada (puede editarse)
const SIMULATED_BCV_RATE = 40;

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// ---------------------------------------------------------------------------
// Lógica de simulación (idéntica a BillingService)
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

  // --------------------------------------------------
  // Activar estudiante (simula applyInscriptionFees)
  // --------------------------------------------------
  const activateStudent = useCallback((studentId: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId || s.status === 'regular') return s;
        const txs: SimulatedTransaction[] = [];
        let bal = s.balance;
        const now = new Date(currentDate);
        const bcv = bcvRate;

        // Inscripción
        if (!s.hasPaidInscription) {
          const amount = Math.round(feeConfig.inscriptionFeeUSD * bcv * 100) / 100;
          txs.push({
            id: Date.now().toString(36) + Math.random().toString(36),
            type: 'fee',
            amount,
            description: 'Inscripción año escolar',
            date: new Date(now),
            balanceBefore: bal,
            balanceAfter: bal - amount,
          });
          bal -= amount;
        }
        // Gasto administrativo (nuevo ingreso)
        if (!s.hasPaidInscription && s.transactions.length === 0) {
          const admin = Math.round(feeConfig.administrativeFeeUSD * bcv * 100) / 100;
          txs.push({
            id: Date.now().toString(36) + Math.random().toString(36),
            type: 'fee',
            amount: admin,
            description: 'Gasto administrativo (nuevo ingreso)',
            date: new Date(now),
            balanceBefore: bal,
            balanceAfter: bal - admin,
          });
          bal -= admin;
        }
        // 50% agosto 2027
        if (!s.hasPaidInscription) {
          const half = Math.round(feeConfig.august2027HalfPaymentUSD * bcv * 100) / 100;
          txs.push({
            id: Date.now().toString(36) + Math.random().toString(36),
            type: 'fee',
            amount: half,
            description: 'Anticipo 50% mensualidad Agosto 2027',
            date: new Date(now),
            balanceBefore: bal,
            balanceAfter: bal - half,
          });
          bal -= half;
        }
        // Mensualidad del mes en curso si ya comenzaron las mensualidades
        const monthlyStart = new Date(feeConfig.monthlyFeeStartDate);
        if (now >= monthlyStart) {
          const year = now.getFullYear();
          const month = now.getMonth();
          const desc = `Mensualidad ${monthNames[month]} ${year}`;
          const exists = s.transactions.find(tx => tx.description === desc);
          if (!exists) {
            const exon = s.exonerationPercent / 100;
            let monthlyUSD = feeConfig.monthlyFeeUSD * (1 - exon);
            monthlyUSD = Math.round(monthlyUSD * 100) / 100;
            const monthlyBS = Math.round(monthlyUSD * bcv * 100) / 100;
            txs.push({
              id: Date.now().toString(36) + Math.random().toString(36),
              type: 'fee',
              amount: monthlyBS,
              description: desc,
              date: new Date(now),
              balanceBefore: bal,
              balanceAfter: bal - monthlyBS,
            });
            bal -= monthlyBS;
          }
        }

        return {
          ...s,
          status: 'regular',
          activationDate: new Date(now),
          hasPaidInscription: true,
          balance: bal,
          transactions: [...s.transactions, ...txs],
        };
      })
    );
  }, [currentDate, feeConfig, bcvRate]);

  // --------------------------------------------------
  // Avanzar un mes (aplica mensualidad a todos los regulares)
  // --------------------------------------------------
  const advanceMonth = useCallback(() => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
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
        let monthlyUSD = feeConfig.monthlyFeeUSD * (1 - exon);
        monthlyUSD = Math.round(monthlyUSD * 100) / 100;
        const bcv = bcvRate;
        const amount = Math.round(monthlyUSD * bcv * 100) / 100;
        const tx: SimulatedTransaction = {
          id: Date.now().toString(36) + Math.random().toString(36),
          type: 'fee',
          amount,
          description: desc,
          date: new Date(now),
          balanceBefore: s.balance,
          balanceAfter: s.balance - amount,
        };
        return {
          ...s,
          balance: s.balance - amount,
          transactions: [...s.transactions, tx],
        };
      })
    );
  }, [currentDate, feeConfig, bcvRate]);

  // --------------------------------------------------
  // Simular un depósito (pago)
  // --------------------------------------------------
  const simulatePayment = useCallback((studentId: string, amountUSD: number) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId) return s;
        const amountBS = Math.round(amountUSD * bcvRate * 100) / 100;
        const tx: SimulatedTransaction = {
          id: Date.now().toString(36) + Math.random().toString(36),
          type: 'deposit',
          amount: amountBS,
          description: `Depósito manual ($${amountUSD})`,
          date: new Date(currentDate),
          balanceBefore: s.balance,
          balanceAfter: s.balance + amountBS,
        };
        return {
          ...s,
          balance: s.balance + amountBS,
          transactions: [...s.transactions, tx],
        };
      })
    );
    // Aplicar pronto pago si corresponde
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
          const discountBS = Math.round(feeConfig.prontoPagoDiscount * bcvRate * 100) / 100;
          const discTx: SimulatedTransaction = {
            id: Date.now().toString(36) + Math.random().toString(36),
            type: 'adjustment',
            amount: discountBS,
            description: `Descuento Pronto Pago ${monthNames[month]} ${year}`,
            date: new Date(currentDate),
            balanceBefore: s.balance,
            balanceAfter: s.balance + discountBS,
          };
          return {
            ...s,
            balance: s.balance + discountBS,
            transactions: [...s.transactions, discTx],
          };
        }
        return s;
      })
    );
  }, [currentDate, feeConfig, bcvRate]);

  // --------------------------------------------------
  // Verificar límite de abonos (simulado)
  // --------------------------------------------------
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
    students,
    currentDate,
    feeConfig,
    bcvRate,
    addStudent,
    removeStudent,
    activateStudent,
    advanceMonth,
    simulatePayment,
    checkDepositLimit,
    setCurrentDate,
    setFeeConfig,
    setBcvRate,
  };
};

// ---------------------------------------------------------------------------
// Componente Visual
// ---------------------------------------------------------------------------
const SimuladorCobros: React.FC = () => {
  const {
    students,
    currentDate,
    feeConfig,
    bcvRate,
    addStudent,
    removeStudent,
    activateStudent,
    advanceMonth,
    simulatePayment,
    checkDepositLimit,
    setCurrentDate,
    setFeeConfig,
    setBcvRate,
  } = useSimulation();

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('100');
  const [showFeeEditor, setShowFeeEditor] = useState(false);

  const selected = students.find(s => s.id === selectedStudent) || null;

  const handleDateChange = (value: string) => {
    setCurrentDate(new Date(value));
  };

  const handlePay = () => {
    if (!selected) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Monto inválido');
      return;
    }
    if (checkDepositLimit(selected.id)) {
      toast.error('Límite de 2 abonos mensuales alcanzado');
      return;
    }
    simulatePayment(selected.id, amount);
    toast.success(`Pago de $${amount} simulado`);
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('es-VE', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-full mx-auto px-6 sm:px-10 lg:px-14 py-8"
    >
      {/* Cabecera */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 mb-10 text-white">
        <h2 className="text-4xl font-extrabold tracking-tight">Simulador de Cobros</h2>
        <p className="text-purple-100 mt-2 text-xl">Prueba la lógica de facturación en tiempo real</p>
        <div className="flex flex-wrap gap-5 mt-6">
          <div className="flex items-center gap-3 bg-white/20 rounded-lg px-5 py-3">
            <FaCalendarAlt className="text-2xl" />
            <input
              type="date"
              value={currentDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-white font-bold text-lg focus:outline-none"
            />
          </div>
          <button
            onClick={advanceMonth}
            className="flex items-center gap-3 bg-white/20 rounded-lg px-5 py-3 hover:bg-white/30 transition text-lg font-semibold"
          >
            <FaForward className="text-xl" /> Avanzar mes
          </button>
          <button
            onClick={() => setShowFeeEditor(!showFeeEditor)}
            className="flex items-center gap-3 bg-white/20 rounded-lg px-5 py-3 hover:bg-white/30 transition text-lg font-semibold"
          >
            <FaCog className="text-xl" /> {showFeeEditor ? 'Ocultar tarifas' : 'Editar tarifas'}
          </button>
        </div>
        {showFeeEditor && (
          <div className="mt-6 bg-white/10 rounded-xl p-6">
            <h4 className="text-xl font-bold mb-4 text-white">Configuración de tarifas simuladas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="text-white font-semibold block mb-1 text-lg">Inscripción (USD)</label>
                <input
                  type="number"
                  value={feeConfig.inscriptionFeeUSD}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, inscriptionFeeUSD: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-white/20 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label className="text-white font-semibold block mb-1 text-lg">Mensualidad (USD)</label>
                <input
                  type="number"
                  value={feeConfig.monthlyFeeUSD}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, monthlyFeeUSD: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-white/20 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label className="text-white font-semibold block mb-1 text-lg">Descuento pronto pago (USD)</label>
                <input
                  type="number"
                  value={feeConfig.prontoPagoDiscount}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, prontoPagoDiscount: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-white/20 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label className="text-white font-semibold block mb-1 text-lg">Día límite pronto pago</label>
                <input
                  type="number"
                  min="1" max="31"
                  value={feeConfig.prontoPagoDeadlineDay}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, prontoPagoDeadlineDay: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-white/20 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label className="text-white font-semibold block mb-1 text-lg">Gasto administrativo (USD)</label>
                <input
                  type="number"
                  value={feeConfig.administrativeFeeUSD}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, administrativeFeeUSD: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-white/20 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label className="text-white font-semibold block mb-1 text-lg">Anticipo agosto 2027 (USD)</label>
                <input
                  type="number"
                  value={feeConfig.august2027HalfPaymentUSD}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, august2027HalfPaymentUSD: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-white/20 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label className="text-white font-semibold block mb-1 text-lg">Inicio mensualidades</label>
                <input
                  type="date"
                  value={feeConfig.monthlyFeeStartDate}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, monthlyFeeStartDate: e.target.value }))}
                  className="w-full bg-white/20 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label className="text-white font-semibold block mb-1 text-lg">Inicio inscripciones</label>
                <input
                  type="date"
                  value={feeConfig.inscriptionStartDate}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, inscriptionStartDate: e.target.value }))}
                  className="w-full bg-white/20 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label className="text-white font-semibold block mb-1 text-lg">Fin inscripciones</label>
                <input
                  type="date"
                  value={feeConfig.inscriptionEndDate}
                  onChange={(e) => setFeeConfig(prev => ({ ...prev, inscriptionEndDate: e.target.value }))}
                  className="w-full bg-white/20 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label className="text-white font-semibold block mb-1 text-lg">Tasa BCV (Bs/USD)</label>
                <input
                  type="number"
                  value={bcvRate}
                  onChange={(e) => setBcvRate(parseFloat(e.target.value) || 1)}
                  className="w-full bg-white/20 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Panel izquierdo: lista de estudiantes */}
        <div className="lg:w-1/3 bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-extrabold text-gray-800">Estudiantes</h3>
            <button
              onClick={addStudent}
              className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition transform hover:scale-105"
            >
              <FaPlus className="text-xl" />
            </button>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {students.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedStudent(s.id)}
                className={`p-5 rounded-2xl cursor-pointer transition border-2 ${
                  selected?.id === s.id
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xl text-gray-800">{s.fullName}</span>
                  <span className={`text-base px-3 py-1 rounded-full font-semibold ${
                    s.status === 'regular' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {s.status === 'regular' ? 'Activo' : 'Pendiente'}
                  </span>
                </div>
                <div className="text-lg text-gray-600 mt-2">
                  Balance: <span className="font-bold">{s.balance.toFixed(2)} Bs</span>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-gray-500 text-center py-12 text-xl">Agrega un estudiante para comenzar</p>
            )}
          </div>
        </div>

        {/* Panel derecho: detalle y acciones */}
        <div className="lg:w-2/3 bg-white rounded-2xl shadow-xl p-8">
          {selected ? (
            <>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-800">{selected.fullName}</h3>
                  <div className="text-xl text-gray-600 mt-2 space-y-1">
                    <p>
                      Estado: <span className={`font-bold ${selected.status === 'regular' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selected.status === 'regular' ? 'Activo' : 'Pendiente'}
                      </span>
                      {selected.activationDate && ` · Activado: ${formatDate(selected.activationDate)}`}
                    </p>
                    <p>
                      Exoneración: {selected.exonerationPercent}% · Inscripción pagada: {selected.hasPaidInscription ? 'Sí' : 'No'}
                    </p>
                    <p className="text-2xl font-bold mt-3">
                      Balance: <span className={selected.balance < 0 ? 'text-red-600' : 'text-green-600'}>
                        {selected.balance.toFixed(2)} Bs
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeStudent(selected.id)}
                  className="text-red-500 hover:text-red-700 p-3 transition"
                >
                  <FaTrash className="text-2xl" />
                </button>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap gap-4 mb-8">
                {selected.status === 'pendiente' && (
                  <button
                    onClick={() => activateStudent(selected.id)}
                    className="flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition text-lg font-bold shadow-md"
                  >
                    <FaUserCheck className="text-xl" /> Activar estudiante
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-28 border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="$"
                  />
                  <button
                    onClick={handlePay}
                    className="flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition text-lg font-bold shadow-md"
                  >
                    <FaMoneyBillWave className="text-xl" /> Pagar
                  </button>
                </div>
              </div>

              {/* Historial de transacciones */}
              <h4 className="font-extrabold text-2xl text-gray-800 flex items-center gap-3 mb-4">
                <FaHistory className="text-indigo-600" /> Historial de transacciones
              </h4>
              <div className="overflow-x-auto max-h-80 rounded-xl border border-gray-200">
                <table className="min-w-full text-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-4 px-4 text-left font-bold text-gray-700">Fecha</th>
                      <th className="py-4 px-4 text-left font-bold text-gray-700">Tipo</th>
                      <th className="py-4 px-4 text-left font-bold text-gray-700">Descripción</th>
                      <th className="py-4 px-4 text-right font-bold text-gray-700">Monto</th>
                      <th className="py-4 px-4 text-right font-bold text-gray-700">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selected.transactions.slice().reverse().map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{formatDate(new Date(tx.date))}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-base font-semibold ${
                            tx.type === 'fee' ? 'bg-red-100 text-red-700' :
                            tx.type === 'deposit' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {tx.type === 'fee' ? 'Cargo' : tx.type === 'deposit' ? 'Pago' : 'Ajuste'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-800">{tx.description}</td>
                        <td className={`py-3 px-4 text-right font-bold ${
                          tx.type === 'deposit' || tx.type === 'adjustment' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'adjustment' ? '+' : '-'}
                          {Math.abs(tx.amount).toFixed(2)} Bs
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700 font-semibold">{tx.balanceAfter.toFixed(2)} Bs</td>
                      </tr>
                    ))}
                    {selected.transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-gray-500 text-lg">Sin transacciones</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500 text-xl">
              Selecciona un estudiante para ver sus detalles
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SimuladorCobros;