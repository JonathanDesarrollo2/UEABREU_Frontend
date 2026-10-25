import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  cascadedValidationAPI,
  type BankValidationRequest,
  getStoredRateAPI,
  type BCVRateResponse,
} from '../../apis/bank';
import {
  getRepresentativeBalance,
  manualDeposit,
  getRepresentativeTransactions,
  checkReferenceKey,
} from '../../apis/balance';
import {
  FaUniversity,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaCreditCard,
  FaCalendarDay,
  FaFileInvoiceDollar,
  FaUserGraduate,
  FaHistory,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaPhone,
  FaTrash,
  FaFilePdf,
  FaExclamationCircle,
} from 'react-icons/fa';
import DeleteTransactionModal from '../../components/deleteTransactionModal';
import { useDetectedNivel } from '../../hooks/useDetectedNivel';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.vfs;

interface PaymentValidationProps {
  representativeId?: string;
  canDeletePayments?: boolean;
}

type StudentPayMode = 'full' | 'partial';

interface StudentPayConfig {
  selected: boolean;
  mode: StudentPayMode;
  partialUSD: string;
}

const DEFAULT_BANK_ACCOUNT = '01910107012100104749';
const DEFAULT_REQUEST_DATE = new Date().toISOString().split('T')[0];

const BANKS_LIST: { Name: string; Code: string }[] = [
  { Name: 'Banco de Venezuela, S.A.',                Code: '0102' },
  { Name: 'Banco Venezolano de Crédito, S.A.',        Code: '0104' },
  { Name: 'Banco Mercantil, C.A.',                    Code: '0105' },
  { Name: 'Banco Provincial, C.A.',                   Code: '0108' },
  { Name: 'Bancaribe, C.A.',                          Code: '0114' },
  { Name: 'Banco Exterior, C.A.',                     Code: '0115' },
  { Name: 'Banesco, S.A.C.A.',                        Code: '0134' },
  { Name: 'Bancamiga, C.A.',                          Code: '0172' },
  { Name: 'Banco Nacional de Crédito, C.A.',          Code: '0191' },
  { Name: 'Banco Bicentenario, C.A.',                 Code: '0175' },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'Transferencia',
  cash: 'Efectivo',
  debit_card: 'Tarjeta de Débito',
  credit_card: 'Tarjeta de Crédito',
  pago_movil: 'Pago Móvil',
  check: 'Cheque',
  zelle: 'Zelle',
};

const getBankName = (code?: string | null): string => {
  if (!code) return '—';
  const found = BANKS_LIST.find(b => b.Code === String(code));
  return found ? found.Name : `Banco ${code}`;
};

