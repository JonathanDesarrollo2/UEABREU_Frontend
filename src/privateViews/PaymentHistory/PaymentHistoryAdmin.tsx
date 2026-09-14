import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaSearch, FaHistory, FaFilter, FaTimes, FaChevronLeft, FaChevronRight,
  FaFilePdf, FaFileExcel, FaExchangeAlt, FaUserShield, FaUserTie,
  FaCog, FaUser, FaClipboardList, FaBalanceScale
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllTransactions, getAccountStatement } from '../../apis/balance';
import { getPaginatedStudentsAPI } from '../../apis/student';
import api from '../../library/axios';
import { getBCVRateAPI, type BCVRateResponse } from '../../apis/bank';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import ExcelJS from 'exceljs';

(pdfMake as any).vfs = pdfFonts.vfs;

interface TransactionMetadata {
  isMoved?: boolean;
  isMovedRemainder?: boolean;
  sourceTransactionId?: string;
  movedFromStudentId?: string;
  movedFromStudentName?: string;
  movedToStudentId?: string;
  movedToStudentName?: string;
  movedAmountBs?: number;
  movedAmountUSD?: number;
  remainingAmountBs?: number;
  remainingAmountUSD?: number;
}

interface TransactionCreator {
  id: string;
  userlogin: string;
  username?: string;
  nivel: number;
  role: 'admin' | 'representative' | 'system';
}

interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  amountUSD?: number;
  bcvRate?: number;
  description: string;
  paymentMethod: string;
  reference: string;
  status: string;
  paymentStatus?: string;
  balanceAfter?: number;
  createdAt: string;
  student?: { id: string; fullName: string; currentGrade?: string; section?: string; balance?: number } | null;
  representative?: { id: string; fullName: string; identityCard: string };
  metadata?: TransactionMetadata | null;
  creator?: TransactionCreator | null;
}

const GRADE_OPTIONS = ['1ro', '2do', '3ro', '4to', '5to', '6to'];
const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];

