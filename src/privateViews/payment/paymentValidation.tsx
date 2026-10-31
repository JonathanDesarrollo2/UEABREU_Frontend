import { useState, useEffect, useCallback, useRef } from 'react'; // ⬅️ Añadido useRef
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
  FaClock,
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
  partialBs: string;
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

  // ⬇️ Referencia para hacer scroll al inicio del formulario
  const formRef = useRef<HTMLFormElement>(null);

  // ── Estado de las Fases ──
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentType, setPaymentType] = useState<'today' | 'past'>('today');

  // ── Estado del formulario bancario ──
  const [bankForm, setBankForm] = useState({
    Reference: '',
    ClientID: '',
    PhoneNumber: '',
    BankCode: 102,
    RequestDate: DEFAULT_REQUEST_DATE,
  });

  // ── Estado para Pago Anterior ──
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const [pastPaymentDate, setPastPaymentDate] = useState(yesterday.toISOString().split('T')[0]);
  const [pastPaymentAmountBs, setPastPaymentAmountBs] = useState<string>('');

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

  // Historial
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

  // ⬇️ Efecto para hacer scroll automático al cambiar de paso
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

  // ═══════════════════════════════════════════════════════════════
  // Tasa BCV
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const fetchBCVRate = async () => {
      const dateToFetch = paymentType === 'past' ? pastPaymentDate : bankForm.RequestDate;
      if (!dateToFetch) return;
      
      try {
        setLoadingRate(true);
        const response = await getStoredRateAPI(dateToFetch);
        if (response.result && response.content) {
          setBcvRate(response.content);
        } else {
          setBcvRate(null);
        }
      } catch (err: any) {
        setBcvRate(null);
      } finally {
        setLoadingRate(false);
      }
    };
    fetchBCVRate();
  }, [bankForm.RequestDate, pastPaymentDate, paymentType]);

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
      initial[s.id] = { selected: false, mode: 'full', partialBs: '' };
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

  const getDebtBs = (studentId: string): number => {
    const debtUSD = getDebtUSD(studentId);
    return Math.round(debtUSD * (bcvRate?.PriceRateBCV || 0) * 100) / 100;
  };

  const getAssignedUSD = (studentId: string): number => {
    const cfg = payConfig[studentId];
    if (!cfg || !cfg.selected) return 0;
    const debt = getDebtUSD(studentId);
    
    if (cfg.mode === 'full') return debt;
    
    const bs = Math.max(0, parseFloat(cfg.partialBs) || 0);
    const usd = bs / (bcvRate?.PriceRateBCV || 1);
    return Math.round(usd * 100) / 100;
  };

  const getAssignedBs = (studentId: string): number => {
    const cfg = payConfig[studentId];
    if (!cfg || !cfg.selected) return 0;
    const debtBs = getDebtBs(studentId);
    
    if (cfg.mode === 'full') return debtBs;
    
    return Math.max(0, parseFloat(cfg.partialBs) || 0);
  };

  const totalAssignedUSD = Object.keys(payConfig).reduce(
    (sum, sid) => sum + getAssignedUSD(sid),
    0
  );

  const totalAvailableUSD = paymentType === 'past' 
    ? (parseFloat(pastPaymentAmountBs) || 0) / (bcvRate?.PriceRateBCV || 1) 
    : Infinity;

  const totalBs = Object.keys(payConfig).reduce(
    (sum, sid) => sum + getAssignedBs(sid),
    0
  );

  // Validaciones
  const hasIncompletePartial = Object.keys(payConfig).some(sid => {
    const cfg = payConfig[sid];
    return cfg.selected && cfg.mode === 'partial' && (!cfg.partialBs || parseFloat(cfg.partialBs) <= 0);
  });

  const hasExcessPartial = Object.keys(payConfig).some(sid => {
    const cfg = payConfig[sid];
    if (!cfg.selected || cfg.mode !== 'partial') return false;
    const bs = parseFloat(cfg.partialBs) || 0;
    const debtBs = getDebtBs(sid);
    return paymentType === 'today' && bs > debtBs + 0.01;
  });

  let isStep1Valid = false;
  if (paymentType === 'today') {
    isStep1Valid = totalAssignedUSD > 0 && !hasIncompletePartial && !hasExcessPartial;
  } else {
    const diff = Math.abs(totalAvailableUSD - totalAssignedUSD);
    isStep1Valid = totalAssignedUSD > 0 && diff < 0.05 && !hasIncompletePartial;
  }

  const isStep3Valid =
    bankForm.Reference.trim() !== ''
    && bankForm.ClientID.trim() !== ''
    && bankForm.PhoneNumber.trim() !== '';

  // ═══════════════════════════════════════════════════════════════
  // EFECTO DE SEGURIDAD PARA PAGO ANTERIOR
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (paymentType !== 'past' || !totalAvailableUSD || !bcvRate) return;

    setPayConfig(prev => {
      let changed = false;
      const newConfig = { ...prev };

      const currentTotalAssigned = Object.keys(newConfig).reduce((sum, sid) => {
        const cfg = newConfig[sid];
        if (!cfg.selected) return sum;
        if (cfg.mode === 'full') return sum + getDebtUSD(sid);
        const bs = parseFloat(cfg.partialBs) || 0;
        return sum + (bs / bcvRate.PriceRateBCV);
      }, 0);

      Object.keys(newConfig).forEach(sid => {
        const cfg = newConfig[sid];
        if (!cfg.selected || cfg.mode !== 'full') return;

        const debtUSD = getDebtUSD(sid);
        const otherAssigned = currentTotalAssigned - debtUSD;
        const remainingPool = totalAvailableUSD - otherAssigned;
        
        if (remainingPool < debtUSD - 0.05) {
          const maxBs = Math.max(0, remainingPool) * bcvRate.PriceRateBCV;
          newConfig[sid] = { ...cfg, mode: 'partial', partialBs: maxBs > 0 ? maxBs.toFixed(2) : '' };
          changed = true;
        }
      });

      return changed ? newConfig : prev;
    });
  }, [totalAvailableUSD, paymentType, bcvRate, students]);

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
  // Submit
  // ═══════════════════════════════════════════════════════════════
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep3Valid || totalAssignedUSD <= 0) return;

    setLoading(true);
    setError('');
    setResult(null);
    setDepositResult(null);

    const finalAmountBs = paymentType === 'past' ? parseFloat(pastPaymentAmountBs) : totalBs;
    const finalDate = paymentType === 'past' ? pastPaymentDate : bankForm.RequestDate;

    try {
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

      const fullValidationData: BankValidationRequest = {
        AccountNumber: DEFAULT_BANK_ACCOUNT,
        BankCode: bankForm.BankCode,
        PhoneNumber: bankForm.PhoneNumber,
        ClientID: bankForm.ClientID,
        Reference: bankForm.Reference,
        RequestDate: `${finalDate}T00:00:00`,
        Amount: finalAmountBs,
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

      if (
        response.content.overallResult === 'success' &&
        response.content.message.includes('Pago verificado exitosamente')
      ) {
        setDepositLoading(true);
        try {
          const distribution = Object.keys(payConfig)
            .filter(sid => payConfig[sid].selected && getAssignedUSD(sid) > 0)
            .map(sid => ({
              studentId: sid,
              amountUSD: Number(getAssignedUSD(sid).toFixed(2)),
            }));

          const depositPayload = {
            amount: finalAmountBs,
            description: `Pago validado - Ref: ${bankForm.Reference}`,
            paymentMethod: 'pago_movil' as const,
            reference: bankForm.Reference,
            paymentDate: finalDate,
            bankCode: String(bankForm.BankCode),
            payerId: bankForm.ClientID,
            payerPhone: bankForm.PhoneNumber,
            distribution,
          };

          const depositRes = await manualDeposit(representativeId, depositPayload);
          setDepositResult(depositRes);
          fetchHistory();

          const balRes = await getRepresentativeBalance(representativeId);
          if (balRes.result && balRes.content.representative.students) {
            setStudents(balRes.content.representative.students);
          }

          setStep(1);
          setPaymentType('today');
          setPastPaymentAmountBs('');
          setBankForm(prev => ({ ...prev, Reference: '', ClientID: '', PhoneNumber: '' }));
          setPayConfig({});
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

  const updateStudentConfig = (studentId: string, patch: Partial<StudentPayConfig>) => {
    setPayConfig(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], ...patch },
    }));
  };

  const switchPaymentType = (type: 'today' | 'past') => {
    if (type === paymentType) return;
    setPaymentType(type);
    setStep(1);
    setError('');
    setResult(null);
    setDepositResult(null);
    setPayConfig({});
    students.forEach(s => {
      setPayConfig(prev => ({
        ...prev,
        [s.id]: { selected: false, mode: 'full', partialBs: '' }
      }));
    });
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

      pdfMake.createPdf(docDefinition).download(`Recibo_${tx.reference || receiptNumber}.pdf`);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2.5 sm:p-3 rounded-xl shadow-md">
              <FaUniversity className="text-xl sm:text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Validación de Pagos</h1>
              <p className="text-sm sm:text-base text-gray-600">Verificación en cascada - BNC</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-2 self-start md:self-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Selector de tipo de pago */}
            <div className="flex flex-col sm:flex-row bg-white rounded-2xl p-2 border border-gray-200 shadow-sm w-full sm:w-fit mb-2 gap-2">
              <button
                onClick={() => switchPaymentType('today')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${
                  paymentType === 'today'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaMoneyBillWave /> Pago Nuevo (Hoy)
              </button>
              <button
                onClick={() => switchPaymentType('past')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${
                  paymentType === 'past'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaClock /> Pago Anterior
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col relative scroll-mt-6">
              
              {/* Indicador de Pasos */}
              <div className="bg-gray-50 border-b border-gray-200 px-2 py-4 sm:px-8 sm:py-6 flex justify-center items-center gap-2 sm:gap-4 overflow-x-auto">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex items-center gap-2 sm:gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                          step >= num
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {num}
                      </div>
                      <span className={`text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium ${step >= num ? 'text-indigo-700' : 'text-gray-400'}`}>
                        {num === 1 && 'Selección'}
                        {num === 2 && (paymentType === 'today' ? 'Transferencia' : 'Resumen')}
                        {num === 3 && 'Validación'}
                      </span>
                    </div>
                    {num < 3 && (
                      <div
                        className={`w-6 sm:w-16 h-1 rounded-full mb-4 sm:mb-5 transition-colors duration-300 ${
                          step > num ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* FASE 1 */}
              {step === 1 && (
                <div className="p-4 sm:p-8 animate-fade-in">
                  
                  {paymentType === 'past' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 mb-6 sm:mb-8">
                      <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-3 sm:mb-4 flex items-center gap-2">
                        <FaCalendarDay /> Datos del pago anterior
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-blue-800 mb-1 sm:mb-2">Fecha del pago</label>
                          <input 
                            type="date" 
                            value={pastPaymentDate} 
                            max={new Date().toISOString().split('T')[0]}
                            onChange={e => setPastPaymentDate(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-blue-800 mb-1 sm:mb-2">Monto transferido (Bs)</label>
                          <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-blue-500 font-bold text-sm">Bs</span>
                            <input 
                              type="number" 
                              value={pastPaymentAmountBs} 
                              onChange={e => setPastPaymentAmountBs(e.target.value)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-base bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                      {bcvRate && pastPaymentAmountBs && (
                        <div className="mt-4 bg-white border border-blue-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-sm">
                          <span className="font-semibold text-gray-600">Monto disponible en USD:</span>
                          <span className="text-lg font-bold text-blue-700">{formatUsd(totalAvailableUSD)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                    <div className="bg-indigo-100 p-1.5 sm:p-2 rounded-lg">
                      <FaUserGraduate className="text-base sm:text-lg text-indigo-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                      {paymentType === 'today' ? 'Paso 1: ¿A quién vas a pagar?' : 'Paso 1: Distribuye el pago'}
                    </h2>
                  </div>

                  {paymentType === 'past' && pastPaymentAmountBs && totalAvailableUSD > 0 && (
                    <div className="mb-4 sm:mb-6 space-y-2">
                      {Math.abs(totalAvailableUSD - totalAssignedUSD) < 0.05 ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3 flex items-center gap-2 text-green-800 text-xs sm:text-sm font-semibold">
                          <FaCheckCircle /> Todo el monto ha sido distribuido correctamente.
                        </div>
                      ) : totalAvailableUSD > totalAssignedUSD ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3 flex items-center gap-2 text-amber-800 text-xs sm:text-sm font-semibold">
                          <FaExclamationCircle /> Faltan por asignar: {formatUsd(totalAvailableUSD - totalAssignedUSD)}
                        </div>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3 flex items-center gap-2 text-red-800 text-xs sm:text-sm font-semibold">
                          <FaTimesCircle /> El monto asignado excede el disponible por: {formatUsd(totalAssignedUSD - totalAvailableUSD)}
                        </div>
                      )}
                    </div>
                  )}

                  {loadingStudents ? (
                    <div className="flex items-center justify-center py-10 sm:py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
                      <span className="ml-2 text-sm text-indigo-700">Cargando...</span>
                    </div>
                  ) : studentsWithDebt.length === 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                      <FaCheckCircle className="mx-auto text-3xl text-green-600 mb-3" />
                      <p className="text-green-800 font-semibold text-base sm:text-lg">No hay deudas pendientes</p>
                      <p className="text-green-600 text-sm mt-1">Todos los pagos están al día.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {studentsWithDebt.map(student => {
                        const debtUSD = getDebtUSD(student.id);
                        const debtBs = getDebtBs(student.id);
                        const cfg = payConfig[student.id] || { selected: false, mode: 'full', partialBs: '' };
                        const assignedUSD = getAssignedUSD(student.id);
                        
                        const otherAssignedUSD = totalAssignedUSD - assignedUSD;
                        const remainingPoolForThisStudentUSD = Math.max(0, totalAvailableUSD - otherAssignedUSD);
                        const remainingPoolForThisStudentBs = remainingPoolForThisStudentUSD * (bcvRate?.PriceRateBCV || 0);
                        
                        const maxAssignableBs = paymentType === 'past' 
                          ? Math.min(debtBs, remainingPoolForThisStudentBs) 
                          : debtBs;
                          
                        const canFull = paymentType === 'past' 
                          ? remainingPoolForThisStudentUSD >= debtUSD - 0.05 
                          : true;

                        const currentMode = canFull ? cfg.mode : 'partial';

                        return (
                          <div
                            key={student.id}
                            className={`border-2 rounded-xl p-3 sm:p-5 transition-all duration-200 ${
                              cfg.selected ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-300'
                            }`}
                          >
                            <label className="flex items-start gap-3 sm:gap-4 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cfg.selected}
                                onChange={e => updateStudentConfig(student.id, { selected: e.target.checked })}
                                className="w-5 h-5 sm:w-6 sm:h-6 mt-1 accent-indigo-600 rounded cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                  <div>
                                    <p className="font-bold text-gray-900 text-base sm:text-lg truncate">{student.fullName}</p>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                      {student.currentGrade || 'Sin grado'} — Sec. {student.section || '—'}
                                    </p>
                                  </div>
                                  <div className="sm:text-right bg-gray-50 p-2 rounded-lg sm:bg-transparent sm:p-0">
                                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide font-bold">Deuda</p>
                                    <p className="text-base sm:text-lg font-bold text-red-600">{formatUsd(debtUSD)}</p>
                                    <p className="text-xs text-gray-500">≈ {formatBs(debtBs)}</p>
                                  </div>
                                </div>
                              </div>
                            </label>

                            {cfg.selected && (
                              <div className="mt-4 pt-4 border-t border-indigo-100 pl-0 sm:pl-10">
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-4">
                                  <label className={`flex items-center gap-2 ${!canFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <input
                                      type="radio"
                                      name={`mode-${student.id}`}
                                      checked={currentMode === 'full'}
                                      disabled={!canFull}
                                      onChange={() => updateStudentConfig(student.id, { mode: 'full', partialBs: '' })}
                                      className="accent-indigo-600 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                      Pago Total ({formatBs(debtBs)})
                                    </span>
                                  </label>

                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`mode-${student.id}`}
                                      checked={currentMode === 'partial'}
                                      onChange={() => updateStudentConfig(student.id, { mode: 'partial' })}
                                      className="accent-indigo-600 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Pago Parcial</span>
                                  </label>
                                </div>

                                {(currentMode === 'partial') && (
                                  <div className="bg-white p-3 sm:p-4 rounded-lg border border-indigo-100 mb-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                                      <label className="block text-xs font-semibold text-gray-600">
                                        Monto a asignar (Bs)
                                      </label>
                                      {paymentType === 'past' && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const bsToAssign = Math.min(maxAssignableBs, debtBs);
                                            const isFull = bsToAssign >= debtBs - 0.01;
                                            updateStudentConfig(student.id, { 
                                              mode: isFull ? 'full' : 'partial',
                                              partialBs: isFull ? '' : bsToAssign.toFixed(2)
                                            });
                                          }}
                                          className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                                        >
                                          Usar todo el resto ({formatBs(maxAssignableBs)})
                                        </button>
                                      )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                      <div className="relative w-full sm:w-48">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Bs</span>
                                        <input
                                          type="number"
                                          step="0.01"
                                          min="0.01"
                                          max={paymentType === 'past' ? remainingPoolForThisStudentBs : debtBs}
                                          value={cfg.partialBs}
                                          onChange={e => updateStudentConfig(student.id, { partialBs: e.target.value })}
                                          placeholder="0.00"
                                          className="w-full pl-10 pr-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
                                        />
                                      </div>
                                      <span className="text-xs sm:text-sm text-gray-500 font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 w-full sm:w-auto text-center sm:text-left">
                                        ≈ {formatUsd(getAssignedUSD(student.id))}
                                      </span>
                                    </div>
                                    {paymentType === 'past' && parseFloat(cfg.partialBs) > remainingPoolForThisStudentBs + 0.01 && (
                                      <p className="text-xs text-red-600 font-medium mt-2 flex items-center gap-1">
                                        <FaExclamationCircle /> El monto excede lo que queda del fondo.
                                      </p>
                                    )}
                                  </div>
                                )}

                                {assignedUSD > 0 && (
                                  <div className="bg-indigo-600 text-white rounded-lg p-3 flex justify-between items-center">
                                    <span className="text-xs sm:text-sm text-indigo-100">Asignado:</span>
                                    <div className="text-right">
                                      <span className="font-bold text-base sm:text-lg">{formatUsd(assignedUSD)}</span>
                                      <span className="text-indigo-200 text-[10px] sm:text-xs block">≈ {formatBs(getAssignedBs(student.id))}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!isStep1Valid}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                    >
                      Siguiente paso
                      <FaChevronRight className="text-sm" />
                    </button>
                  </div>
                </div>
              )}

              {/* FASE 2 */}
              {step === 2 && (
                <div className="p-4 sm:p-8 animate-fade-in">
                  {paymentType === 'today' ? (
                    <>
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                        <div className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
                          <FaMoneyBillWave className="text-base sm:text-lg text-emerald-600" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Paso 2: Realiza la Transferencia</h2>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 sm:p-8 text-center text-white shadow-lg mb-6 sm:mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 hidden sm:block">
                          <FaMoneyBillWave className="w-32 h-32" />
                        </div>
                        <p className="text-emerald-100 font-medium mb-1 sm:mb-2 text-sm sm:text-lg">Monto EXACTO a transferir</p>
                        <p className="text-3xl sm:text-5xl font-black tracking-tight mb-2">{formatBs(totalBs)}</p>
                        <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-sm">
                          Equivalente: {formatUsd(totalAssignedUSD)}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                        <h3 className="text-center font-bold text-blue-900 mb-3 sm:mb-4 text-base sm:text-lg">Datos de Pago Móvil</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm text-center">
                            <p className="text-blue-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Banco</p>
                            <p className="font-bold text-gray-800 text-sm sm:text-lg">BNC — 0191</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm text-center">
                            <p className="text-blue-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Teléfono</p>
                            <p className="font-bold text-gray-800 text-sm sm:text-lg">0412-208.84.51</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm text-center">
                            <p className="text-blue-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">RIF</p>
                            <p className="font-bold text-gray-800 text-sm sm:text-lg">J-505275356</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3 mb-6 sm:mb-8">
                        <FaExclamationCircle className="text-amber-600 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-amber-900">Importante</p>
                          <p className="text-xs sm:text-sm text-amber-800">
                            El banco valida el monto <strong>exacto</strong>. Si transfieres un monto diferente, la validación fallará.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                        <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                          <FaFileInvoiceDollar className="text-base sm:text-lg text-blue-600" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Paso 2: Resumen del Pago Anterior</h2>
                      </div>

                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-sm sm:text-base">
                        <p className="text-indigo-800 mb-2">
                          Estás registrando un pago realizado el <strong>{formatDate(pastPaymentDate)}</strong> por un monto de <strong>{formatBs(parseFloat(pastPaymentAmountBs))}</strong>.
                        </p>
                        <p className="text-indigo-800">
                          Tasa aplicada: <strong>{bcvRate?.PriceRateBCV.toFixed(2)} Bs/USD</strong>
                        </p>
                      </div>

                      <h3 className="font-bold text-gray-700 mb-3 text-sm sm:text-base">Distribución de fondos ({formatUsd(totalAssignedUSD)}):</h3>
                      <div className="space-y-2 mb-6 sm:mb-8">
                        {Object.keys(payConfig).filter(sid => payConfig[sid].selected).map(sid => {
                          const student = students.find(s => s.id === sid);
                          return (
                            <div key={sid} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-sm sm:text-base">
                              <span className="font-medium text-gray-800 truncate pr-2">{student?.fullName}</span>
                              <span className="font-bold text-indigo-600 whitespace-nowrap">{formatUsd(getAssignedUSD(sid))}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* ⬇️ NUEVO: Historial de pagos dentro de la Fase 2 */}
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                      <div className="bg-indigo-100 p-1.5 sm:p-2 rounded-lg">
                        <FaHistory className="text-base sm:text-lg text-indigo-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800">Historial de Pagos Recientes</h3>
                    </div>
                    
                    {historyLoading ? (
                      <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div></div>
                    ) : history.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center bg-gray-50 py-4 rounded-lg">No hay pagos registrados aún.</p>
                    ) : (
                      <div className="space-y-2">
                        {history.slice(0, 5).map((tx: any) => {
                          const isDep = tx.type === 'deposit';
                          const dist = tx.metadata?.distribution;
                          const hasDist = Array.isArray(dist) && dist.length > 0;
                          return (
                            <div key={tx.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 border border-gray-100 p-3 rounded-lg gap-2">
                              <div className="flex-1">
                                <p className="text-xs text-gray-500">{formatDate(tx.createdAt)} - {tx.description || 'Pago'}</p>
                                <p className="font-semibold text-sm text-gray-800 truncate">
                                  {hasDist ? 'Distribuido a varios estudiantes' : tx.student?.fullName || 'General'}
                                </p>
                              </div>
                              <div className="text-left sm:text-right">
                                <p className={`font-bold ${isDep ? 'text-green-600' : 'text-red-600'}`}>
                                  {isDep ? '+' : '-'}{formatBs(tx.amount || 0)}
                                </p>
                                <p className="text-xs text-gray-500">≈ {formatUsd(tx.amountUSD || 0)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sm:gap-0">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full sm:w-auto px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <FaChevronLeft className="text-sm" /> Volver
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                    >
                      Continuar a Validación
                      <FaChevronRight className="text-sm" />
                    </button>
                  </div>
                </div>
              )}

              {/* FASE 3 */}
              {step === 3 && (
                <div className="p-4 sm:p-8 animate-fade-in">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                    <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                      <FaCheckCircle className="text-base sm:text-lg text-blue-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Paso 3: Valida tu pago</h2>
                  </div>

                  <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <span className="text-sm sm:text-base text-gray-600 font-medium">Monto a validar:</span>
                    <div className="text-left sm:text-right">
                      <span className="text-lg sm:text-xl font-bold text-emerald-700">
                        {paymentType === 'past' ? formatBs(parseFloat(pastPaymentAmountBs)) : formatBs(totalBs)}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500 block">≈ {formatUsd(totalAssignedUSD)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        <FaFileInvoiceDollar className="inline mr-1 text-blue-600" /> Referencia *
                      </label>
                      <input
                        type="text"
                        name="Reference"
                        value={bankForm.Reference}
                        onChange={handleBankChange}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 text-base bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                        placeholder="001127234831"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        <FaUniversity className="inline mr-1 text-blue-600" /> Banco emisor *
                      </label>
                      <select
                        name="BankCode"
                        value={bankForm.BankCode}
                        onChange={handleBankChange}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 text-base bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                      >
                        {BANKS_LIST.map(bank => (
                          <option key={bank.Code} value={parseInt(bank.Code, 10)}>
                            {bank.Name} ({bank.Code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        <FaCreditCard className="inline mr-1 text-blue-600" /> Cédula del pagador *
                      </label>
                      <input
                        type="text"
                        name="ClientID"
                        value={bankForm.ClientID}
                        onChange={handleBankChange}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 text-base bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                        placeholder="V12345678"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        <FaPhone className="inline mr-1 text-blue-600" /> Teléfono del pagador *
                      </label>
                      <input
                        type="text"
                        name="PhoneNumber"
                        value={bankForm.PhoneNumber}
                        onChange={handleBankChange}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 text-base bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                        placeholder="04121234567"
                      />
                    </div>

                    {paymentType === 'today' ? (
                      <div className="md:col-span-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                          <FaCalendarDay className="inline mr-1 text-blue-600" /> Fecha del pago *
                        </label>
                        <input
                          type="date"
                          name="RequestDate"
                          value={bankForm.RequestDate}
                          onChange={handleBankChange}
                          required
                          className="w-full px-3 sm:px-4 py-2.5 text-base bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                        />
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                          Déjala en la fecha de hoy. Si el pago fue antes, pon la fecha real.
                        </p>
                      </div>
                    ) : (
                      <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                        <FaCalendarDay className="text-blue-600 text-lg" />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-blue-900">Fecha del pago anterior</p>
                          <p className="text-xs sm:text-sm text-blue-800">{formatDate(pastPaymentDate)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sm:gap-0">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={loading || depositLoading}
                      className="w-full sm:w-auto px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FaChevronLeft className="text-sm" /> Volver
                    </button>
                    <button
                      type="submit"
                      disabled={!isStep3Valid || loading || depositLoading}
                      className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 sm:px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                      {loading || depositLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="text-lg" /> Validar y Registrar Pago
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Historial General (Abajo de todo) */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="bg-indigo-100 p-1.5 sm:p-2 rounded-lg">
                    <FaHistory className="text-base sm:text-lg text-indigo-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Historial de Pagos</h2>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">
                  {historyPagination.totalRecords} trans.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    <FaFilter className="inline mr-1 text-gray-400" /> Estudiante
                  </label>
                  <select
                    name="studentId"
                    value={historyFilters.studentId}
                    onChange={handleHistoryFilterChange}
                    className="w-full px-3 py-2 text-base bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Todos los hijos</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    <FaSearch className="inline mr-1 text-gray-400" /> Buscar
                  </label>
                  <input
                    type="text"
                    name="search"
                    value={historyFilters.search}
                    onChange={handleHistoryFilterChange}
                    placeholder="Descripción, referencia..."
                    className="w-full px-3 py-2 text-base bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
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
                  <p className="text-sm sm:text-base text-gray-600">No hay transacciones</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Fecha</th>
                          <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                          <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Monto Bs</th>
                          <th className="px-2 sm:px-4 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">USD</th>
                          <th className="px-2 sm:px-4 py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Acción</th>
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
                              <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                                {tx.createdAt ? formatDate(tx.createdAt) : '—'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 max-w-[120px] sm:max-w-[200px] truncate">
                                {hasDist ? (
                                  <span className="text-indigo-600 text-[10px] sm:text-xs font-semibold">Distribuido</span>
                                ) : (
                                  tx.student?.fullName || '—'
                                )}
                              </td>
                              <td className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold whitespace-nowrap ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                                {isDeposit ? '+' : '-'}{formatBs(amountBs)}
                              </td>
                              <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 whitespace-nowrap">≈ {formatUsd(amountUSD)}</td>
                              <td className="px-2 sm:px-4 py-2 text-center">
                                <div className="flex justify-center gap-1">
                                  <button
                                    onClick={() => handleDownloadReceipt(tx)}
                                    className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Descargar recibo"
                                  >
                                    <FaFilePdf />
                                  </button>
                                  {canDelete && (
                                    <button
                                      onClick={() => setDeleteTarget(tx)}
                                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                      <span className="text-xs sm:text-sm text-gray-600">
                        Pág. {historyPagination.currentPage} / {historyPagination.totalPages}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          disabled={historyFilters.page === 1}
                          onClick={() => setHistoryFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                          className="p-1.5 sm:p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                        >
                          <FaChevronLeft className="text-gray-600 text-xs sm:text-base" />
                        </button>
                        <button
                          disabled={historyFilters.page === historyPagination.totalPages}
                          onClick={() => setHistoryFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                          className="p-1.5 sm:p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                        >
                          <FaChevronRight className="text-gray-600 text-xs sm:text-base" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Panel lateral: resultados */}
          <div className="lg:col-span-1 mt-6 lg:mt-0">
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-lg h-full">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 pb-3 border-b border-gray-200">
                <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                  <FaFileInvoiceDollar className="text-base sm:text-lg text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">Resultados</h3>
                  <p className="text-[10px] sm:text-xs text-gray-600">Estado de verificación</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 animate-fade-in text-xs sm:text-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    <FaTimesCircle className="text-red-600" />
                    <h4 className="font-semibold text-red-800">Error</h4>
                  </div>
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {depositResult && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 animate-fade-in">
                  <div className="flex items-center space-x-2 mb-1">
                    <FaCheckCircle className="text-green-600" />
                    <h4 className="text-sm font-semibold text-green-800">Pago registrado</h4>
                  </div>
                  <p className="text-xs text-green-700 font-medium">
                    {depositResult.content.message}
                  </p>
                  {depositResult.content.distribution && depositResult.content.distribution.length > 0 && (
                    <div className="mt-2 bg-white rounded-lg p-2 border border-green-100">
                      <p className="text-[10px] font-bold text-gray-700 mb-1">Distribución:</p>
                      <ul className="text-[10px] text-gray-600 space-y-1">
                        {depositResult.content.distribution.map((d: any, i: number) => (
                          <li key={i} className="flex justify-between">
                            <span className="truncate pr-1">{d.studentName}:</span>
                            <span className="font-semibold">${d.amountUSD.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-green-700 mt-2 font-semibold">
                    Nuevo saldo (USD): ${depositResult.content.newBalanceUSD?.toFixed(2)}
                  </p>
                </div>
              )}

              {result ? (
                <div className={`${getStatusColor(result.overallResult)} rounded-xl p-3 border-2 transition-all animate-fade-in`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(result.overallResult)}
                    <div>
                      <h4 className={`text-sm font-bold ${getStatusTextColor(result.overallResult)}`}>
                        {result.overallResult === 'success'
                          ? 'Validación Exitosa'
                          : result.overallResult === 'manual_review'
                          ? 'Revisión Requerida'
                          : 'Error en Validación'}
                      </h4>
                      <p className={`text-[10px] sm:text-xs ${getStatusTextColor(result.overallResult)}`}>{result.message}</p>
                    </div>
                  </div>

                  {result.details?.validateReference && (
                    <div className={`flex justify-between items-center p-2 rounded-lg border ${result.details.validateReference.movementExists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <span className="text-gray-700 text-xs sm:text-sm">Referencia</span>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${result.details.validateReference.movementExists ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {result.details.validateReference.executed ? (result.details.validateReference.movementExists ? '✓' : '✗') : '—'}
                      </span>
                    </div>
                  )}

                  {result.details?.validateReference?.movementExists && (
                    <div className="mt-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                      <h5 className="text-gray-800 font-semibold text-xs sm:text-sm mb-1">Detalles del banco</h5>
                      <div className="space-y-1 text-gray-600 text-[10px] sm:text-xs">
                        <div className="flex justify-between">
                          <span>Concepto:</span>
                          <span className="text-gray-800 text-right max-w-[60%] truncate">
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
                            <span className="text-gray-800 font-mono truncate max-w-[60%]">
                              {result.details.validateReference.data.DebtorID}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                !depositResult && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                      <FaSearch className="text-xl text-blue-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Esperando pago</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 max-w-xs mx-auto px-2">
                      Completa los pasos y presiona "Validar" para ver los resultados.
                    </p>
                  </div>
                )
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