export default function PaymentValidation({
  representativeId: propRepId,
  canDeletePayments,
}: PaymentValidationProps = {}) {
  const { representativeId: urlRepId } = useParams<{ representativeId: string }>();
  const representativeId = propRepId || urlRepId || '';

  const detectedNivel = useDetectedNivel();
  const canDelete = canDeletePayments === true || detectedNivel === 2;

  // Estado del formulario bancario (referencia, cédula, teléfono, banco, fecha)
  const [bankForm, setBankForm] = useState({
    Reference: '',
    ClientID: '',
    PhoneNumber: '',
    BankCode: 102,
    RequestDate: DEFAULT_REQUEST_DATE,
  });

  const [loading, setLoading] = useState(false);
  const [loadingRate, setLoadingRate] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [bcvRate, setBcvRate] = useState<BCVRateResponse | null>(null);

  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [depositResult, setDepositResult] = useState<any>(null);
  const [depositLoading, setDepositLoading] = useState(false);

  // Configuración de pago por estudiante
  const [payConfig, setPayConfig] = useState<Record<string, StudentPayConfig>>({});

  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilters, setHistoryFilters] = useState({
    studentId: '',
    search: '',
    page: 1,
    limit: 5,
  });
  const [historyPagination, setHistoryPagination] = useState({ totalRecords: 0, totalPages: 1, currentPage: 1 });

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // ═══════════════════════════════════════════════════════════════
  // Tasa BCV
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const fetchBCVRate = async () => {
      try {
        setLoadingRate(true);
        const response = await getStoredRateAPI(bankForm.RequestDate);
        if (response.result && response.content) {
          setBcvRate(response.content);
        }
      } catch (err: any) {
        setBcvRate(null);
      } finally {
        setLoadingRate(false);
      }
    };
    fetchBCVRate();
  }, [bankForm.RequestDate]);

  // ═══════════════════════════════════════════════════════════════
  // Estudiantes
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const fetchStudents = async () => {
      if (!representativeId) return;
      try {
        setLoadingStudents(true);
        const res = await getRepresentativeBalance(representativeId);
        if (res.result && res.content.representative.students) {
          setStudents(res.content.representative.students);
        }
      } catch (err: any) {
        console.error('Error al cargar alumnos:', err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [representativeId]);

  // Inicializar config cuando cambian los estudiantes
  useEffect(() => {
    const initial: Record<string, StudentPayConfig> = {};
    students.forEach(s => {
      initial[s.id] = { selected: false, mode: 'full', partialUSD: '' };
    });
    setPayConfig(initial);
  }, [students]);

  // ═══════════════════════════════════════════════════════════════
  // Helpers de cálculo
  // ═══════════════════════════════════════════════════════════════
  const getDebtUSD = (studentId: string): number => {
    const s = students.find(x => x.id === studentId);
    if (!s) return 0;
    const bal = s.balance || 0;
    return bal < 0 ? Math.round(Math.abs(bal) * 100) / 100 : 0;
  };

  const getPayAmountUSD = (studentId: string): number => {
    const cfg = payConfig[studentId];
    if (!cfg || !cfg.selected) return 0;
    const debt = getDebtUSD(studentId);
    if (debt <= 0) return 0;
    if (cfg.mode === 'full') return debt;
    const partial = parseFloat(cfg.partialUSD) || 0;
    return Math.min(Math.max(0, partial), debt);
  };

  const totalUSD = Object.keys(payConfig).reduce(
    (sum, sid) => sum + getPayAmountUSD(sid),
    0
  );
  const totalBs = bcvRate
    ? Math.round(totalUSD * bcvRate.PriceRateBCV * 100) / 100
    : 0;

  // Validaciones
  const hasIncompletePartial = Object.keys(payConfig).some(sid => {
    const cfg = payConfig[sid];
    return cfg.selected
      && cfg.mode === 'partial'
      && (!cfg.partialUSD || parseFloat(cfg.partialUSD) <= 0);
  });
  const hasExcessPartial = Object.keys(payConfig).some(sid => {
    const cfg = payConfig[sid];
    if (!cfg.selected || cfg.mode !== 'partial') return false;
    const partial = parseFloat(cfg.partialUSD) || 0;
    return partial > getDebtUSD(sid) + 0.01;
  });

  const canSubmit =
    totalUSD > 0
    && totalBs > 0
    && bankForm.Reference.trim() !== ''
    && bankForm.ClientID.trim() !== ''
    && bankForm.PhoneNumber.trim() !== ''
    && !hasIncompletePartial
    && !hasExcessPartial;

  // ═══════════════════════════════════════════════════════════════
  // Historial
  // ═══════════════════════════════════════════════════════════════
  const fetchHistory = useCallback(async () => {
    if (!representativeId) return;
    setHistoryLoading(true);
    try {
      const res = await getRepresentativeTransactions(representativeId, {
        page: historyFilters.page,
        limit: historyFilters.limit,
        studentId: historyFilters.studentId || undefined,
        search: historyFilters.search || undefined,
      });
      if (res.result) {
        setHistory(res.content.transactions);
        setHistoryPagination(res.content.pagination);
      }
    } catch (err: any) {
      console.error('Error al cargar historial:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [representativeId, historyFilters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ═══════════════════════════════════════════════════════════════
  // Submit — validar con monto EXACTO calculado
  // ═══════════════════════════════════════════════════════════════
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError('');
    setResult(null);
    setDepositResult(null);

    try {
      // 1) Pre-check de referencia duplicada
      try {
        const refCheck = await checkReferenceKey(bankForm.Reference);
        if (refCheck?.result && refCheck?.content?.exists) {
          const existing = refCheck.content.existingTransaction;
          setError(
            `Ya existe un pago registrado con la misma clave (últimos 6 dígitos: ${refCheck.content.last6}). ` +
            `Referencia en sistema: ${existing?.reference || '—'}.`
          );
          return;
        }
      } catch (refErr: any) {
        console.warn('⚠️ Pre-check de referencia falló, continuando:', refErr);
      }

      // 2) Validación bancaria con el monto EXACTO
      const fullValidationData: BankValidationRequest = {
        AccountNumber: DEFAULT_BANK_ACCOUNT,
        BankCode: bankForm.BankCode,
        PhoneNumber: bankForm.PhoneNumber,
        ClientID: bankForm.ClientID,
        Reference: bankForm.Reference,
        RequestDate: `${bankForm.RequestDate}T00:00:00`,
        Amount: totalBs,
      };

      const response = await cascadedValidationAPI(fullValidationData);
      if (!response.result || !response.content) {
        setError(response.error?.[0] || 'Error desconocido en la validación');
        return;
      }

      setResult({
        ...response.content,
        message: response.content.message || (
          response.content.overallResult === 'success'
            ? 'Pago validado correctamente'
            : 'No se encontró el pago con los datos suministrados'
        ),
      });

      // 3) Si validó, registrar el depósito con distribución
      if (
        response.content.overallResult === 'success' &&
        response.content.message.includes('Pago verificado exitosamente')
      ) {
        setDepositLoading(true);
        try {
          // Construir distribución
          const distribution = Object.keys(payConfig)
            .filter(sid => {
              const cfg = payConfig[sid];
              return cfg.selected && getPayAmountUSD(sid) > 0;
            })
            .map(sid => ({
              studentId: sid,
              amountUSD: Math.round(getPayAmountUSD(sid) * 100) / 100,
            }));

          const depositPayload = {
            amount: totalBs,
            description: `Pago validado - Ref: ${bankForm.Reference}`,
            paymentMethod: 'pago_movil' as const,
            reference: bankForm.Reference,
            paymentDate: bankForm.RequestDate,
            bankCode: String(bankForm.BankCode),
            payerId: bankForm.ClientID,
            payerPhone: bankForm.PhoneNumber,
            distribution,
          };

          const depositRes = await manualDeposit(representativeId, depositPayload);
          setDepositResult(depositRes);
          fetchHistory();

          // Refrescar estudiantes
          const balRes = await getRepresentativeBalance(representativeId);
          if (balRes.result && balRes.content.representative.students) {
            setStudents(balRes.content.representative.students);
          }

          // Resetear formulario bancario
          setBankForm(prev => ({
            ...prev,
            Reference: '',
            ClientID: '',
            PhoneNumber: '',
          }));
        } catch (depErr: any) {
          const serverMessage =
            depErr?.response?.data?.error?.[0] ||
            depErr?.response?.data?.message ||
            depErr.message;
          setError(`Validación bancaria exitosa, pero error al registrar depósito: ${serverMessage}`);
        } finally {
          setDepositLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al realizar la validación');
    } finally {
      setLoading(false);
    }
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBankForm(prev => ({
      ...prev,
      [name]: name === 'BankCode' ? Number(value) : value,
    }));
  };

  const handleHistoryFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHistoryFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  // ═══════════════════════════════════════════════════════════════
  // Actualizar config de estudiante
  // ═══════════════════════════════════════════════════════════════
  const updateStudentConfig = (studentId: string, patch: Partial<StudentPayConfig>) => {
    setPayConfig(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], ...patch },
    }));
  };

  // ═══════════════════════════════════════════════════════════════
  // Recibo PDF
  // ═══════════════════════════════════════════════════════════════
  const handleDownloadReceipt = (tx: any) => {
    try {
      const receiptNumber = (tx.id || '').slice(0, 8).toUpperCase();
      const paymentDateStr = tx.transactionDate
        ? (() => {
            const d = String(tx.transactionDate).slice(0, 10);
            const [y, m, day] = d.split('-');
            return `${day}/${m}/${y}`;
          })()
        : '—';
      const registeredDateStr = tx.createdAt
        ? new Date(tx.createdAt).toLocaleString('es-VE')
        : '—';
      const amountBs = new Intl.NumberFormat('es-VE', {
        style: 'currency', currency: 'VES',
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      }).format(tx.amount || 0);
      const amountUsd = new Intl.NumberFormat('es-VE', {
        style: 'currency', currency: 'USD',
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      }).format(tx.amountUSD || 0);

      const distribution = tx.metadata?.distribution;

      const studentSection = Array.isArray(distribution) && distribution.length > 0
        ? {
            stack: [
              { text: 'DISTRIBUCIÓN', style: 'sectionTitle' },
              {
                table: {
                  widths: ['*', '25%', '25%'],
                  body: [
                    [
                      { text: 'Estudiante', style: 'cellKey' },
                      { text: 'USD', style: 'cellKey' },
                      { text: 'Bs', style: 'cellKey' },
                    ],
                    ...distribution.map((d: any) => [
                      { text: d.studentName || '—' },
                      { text: `$${(d.amountUSD || 0).toFixed(2)}` },
                      { text: `Bs ${(d.amountBs || 0).toFixed(2)}` },
                    ]),
                  ],
                },
                layout: 'lightHorizontalLines',
              },
            ],
          }
        : {
            stack: [
              { text: 'DATOS DEL ESTUDIANTE', style: 'sectionTitle' },
              { text: `Nombre: ${tx.student?.fullName || '—'}` },
              { text: `Año/Sección: ${tx.student?.currentGrade || '—'}${tx.student?.section ? ' — ' + tx.student.section : ''}` },
            ],
          };

      const docDefinition: any = {
        pageSize: 'A5',
        pageMargins: [28, 28, 28, 28],
        content: [
          { text: 'U.E. JOSÉ ANTONIO ABREU', style: 'header' },
          { text: 'RIF: J-505275356', style: 'subheader' },
          { text: 'Naguanagua — Estado Carabobo', style: 'subheader' },
          { text: 'RECIBO DE PAGO', style: 'title' },
          { text: `N° ${receiptNumber}`, style: 'receiptNumber' },
          { text: '\n' },

          { text: 'DATOS DEL REPRESENTANTE', style: 'sectionTitle' },
          {
            columns: [
              {
                stack: [
                  { text: `Nombre: ${tx.representative?.fullName || '—'}` },
                  { text: `Cédula: ${tx.representative?.identityCard || '—'}` },
                ],
              },
              {
                stack: [
                  { text: `Fecha de emisión: ${registeredDateStr}`, alignment: 'right' },
                  { text: `Estado: ${tx.displayStatus || tx.status || '—'}`, alignment: 'right' },
                ],
              },
            ],
          },
          { text: '\n' },

          studentSection,
          { text: '\n' },

          { text: 'DETALLE DEL PAGO', style: 'sectionTitle' },
          {
            table: {
              widths: ['35%', '*'],
              body: [
                [{ text: 'Concepto', style: 'cellKey' }, { text: tx.description || '—' }],
                [{ text: 'Método de pago', style: 'cellKey' }, { text: PAYMENT_METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod || '—' }],
                [{ text: 'Referencia', style: 'cellKey' }, { text: tx.reference || '—' }],
                [{ text: 'Fecha del pago', style: 'cellKey' }, { text: paymentDateStr }],
                [{ text: 'Banco emisor', style: 'cellKey' }, { text: getBankName(tx.bankCode) }],
                [{ text: 'Tasa BCV', style: 'cellKey' }, { text: tx.bcvRate ? `${Number(tx.bcvRate).toFixed(4)} Bs/USD` : '—' }],
                [{ text: 'Monto total (Bs)', style: 'cellKey' }, { text: amountBs, bold: true }],
                [{ text: 'Monto total (USD)', style: 'cellKey' }, { text: amountUsd, bold: true }],
              ],
            },
            layout: 'lightHorizontalLines',
          },
          { text: '\n\n\n\n' },

          {
            columns: [
              {
                stack: [
                  { text: '_________________________________' },
                  { text: 'Firma del Representante', alignment: 'center', fontSize: 8 },
                ],
                alignment: 'center',
              },
              {
                stack: [
                  { text: '_________________________________' },
                  { text: 'Sello de la Institución', alignment: 'center', fontSize: 8 },
                ],
                alignment: 'center',
              },
            ],
          },
          { text: '\n' },
          {
            text: 'Este recibo es un comprobante de pago registrado en el sistema. Conserve este documento para cualquier aclaración.',
            style: 'footer',
          },
        ],
        styles: {
          header: { fontSize: 13, bold: true, alignment: 'center' },
          subheader: { fontSize: 8, alignment: 'center', color: '#555' },
          title: { fontSize: 11, bold: true, alignment: 'center', margin: [0, 12, 0, 0], color: '#1e3a8a' },
          receiptNumber: { fontSize: 9, alignment: 'center', color: '#666', margin: [0, 2, 0, 0] },
          sectionTitle: { fontSize: 9, bold: true, margin: [0, 8, 0, 4], color: '#1e3a8a' },
          cellKey: { bold: true, fontSize: 8.5, color: '#444' },
          footer: { fontSize: 7, alignment: 'center', color: '#888', italics: true, margin: [0, 4, 0, 0] },
        },
        defaultStyle: { fontSize: 8.5, lineHeight: 1.2 },
      };

      pdfMake
        .createPdf(docDefinition)
        .download(`Recibo_${tx.reference || receiptNumber}.pdf`);
    } catch (err: any) {
      console.error('Error al generar recibo:', err);
      alert('No se pudo generar el recibo. Intente nuevamente.');
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // Formatters
  // ═══════════════════════════════════════════════════════════════
  const formatBCVDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2]}`;
    return dateStr;
  };
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const formatBs = (amount: number) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };
  const formatUsd = (amount: number) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const getStatusIcon = (overallResult: string) => {
    switch (overallResult) {
      case 'success': return <FaCheckCircle className="text-3xl text-green-500" />;
      case 'manual_review': return <FaExclamationTriangle className="text-3xl text-yellow-500" />;
      default: return <FaTimesCircle className="text-3xl text-red-500" />;
    }
  };
  const getStatusColor = (overallResult: string) => {
    switch (overallResult) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'manual_review': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-red-50 border-red-200';
    }
  };
  const getStatusTextColor = (overallResult: string) => {
    switch (overallResult) {
      case 'success': return 'text-green-800';
      case 'manual_review': return 'text-yellow-800';
      default: return 'text-red-800';
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  const studentsWithDebt = students.filter(s => (s.balance || 0) < 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl shadow-md">
                <FaUniversity className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Validación de Pagos Bancarios</h1>
                <p className="text-gray-600">Sistema de verificación en cascada - BNC</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-2">
              <div className="flex items-center space-x-2">
                <FaExchangeAlt className="text-blue-600 text-sm" />
                <div className="text-right">
                  {loadingRate ? (
                    <div className="flex items-center space-x-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-blue-700 text-xs">Cargando...</span>
                    </div>
                  ) : bcvRate ? (
                    <>
                      <p className="text-blue-800 font-bold text-sm">{bcvRate.PriceRateBCV.toFixed(2)} Bs/USD</p>
                      <p className="text-blue-600 text-xs">BCV {formatBCVDate(bcvRate.dtRate)}</p>
                    </>
                  ) : (
                    <p className="text-blue-700 text-xs">No disponible</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ══════════════════════════════════════════════ */}
              {/* PASO 1: Selección de estudiantes              */}
              {/* ══════════════════════════════════════════════ */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <FaUserGraduate className="text-lg text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Paso 1: ¿A quién vas a pagar?</h2>
                </div>

                {loadingStudents ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                    <span className="ml-2 text-sm text-indigo-700">Cargando estudiantes...</span>
                  </div>
                ) : studentsWithDebt.length === 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <FaCheckCircle className="mx-auto text-2xl text-green-600 mb-2" />
                    <p className="text-green-800 font-semibold">No hay estudiantes con deuda pendiente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentsWithDebt.map(student => {
                      const debt = getDebtUSD(student.id);
                      const cfg = payConfig[student.id] || { selected: false, mode: 'full', partialUSD: '' };
                      const payUSD = getPayAmountUSD(student.id);
                      const payBs = bcvRate ? Math.round(payUSD * bcvRate.PriceRateBCV * 100) / 100 : 0;

                      return (
                        <div
                          key={student.id}
                          className={`border rounded-xl p-4 transition ${
                            cfg.selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cfg.selected}
                              onChange={e => updateStudentConfig(student.id, { selected: e.target.checked })}
                              className="w-5 h-5 mt-1 accent-indigo-600"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{student.fullName}</p>
                              <p className="text-sm text-gray-600">
                                {student.currentGrade || 'Sin grado'} — {student.section || '—'}
                              </p>
                              <p className="text-sm text-red-600 font-medium mt-1">
                                Deuda: {formatUsd(debt)} (≈ {formatBs(debt * (bcvRate?.PriceRateBCV || 0))})
                              </p>
                            </div>
                          </label>

                          {cfg.selected && (
                            <div className="mt-3 pl-8 space-y-3 border-t border-indigo-200 pt-3">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`mode-${student.id}`}
                                  checked={cfg.mode === 'full'}
                                  onChange={() => updateStudentConfig(student.id, { mode: 'full', partialUSD: '' })}
                                  className="accent-indigo-600"
                                />
                                <span className="text-sm">
                                  Pagar totalidad: <strong>{formatUsd(debt)}</strong>
                                </span>
                              </label>

                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`mode-${student.id}`}
                                  checked={cfg.mode === 'partial'}
                                  onChange={() => updateStudentConfig(student.id, { mode: 'partial' })}
                                  className="accent-indigo-600"
                                />
                                <span className="text-sm">Pago parcial</span>
                              </label>

                              {cfg.mode === 'partial' && (
                                <div className="ml-7">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Monto a pagar (USD)
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={debt}
                                        value={cfg.partialUSD}
                                        onChange={e => updateStudentConfig(student.id, { partialUSD: e.target.value })}
                                        placeholder="0.00"
                                        className="w-32 pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      ≈ {formatBs((parseFloat(cfg.partialUSD) || 0) * (bcvRate?.PriceRateBCV || 0))}
                                    </span>
                                    {hasExcessPartial && parseFloat(cfg.partialUSD) > debt && (
                                      <span className="text-xs text-red-600 font-medium">
                                        Excede la deuda
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {payUSD > 0 && (
                                <div className="bg-white border border-indigo-200 rounded-lg p-2 text-sm">
                                  <span className="text-gray-600">A pagar: </span>
                                  <span className="font-bold text-indigo-700">{formatUsd(payUSD)}</span>
                                  <span className="text-gray-500"> (≈ </span>
                                  <span className="font-bold text-indigo-700">{formatBs(payBs)}</span>
                                  <span className="text-gray-500">)</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ══════════════════════════════════════════════ */}
              {/* PASO 2: Monto total a transferir              */}
              {/* ══════════════════════════════════════════════ */}
              {totalUSD > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 mb-1">
                        Paso 2: Transfiere EXACTAMENTE
                      </p>
                      <p className="text-3xl font-bold text-emerald-900">{formatBs(totalBs)}</p>
                      <p className="text-sm text-emerald-700">≈ {formatUsd(totalUSD)}</p>
                    </div>
                    <div className="bg-emerald-100 p-4 rounded-full">
                      <FaMoneyBillWave className="text-3xl text-emerald-600" />
                    </div>
                  </div>
                  <div className="mt-4 bg-white border border-amber-300 rounded-lg p-3 flex items-start gap-2">
                    <FaExclamationCircle className="text-amber-600 text-lg flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900">
                      <strong>Importante:</strong> el banco valida el monto <strong>exacto</strong>.
                      Si transfieres {formatBs(totalBs + 1)} o {formatBs(totalBs - 1)}, la validación fallará.
                    </p>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════ */}
              {/* PASO 3: Datos de Pago Móvil (institucionales) */}
              {/* ══════════════════════════════════════════════ */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <FaMoneyBillWave className="text-2xl" />
                  <h2 className="text-xl font-bold">Paso 3: Realiza el Pago Móvil</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-blue-100 text-xs">Banco</p>
                    <p className="font-bold">BNC — 0191</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-blue-100 text-xs">Teléfono</p>
                    <p className="font-bold">0412-208.84.51</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-blue-100 text-xs">RIF</p>
                    <p className="font-bold">J-505275356</p>
                  </div>
                </div>
              </div>

              {/* ══════════════════════════════════════════════ */}
              {/* PASO 4: Datos del pago para validar           */}
              {/* ══════════════════════════════════════════════ */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FaCheckCircle className="text-lg text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Paso 4: Valida tu pago</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaFileInvoiceDollar className="inline mr-1 text-blue-600" />
                      Referencia *
                    </label>
                    <input
                      type="text"
                      name="Reference"
                      value={bankForm.Reference}
                      onChange={handleBankChange}
                      required
                      className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 font-medium"
                      placeholder="001127234831"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaUniversity className="inline mr-1 text-blue-600" />
                      Banco emisor *
                    </label>
                    <select
                      name="BankCode"
                      value={bankForm.BankCode}
                      onChange={handleBankChange}
                      required
                      className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 font-medium"
                    >
                      {BANKS_LIST.map(bank => (
                        <option key={bank.Code} value={parseInt(bank.Code, 10)}>
                          {bank.Name} ({bank.Code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaCreditCard className="inline mr-1 text-blue-600" />
                      Cédula del pagador *
                    </label>
                    <input
                      type="text"
                      name="ClientID"
                      value={bankForm.ClientID}
                      onChange={handleBankChange}
                      required
                      className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 font-medium"
                      placeholder="V12345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaPhone className="inline mr-1 text-blue-600" />
                      Teléfono del pagador *
                    </label>
                    <input
                      type="text"
                      name="PhoneNumber"
                      value={bankForm.PhoneNumber}
                      onChange={handleBankChange}
                      required
                      className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 font-medium"
                      placeholder="04121234567"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaCalendarDay className="inline mr-1 text-blue-600" />
                      Fecha del pago *
                    </label>
                    <input
                      type="date"
                      name="RequestDate"
                      value={bankForm.RequestDate}
                      onChange={handleBankChange}
                      required
                      className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 font-medium"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Déjala en hoy si el pago se hizo hoy. Si fue antes, pon la fecha real.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading || depositLoading || !canSubmit}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg font-bold transition-all duration-300 shadow-md flex items-center space-x-2 disabled:cursor-not-allowed"
                  >
                    {loading || depositLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="text-sm" />
                        <span>Validar y Registrar Pago</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* ══════════════════════════════════════════════ */}
            {/* Historial                                     */}
            {/* ══════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <FaHistory className="text-lg text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Historial de Pagos</h2>
                </div>
                <span className="text-sm text-gray-500">
                  {historyPagination.totalRecords} transacciones
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    <FaFilter className="inline mr-1 text-gray-400" /> Estudiante
                  </label>
                  <select
                    name="studentId"
                    value={historyFilters.studentId}
                    onChange={handleHistoryFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Todos los hijos</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    <FaSearch className="inline mr-1 text-gray-400" /> Buscar
                  </label>
                  <input
                    type="text"
                    name="search"
                    value={historyFilters.search}
                    onChange={handleHistoryFilterChange}
                    placeholder="Descripción, referencia..."
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {historyLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FaHistory className="mx-auto text-3xl text-gray-300 mb-2" />
                  <p className="text-gray-600">No hay transacciones</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Bs</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">USD</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {history.map((tx: any) => {
                          const isDeposit = tx.type === 'deposit';
                          const amountBs = tx.amount || 0;
                          const amountUSD = tx.amountUSD || 0;
                          const dist = tx.metadata?.distribution;
                          const hasDist = Array.isArray(dist) && dist.length > 0;

                          return (
                            <tr key={tx.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                {tx.createdAt ? formatDate(tx.createdAt) : '—'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {hasDist ? (
                                  <div>
                                    <span className="text-xs text-indigo-600 font-semibold">Distribuido:</span>
                                    <ul className="text-xs mt-1">
                                      {dist.map((d: any, i: number) => (
                                        <li key={i}>{d.studentName}: ${d.amountUSD.toFixed(2)}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  tx.student?.fullName || '—'
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{tx.description || '—'}</td>
                              <td className={`px-4 py-3 text-sm font-bold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                                {isDeposit ? '+' : '-'}{formatBs(amountBs)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">≈ {formatUsd(amountUSD)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.displayStatus === 'Completado' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {tx.displayStatus}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-1">
                                  <button
                                    onClick={() => handleDownloadReceipt(tx)}
                                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Descargar recibo"
                                  >
                                    <FaFilePdf />
                                  </button>
                                  {canDelete && (
                                    <button
                                      onClick={() => setDeleteTarget(tx)}
                                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Eliminar (admin)"
                                    >
                                      <FaTrash />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {historyPagination.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-gray-600">
                        Página {historyPagination.currentPage} de {historyPagination.totalPages}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          disabled={historyFilters.page === 1}
                          onClick={() => setHistoryFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                        >
                          <FaChevronLeft className="text-gray-600" />
                        </button>
                        <button
                          disabled={historyFilters.page === historyPagination.totalPages}
                          onClick={() => setHistoryFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                        >
                          <FaChevronRight className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════ */}
          {/* Panel lateral: resultados                     */}
          {/* ══════════════════════════════════════════════ */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-5 border border-gray-200 shadow-lg h-full">
              <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-gray-200">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FaFileInvoiceDollar className="text-lg text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Resultados</h3>
                  <p className="text-gray-600 text-xs">Estado de verificación</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaTimesCircle className="text-lg text-red-600" />
                    <h4 className="text-base font-semibold text-red-800">Error</h4>
                  </div>
                  <p className="text-red-700 text-xs">{error}</p>
                </div>
              )}

              {depositResult && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaCheckCircle className="text-lg text-green-600" />
                    <h4 className="text-base font-semibold text-green-800">Pago registrado</h4>
                  </div>
                  <p className="text-green-700 text-xs">
                    {depositResult.content.message}
                  </p>
                  {depositResult.content.distribution && depositResult.content.distribution.length > 1 && (
                    <div className="mt-2 text-xs text-green-800">
                      <p className="font-semibold">Distribuido:</p>
                      <ul className="ml-3">
                        {depositResult.content.distribution.map((d: any, i: number) => (
                          <li key={i}>• {d.studentName}: ${d.amountUSD.toFixed(2)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-green-700 text-xs mt-2 font-semibold">
                    Nuevo saldo (USD): ${depositResult.content.newBalanceUSD?.toFixed(2)}
                  </p>
                </div>
              )}

              {result ? (
                <div className={`${getStatusColor(result.overallResult)} rounded-xl p-4 border-2 transition-all`}>
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(result.overallResult)}
                    <div>
                      <h4 className={`text-base font-bold ${getStatusTextColor(result.overallResult)}`}>
                        {result.overallResult === 'success'
                          ? 'Validación Exitosa'
                          : result.overallResult === 'manual_review'
                          ? 'Revisión Requerida'
                          : 'Error en Validación'}
                      </h4>
                      <p className={`${getStatusTextColor(result.overallResult)} text-xs`}>{result.message}</p>
                    </div>
                  </div>

                  {result.details?.validateReference && (
                    <div className={`flex justify-between items-center p-3 rounded-lg border ${result.details.validateReference.movementExists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <span className="text-gray-700 text-sm">Referencia</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${result.details.validateReference.movementExists ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {result.details.validateReference.executed ? (result.details.validateReference.movementExists ? '✓' : '✗') : '—'}
                      </span>
                    </div>
                  )}

                  {result.details?.validateReference?.movementExists && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                      <h5 className="text-gray-800 font-semibold text-sm mb-2">Detalles del banco</h5>
                      <div className="space-y-2 text-gray-600 text-xs">
                        <div className="flex justify-between">
                          <span>Concepto:</span>
                          <span className="text-gray-800 text-right max-w-[60%]">
                            {result.details.validateReference?.data?.Concept || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monto verificado:</span>
                          <span className="text-gray-800 font-bold">
                            Bs {formatBs(result.details.validateReference?.data?.Amount || 0)}
                          </span>
                        </div>
                        {result.details.validateReference?.data?.DebtorID && (
                          <div className="flex justify-between">
                            <span>Pagador:</span>
                            <span className="text-gray-800 font-mono">
                              {result.details.validateReference.data.DebtorID}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                    <FaSearch className="text-xl text-blue-400" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-700 mb-1">Sin resultados</h4>
                  <p className="text-gray-500 text-xs max-w-xs mx-auto">
                    Completa los pasos y presiona "Validar y Registrar Pago"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteTransactionModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => fetchHistory()}
        transaction={
          deleteTarget
            ? {
                id: deleteTarget.id,
                description: deleteTarget.description,
                amount: deleteTarget.amount,
                amountUSD: deleteTarget.amountUSD,
                type: deleteTarget.type,
                studentName: deleteTarget.student?.fullName,
              }
            : null
        }
      />
    </div>
  );
}