const formatCurrencyLocal = (amount: number, currency: 'VES' | 'USD') => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const PaymentHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [bcvRate, setBcvRate] = useState<BCVRateResponse | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    studentId: '',
    representativeId: '',
    startDate: '',
    endDate: '',
    createdByRole: '' as '' | 'admin' | 'representative' | 'system',
    balanceStatus: 'all' as 'all' | 'debtors' | 'creditors',
    studentGrade: '',
    studentSection: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({ totalRecords: 0, currentPage: 1, totalPages: 1 });

  const [repSearchTerm, setRepSearchTerm] = useState('');
  const [repResults, setRepResults] = useState<any[]>([]);
  const [showRepDropdown, setShowRepDropdown] = useState(false);

  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountData, setAccountData] = useState<any>(null);

  const repInputRef = useRef<HTMLInputElement>(null);
  const studentInputRef = useRef<HTMLInputElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableWidthRef = useRef<HTMLDivElement>(null);

  const syncScroll = (source: 'main' | 'top') => {
    if (source === 'main' && mainScrollRef.current && topScrollRef.current) {
      topScrollRef.current.scrollLeft = mainScrollRef.current.scrollLeft;
    } else if (source === 'top' && topScrollRef.current && mainScrollRef.current) {
      mainScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const searchReps = useCallback(async (term: string) => {
    if (term.length < 2) { setRepResults([]); return; }
    try {
      const { data } = await api.get('/private/balance/representatives', { params: { search: term, limit: 10 } });
      if (data.result) {
        setRepResults(data.content.representatives || data.content || []);
        setShowRepDropdown(true);
      }
    } catch (error) {}
  }, []);

  const searchStudents = useCallback(async (term: string) => {
    if (term.length < 2) { setStudentResults([]); return; }
    try {
      const response = await getPaginatedStudentsAPI(1, 10, term);
      if (response.result) {
        setStudentResults(response.content || []);
        setShowStudentDropdown(true);
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await getBCVRateAPI();
        if (res.result && res.content) setBcvRate(res.content);
      } catch (error) {
        console.error('Error al obtener tasa BCV', error);
      }
    };
    fetchRate();
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllTransactions({
        page: filters.page,
        limit: filters.limit,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        representativeId: filters.representativeId || undefined,
        studentId: filters.studentId || undefined,
        search: filters.search || undefined,
        createdByRole: filters.createdByRole || undefined,
        balanceStatus: filters.balanceStatus !== 'all' ? filters.balanceStatus : undefined,
        studentGrade: filters.studentGrade || undefined,
        studentSection: filters.studentSection || undefined,
      });
      if (response.result) {
        setTransactions(response.content.transactions);
        setPagination(response.content.pagination);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [filters.page]);

  useEffect(() => {
    if (tableWidthRef.current && topScrollRef.current) {
      const contentWidth = tableWidthRef.current.scrollWidth;
      const innerDiv = topScrollRef.current.querySelector('div');
      if (innerDiv) {
        innerDiv.style.width = `${contentWidth}px`;
      }
    }
  }, [transactions]);

  const handleApplyFilters = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchTransactions();
  };

  const clearFilters = () => {
    setFilters({
      search: '', studentId: '', representativeId: '',
      startDate: '', endDate: '', createdByRole: '',
      balanceStatus: 'all', studentGrade: '', studentSection: '',
      page: 1, limit: 20
    });
    setRepSearchTerm('');
    setStudentSearchTerm('');
    setRepResults([]);
    setStudentResults([]);
    setShowRepDropdown(false);
    setShowStudentDropdown(false);
    fetchTransactions();
  };

  const selectRepresentative = (rep: any) => {
    setFilters(prev => ({ ...prev, representativeId: rep.id, page: 1 }));
    setRepSearchTerm(rep.fullName);
    setShowRepDropdown(false);
  };

  const selectStudent = (student: any) => {
    setFilters(prev => ({ ...prev, studentId: student.id, page: 1 }));
    setStudentSearchTerm(student.fullName);
    setShowStudentDropdown(false);
  };

  const openAccountStatement = async (repId: string) => {
    if (!repId) return;
    setShowAccountModal(true);
    setAccountLoading(true);
    setAccountData(null);
    try {
      const res = await getAccountStatement(repId, {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      if (res.result) {
        setAccountData(res.content);
      } else {
        toast.error(res.error?.[0] || 'Error al cargar estado de cuenta');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error de conexión');
    } finally {
      setAccountLoading(false);
    }
  };

  const closeAccountModal = () => {
    setShowAccountModal(false);
    setAccountData(null);
  };

  const fetchAllTransactionsForExport = async (): Promise<TransactionItem[]> => {
    const limit = 100;
    let page = 1;
    let allTransactions: TransactionItem[] = [];
    let totalPages = 1;

    do {
      const response = await getAllTransactions({
        search: filters.search || undefined,
        studentId: filters.studentId || undefined,
        representativeId: filters.representativeId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        createdByRole: filters.createdByRole || undefined,
        balanceStatus: filters.balanceStatus !== 'all' ? filters.balanceStatus : undefined,
        studentGrade: filters.studentGrade || undefined,
        studentSection: filters.studentSection || undefined,
        page,
        limit,
      });

      if (!response.result) {
        throw new Error(response.error?.[0] || 'Error al obtener datos para exportar');
      }

      allTransactions = allTransactions.concat(response.content.transactions);
      totalPages = response.content.pagination.totalPages;
      page++;
    } while (page <= totalPages);

    return allTransactions;
  };

  const usdToBs = (usd: number) => {
    if (!bcvRate || bcvRate.PriceRateBCV <= 0) return 0;
    return usd * bcvRate.PriceRateBCV;
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const allTx = await fetchAllTransactionsForExport();
      if (allTx.length === 0) {
        toast.error('No hay transacciones para exportar con los filtros actuales.');
        return;
      }

      const tableBody = allTx.map(t => {
        const isFee = t.type === 'fee';
        const isDeposit = t.type === 'deposit';
        const amountBs = t.amount;
        const displayStatus = isFee ? 'Pendiente' : (t.status === 'completed' ? 'Completado' : t.status);

        let desc = t.description || '—';
        if (t.metadata?.isMoved && t.metadata.movedFromStudentName && t.metadata.movedToStudentName) {
          desc += ` [Movido: ${t.metadata.movedFromStudentName} → ${t.metadata.movedToStudentName}]`;
        } else if (t.metadata?.isMovedRemainder && t.metadata.movedToStudentName) {
          desc += ` [Remanente, se movió a ${t.metadata.movedToStudentName}]`;
        }

        const creatorText = t.creator
          ? (t.creator.role === 'admin' ? 'Admin' : t.creator.role === 'representative' ? 'Representante' : 'Sistema')
          : (t.type === 'fee' || t.type === 'adjustment' ? 'Sistema' : '—');

        return [
          t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-VE') : '—',
          t.representative?.fullName || '—',
          t.student?.fullName || '—',
          t.student?.currentGrade || '—',
          t.student?.section || '—',
          desc,
          isDeposit ? 'DEPÓSITO' : t.type.toUpperCase(),
          `${isDeposit ? '+' : '-'}${formatCurrencyLocal(amountBs, 'VES')}`,
          t.amountUSD !== undefined ? formatCurrencyLocal(t.amountUSD, 'USD') : '—',
          t.bcvRate ? t.bcvRate.toFixed(4) : '—',
          t.reference || '—',
          creatorText,
          displayStatus,
        ];
      });

      const docDefinition: any = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [2, 2, 2, 2],
        content: [
          { text: 'HISTORIAL DE TRANSACCIONES', style: 'title' },
          { text: `Generado: ${new Date().toLocaleDateString('es-VE')} ${new Date().toLocaleTimeString('es-VE')}`, style: 'subtitle' },
          { text: `Cantidad de registros: ${allTx.length}`, style: 'subtitle' },
          { text: '\n' },
          {
            table: {
              headerRows: 1,
              widths: [42, 60, 70, 30, 30, 100, 35, 55, 45, 32, 55, 45, 45],
              body: [
                ['Fecha', 'Representante', 'Estudiante', 'Año', 'Sección', 'Descripción', 'Tipo', 'Monto Bs', 'USD', 'Tasa', 'Referencia', 'Hecho por', 'Estado'],
                ...tableBody,
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#aaaaaa',
              vLineColor: () => '#aaaaaa',
              paddingLeft: () => 2,
              paddingRight: () => 2,
              paddingTop: () => 1,
              paddingBottom: () => 1,
            },
          },
        ],
        styles: {
          title: { fontSize: 8, bold: true, alignment: 'center', margin: [0, 0, 0, 2] },
          subtitle: { fontSize: 6, alignment: 'center', color: 'gray', margin: [0, 0, 0, 2] },
        },
        defaultStyle: { fontSize: 5, lineHeight: 1.0 },
      };

      pdfMake.createPdf(docDefinition).download('Historial_Transacciones.pdf');
      toast.success(`PDF generado con ${allTx.length} transacciones.`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al exportar PDF.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const allTx = await fetchAllTransactionsForExport();
      if (allTx.length === 0) {
        toast.error('No hay transacciones para exportar con los filtros actuales.');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Historial de Transacciones');

      sheet.columns = [
        { header: 'Fecha', key: 'date', width: 12 },
        { header: 'Representante', key: 'rep', width: 25 },
        { header: 'Estudiante', key: 'student', width: 25 },
        { header: 'Año', key: 'grade', width: 8 },
        { header: 'Sección', key: 'section', width: 8 },
        { header: 'Descripción', key: 'description', width: 35 },
        { header: 'Tipo', key: 'type', width: 12 },
        { header: 'Monto Bs', key: 'amount', width: 15 },
        { header: 'USD', key: 'usd', width: 12 },
        { header: 'Tasa', key: 'rate', width: 12 },
        { header: 'Referencia', key: 'reference', width: 20 },
        { header: 'Hecho por', key: 'creator', width: 15 },
        { header: 'Estado', key: 'status', width: 14 },
      ];

      sheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
      });

      allTx.forEach(t => {
        const isFee = t.type === 'fee';
        const isDeposit = t.type === 'deposit';
        const amountBs = t.amount;
        const displayStatus = isFee ? 'Pendiente' : (t.status === 'completed' ? 'Completado' : t.status);

        let desc = t.description || '—';
        if (t.metadata?.isMoved && t.metadata.movedFromStudentName && t.metadata.movedToStudentName) {
          desc += ` [Movido: ${t.metadata.movedFromStudentName} → ${t.metadata.movedToStudentName}]`;
        } else if (t.metadata?.isMovedRemainder && t.metadata.movedToStudentName) {
          desc += ` [Remanente, se movió a ${t.metadata.movedToStudentName}]`;
        }

        const creatorText = t.creator
          ? (t.creator.role === 'admin' ? 'Admin' : t.creator.role === 'representative' ? 'Representante' : 'Sistema')
          : (t.type === 'fee' || t.type === 'adjustment' ? 'Sistema' : '—');

        sheet.addRow({
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-VE') : '—',
          rep: t.representative?.fullName || '—',
          student: t.student?.fullName || '—',
          grade: t.student?.currentGrade || '—',
          section: t.student?.section || '—',
          description: desc,
          type: isDeposit ? 'DEPÓSITO' : t.type.toUpperCase(),
          amount: `${isDeposit ? '+' : '-'}${formatCurrencyLocal(amountBs, 'VES')}`,
          usd: t.amountUSD !== undefined ? formatCurrencyLocal(t.amountUSD, 'USD') : '—',
          rate: t.bcvRate ? t.bcvRate.toFixed(4) : '—',
          reference: t.reference || '—',
          creator: creatorText,
          status: displayStatus,
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Historial_Transacciones.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Excel generado con ${allTx.length} transacciones.`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al exportar Excel.');
    } finally {
      setExporting(false);
    }
  };

  const renderMoveInfo = (t: TransactionItem) => {
    const meta = t.metadata;
    if (!meta) return null;

    if (meta.isMoved && meta.movedFromStudentName && meta.movedToStudentName) {
      return (
        <div className="mt-1 inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-2 py-0.5">
          <FaExchangeAlt className="text-[10px]" />
          <span>
            Movido de <strong>{meta.movedFromStudentName}</strong> → <strong>{meta.movedToStudentName}</strong>
          </span>
        </div>
      );
    }

    if (meta.isMovedRemainder && meta.movedToStudentName) {
      return (
        <div className="mt-1 inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-0.5">
          <FaExchangeAlt className="text-[10px]" />
          <span>Remanente (se movió a <strong>{meta.movedToStudentName}</strong>)</span>
        </div>
      );
    }

    return null;
  };

  const renderCreator = (t: TransactionItem) => {
    if (!t.creator) {
      if (t.type === 'fee' || t.type === 'adjustment') {
        return (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <FaCog className="text-[10px]" /> Sistema
          </span>
        );
      }
      return <span className="text-xs text-gray-400">—</span>;
    }
    if (t.creator.role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-semibold">
          <FaUserShield className="text-[10px]" /> Admin
        </span>
      );
    }
    if (t.creator.role === 'representative') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold">
          <FaUserTie className="text-[10px]" /> Representante
        </span>
      );
    }
    return <span className="text-xs text-gray-400">—</span>;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg"><FaHistory className="text-3xl text-white" /></div>
            <div><h1 className="text-3xl font-bold text-gray-800">Historial de Transacciones</h1><p className="text-gray-600">Consulte todos los movimientos financieros del sistema</p></div>
          </div>
          <div className="hidden md:block bg-white rounded-xl px-5 py-2 shadow-sm"><span className="text-sm text-gray-500">Total registros: </span><span className="font-bold text-blue-700">{pagination.totalRecords}</span></div>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaExchangeAlt className="text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">Tasa BCV del día:</span>
          </div>
          {bcvRate ? (
            <div className="text-right">
              <span className="text-lg font-bold text-blue-800">{bcvRate.PriceRateBCV.toFixed(2)} Bs/USD</span>
              <span className="text-xs text-blue-600 ml-2">{bcvRate.dtRate}</span>
            </div>
          ) : (
            <span className="text-red-600 text-sm">No disponible</span>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <div className="flex items-center space-x-2 mb-6"><FaFilter className="text-blue-600" /><h2 className="text-lg font-bold text-gray-700">Filtros de búsqueda</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Buscar</label>
              <input type="text" value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} placeholder="Referencia, descripción..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Representante</label>
              <input ref={repInputRef} type="text" value={repSearchTerm} onChange={(e) => { setRepSearchTerm(e.target.value); if (!e.target.value) setFilters(prev => ({ ...prev, representativeId: '' })); searchReps(e.target.value); }} placeholder="Buscar representante..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
              {showRepDropdown && repResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                  {repResults.map(rep => (
                    <div key={rep.id} onClick={() => selectRepresentative(rep)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700">{rep.fullName} <span className="text-sm text-gray-400">({rep.identityCard})</span></div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Estudiante</label>
              <input ref={studentInputRef} type="text" value={studentSearchTerm} onChange={(e) => { setStudentSearchTerm(e.target.value); if (!e.target.value) setFilters(prev => ({ ...prev, studentId: '' })); searchStudents(e.target.value); }} placeholder="Buscar estudiante..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
              {showStudentDropdown && studentResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                  {studentResults.map((student: any) => (
                    <div key={student.id} onClick={() => selectStudent(student)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700">{student.fullName} <span className="text-sm text-gray-400">({student.currentGrade || 'Sin grado'})</span></div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Año del estudiante</label>
              <select
                value={filters.studentGrade}
                onChange={(e) => setFilters(prev => ({ ...prev, studentGrade: e.target.value, page: 1 }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="">Todos los años</option>
                {GRADE_OPTIONS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Sección</label>
              <select
                value={filters.studentSection}
                onChange={(e) => setFilters(prev => ({ ...prev, studentSection: e.target.value, page: 1 }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="">Todas las secciones</option>
                {SECTION_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Estado de pago</label>
              <select
                value={filters.balanceStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, balanceStatus: e.target.value as any }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="all">Todos</option>
                <option value="debtors">Representantes Deudores</option>
                <option value="creditors">Representantes con pagos al día</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Hecho por</label>
              <select
                value={filters.createdByRole}
                onChange={(e) => setFilters(prev => ({ ...prev, createdByRole: e.target.value as any }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="">Todos</option>
                <option value="admin">Administradores</option>
                <option value="representative">Representantes</option>
                <option value="system">Sistema (Fees/Ajustes)</option>
              </select>
            </div>

            <div className="flex space-x-2 md:col-span-2">
              <div className="flex-1"><label className="block text-sm font-semibold text-gray-600 mb-1">Desde</label><input type="date" value={filters.startDate} onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="w-full px-2 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl" /></div>
              <div className="flex-1"><label className="block text-sm font-semibold text-gray-600 mb-1">Hasta</label><input type="date" value={filters.endDate} onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="w-full px-2 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl" /></div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={handleApplyFilters} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition"><FaSearch className="inline mr-2" /> Buscar</button>
            <button onClick={clearFilters} className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100"><FaTimes className="inline mr-2" /> Limpiar filtros</button>
            <button onClick={handleExportPDF} disabled={exporting} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition inline-flex items-center">
              <FaFilePdf className="inline mr-2" /> {exporting ? 'Exportando...' : 'Exportar PDF'}
            </button>
            <button onClick={handleExportExcel} disabled={exporting} className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl shadow-md hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition inline-flex items-center">
              <FaFileExcel className="inline mr-2" /> {exporting ? 'Exportando...' : 'Exportar Excel'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div></div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20"><FaHistory className="mx-auto text-4xl text-gray-300 mb-4" /><p className="text-gray-500 text-lg">No se encontraron transacciones</p><p className="text-gray-400">Pruebe ajustando los filtros</p></div>
          ) : (
            <>
              <div ref={topScrollRef} className="overflow-x-auto overflow-y-hidden border-b border-gray-200" style={{ height: '16px' }} onScroll={() => syncScroll('top')}>
                <div style={{ height: '1px' }}></div>
              </div>

              <div ref={mainScrollRef} className="overflow-x-auto" onScroll={() => syncScroll('main')}>
                <div ref={tableWidthRef}>
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="bg-blue-600">
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Fecha</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Representante</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Estudiante</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Descripción</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Tipo</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Monto (Bs)</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Pendiente (Bs)</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">A Favor (Bs)</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Tasa</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">USD</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Referencia</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Hecho por</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions.map(t => {
                        const isFee = t.type === 'fee';
                        const isDeposit = t.type === 'deposit';
                        const balanceAfterUSD = t.balanceAfter ?? 0;
                        const pendingUSD = balanceAfterUSD < 0 ? Math.abs(balanceAfterUSD) : 0;
                        const creditUSD = balanceAfterUSD > 0 ? balanceAfterUSD : 0;
                        const pendingBs = usdToBs(pendingUSD);
                        const creditBs = usdToBs(creditUSD);
                        const amountBs = t.amount;
                        const displayStatus = isFee ? 'Pendiente' : (t.status === 'completed' ? 'Completado' : t.status);

                        const studentBalance = t.student?.balance ?? 0;
                        const studentBalanceBs = studentBalance * (bcvRate?.PriceRateBCV || 0);

                        return (
                          <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-VE') : '-'}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {t.representative?.fullName ? (
                                <button
                                  onClick={() => openAccountStatement(t.representative!.id)}
                                  className="text-left hover:text-indigo-600 hover:underline inline-flex items-center gap-1"
                                  title="Ver estado de cuenta"
                                >
                                  <FaUser className="text-[10px] text-gray-400" />
                                  {t.representative.fullName}
                                </button>
                              ) : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <div>{t.student?.fullName || '—'}</div>
                              {t.student && studentBalance > 0 && (
                                <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-2 py-0.5">
                                  <FaBalanceScale className="text-[10px]" />
                                  Saldo: {formatCurrencyLocal(studentBalanceBs, 'VES')}
                                  <span className="text-green-600 font-bold">
                                    ≈ {formatCurrencyLocal(studentBalance, 'USD')}
                                  </span>
                                </div>
                              )}
                              {t.student && studentBalance < 0 && (
                                <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded px-2 py-0.5">
                                  <FaBalanceScale className="text-[10px]" />
                                  Saldo: {formatCurrencyLocal(studentBalanceBs, 'VES')}
                                  <span className="text-red-600 font-bold">
                                    ≈ {formatCurrencyLocal(studentBalance, 'USD')}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-[260px]">
                              <div className="truncate">{t.description || '—'}</div>
                              {renderMoveInfo(t)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${isDeposit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {isDeposit ? 'DEPÓSITO' : t.type.toUpperCase()}
                              </span>
                            </td>
                            <td className={`px-6 py-4 text-sm font-bold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                              {isDeposit ? '+' : '-'}{formatCurrencyLocal(amountBs, 'VES')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {pendingBs > 0 ? formatCurrencyLocal(pendingBs, 'VES') : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-green-700">
                              {creditBs > 0 ? formatCurrencyLocal(creditBs, 'VES') : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{t.bcvRate ? t.bcvRate.toFixed(4) : '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {t.amountUSD !== undefined ? formatCurrencyLocal(t.amountUSD, 'USD') : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{t.reference || '—'}</td>
                            <td className="px-6 py-4">{renderCreator(t)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${displayStatus === 'Completado' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {displayStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
              <span className="text-sm text-gray-600">Página {pagination.currentPage} de {pagination.totalPages} (Total: {pagination.totalRecords})</span>
              <div className="flex space-x-2">
                <button disabled={filters.page === 1} onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))} className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"><FaChevronLeft className="text-gray-600" /></button>
                <button disabled={filters.page === pagination.totalPages} onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))} className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"><FaChevronRight className="text-gray-600" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg"><FaClipboardList /></div>
                <div>
                  <h3 className="text-xl font-bold">Estado de Cuenta</h3>
                  {accountData && (
                    <p className="text-indigo-100 text-sm">
                      {accountData.representative.fullName} — {accountData.representative.identityCard}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={closeAccountModal} className="text-white hover:text-indigo-200 transition-colors"><FaTimes /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {accountLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : !accountData ? (
                <div className="text-center py-20 text-gray-500">Sin datos</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-xs font-medium text-red-700">Total Cargos</p>
                      <p className="text-lg font-bold text-red-800 mt-1">{formatCurrencyLocal(accountData.summary.totalCargosBs, 'VES')}</p>
                      <p className="text-xs text-red-700">≈ {formatCurrencyLocal(accountData.summary.totalCargosUSD, 'USD')}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-xs font-medium text-green-700">Total Abonos</p>
                      <p className="text-lg font-bold text-green-800 mt-1">{formatCurrencyLocal(accountData.summary.totalAbonosBs, 'VES')}</p>
                      <p className="text-xs text-green-700">≈ {formatCurrencyLocal(accountData.summary.totalAbonosUSD, 'USD')}</p>
                    </div>
                    <div className={`border rounded-xl p-4 ${accountData.summary.saldoFinalUSD < 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                      <p className={`text-xs font-medium ${accountData.summary.saldoFinalUSD < 0 ? 'text-red-700' : 'text-blue-700'}`}>Saldo Final</p>
                      <p className={`text-lg font-bold mt-1 ${accountData.summary.saldoFinalUSD < 0 ? 'text-red-800' : 'text-blue-800'}`}>
                        {formatCurrencyLocal(accountData.summary.saldoFinalUSD * (bcvRate?.PriceRateBCV || 0), 'VES')}
                      </p>
                      <p className={`text-xs ${accountData.summary.saldoFinalUSD < 0 ? 'text-red-700' : 'text-blue-700'}`}>
                        ≈ {formatCurrencyLocal(accountData.summary.saldoFinalUSD, 'USD')}
                      </p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <p className="text-xs font-medium text-gray-700">Transacciones</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">{accountData.summary.transactionCount}</p>
                    </div>
                  </div>

                  {accountData.representative.students && accountData.representative.students.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FaBalanceScale className="text-indigo-600" /> Estudiantes ({accountData.representative.students.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {accountData.representative.students.map((s: any) => (
                          <div key={s.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{s.fullName}</p>
                              <p className="text-xs text-gray-500">{s.currentGrade} • {s.status}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${s.balance < 0 ? 'text-red-600' : s.balance > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                {formatCurrencyLocal((s.balance || 0) * (bcvRate?.PriceRateBCV || 0), 'VES')}
                              </p>
                              <p className="text-xs text-gray-500">≈ {formatCurrencyLocal(s.balance || 0, 'USD')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Historial en el rango seleccionado</h4>
                    {accountData.transactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">Sin transacciones</div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Fecha</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Estudiante</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Descripción</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Tipo</th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Bs</th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">USD</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {accountData.transactions.map((t: any) => {
                              const isDeposit = t.type === 'deposit';
                              return (
                                <tr key={t.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-VE') : '—'}
                                  </td>
                                  <td className="px-3 py-2 text-xs text-gray-700">{t.student?.fullName || '—'}</td>
                                  <td className="px-3 py-2 text-xs text-gray-700 max-w-[250px] truncate">{t.description || '—'}</td>
                                  <td className="px-3 py-2 text-xs">
                                    <span className={`px-2 py-0.5 rounded-full font-bold ${isDeposit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {isDeposit ? 'DEPÓSITO' : t.type.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className={`px-3 py-2 text-xs text-right font-bold ${isDeposit ? 'text-green-700' : 'text-red-700'}`}>
                                    {isDeposit ? '+' : '-'}{formatCurrencyLocal(t.amount || 0, 'VES')}
                                  </td>
                                  <td className="px-3 py-2 text-xs text-right text-gray-700">
                                    {t.amountUSD !== undefined ? formatCurrencyLocal(t.amountUSD, 'USD') : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;