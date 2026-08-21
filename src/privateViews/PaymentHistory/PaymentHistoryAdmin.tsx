import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaSearch, FaHistory, FaFilter, FaTimes, FaChevronLeft, FaChevronRight, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllTransactions } from '../../apis/balance';
import { getPaginatedStudentsAPI } from '../../apis/student';
import api from '../../library/axios';
import { mapPaymentMethodToDisplay } from '../balance/utils/balanceUtils';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import ExcelJS from 'exceljs';

(pdfMake as any).vfs = pdfFonts.vfs;

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
  student?: { id: string; fullName: string; currentGrade?: string } | null;
  representative?: { id: string; fullName: string; identityCard: string };
}

const formatCurrencyLocal = (amount: number, currency: 'VES' | 'USD') => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const PaymentHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    studentId: '',
    representativeId: '',
    startDate: '',
    endDate: '',
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

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllTransactions({
        ...filters,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        representativeId: filters.representativeId || undefined,
        studentId: filters.studentId || undefined,
        search: filters.search || undefined,
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
    setFilters({ search: '', studentId: '', representativeId: '', startDate: '', endDate: '', page: 1, limit: 20 });
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

  // Función para obtener TODAS las transacciones según filtros usando paginación con límite 100
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

  // 🖨️ Exportación PDF
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const allTx = await fetchAllTransactionsForExport();

      if (allTx.length === 0) {
        toast.error('No hay transacciones para exportar con los filtros actuales.');
        setExporting(false);
        return;
      }

      const tableBody = allTx.map(t => {
        const isFee = t.type === 'fee';
        const isDeposit = t.type === 'deposit';
        const balanceAfter = t.balanceAfter ?? 0;
        const pendingAmount = balanceAfter < 0 ? Math.abs(balanceAfter) : 0;
        const creditAmount = balanceAfter > 0 ? balanceAfter : 0;
        const paidAmount = isDeposit ? t.amount : 0;
        const displayMethod = isFee ? '—' : mapPaymentMethodToDisplay(t.paymentMethod);
        const displayStatus = isFee ? 'Pendiente' : (t.status === 'completed' ? 'Completado' : t.status);
        const displayPaymentStatus = isFee ? 'Incompleto' : (balanceAfter < 0 ? 'Incompleto' : 'Completo');

        return [
          t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-VE') : '—',
          t.representative?.fullName || '—',
          t.student?.fullName || '—',
          t.description || '—',
          isDeposit ? 'DEPÓSITO' : t.type.toUpperCase(),
          `${isDeposit ? '+' : '-'}${formatCurrencyLocal(t.amount, 'VES')}`,
          pendingAmount > 0 ? formatCurrencyLocal(pendingAmount, 'VES') : '—',
          creditAmount > 0 ? formatCurrencyLocal(creditAmount, 'VES') : '—',
          paidAmount > 0 ? formatCurrencyLocal(paidAmount, 'VES') : '—',
          t.bcvRate ? t.bcvRate.toFixed(4) : '—',
          t.amountUSD !== undefined ? formatCurrencyLocal(t.amountUSD, 'USD') : '—',
          displayMethod,
          t.reference || '—',
          displayStatus,
          displayPaymentStatus,
        ];
      });

            const docDefinition: any = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [1, 1, 1, 1],
        content: [
          { text: 'HISTORIAL DE TRANSACCIONES', style: 'title' },
          { text: `Generado: ${new Date().toLocaleDateString('es-VE')} ${new Date().toLocaleTimeString('es-VE')}`, style: 'subtitle' },
          { text: `Cantidad de registros: ${allTx.length}`, style: 'subtitle' },
          { text: '\n' },
          {
            table: {
              headerRows: 1,
              widths: [42, 60, 60, 80, 35, 50, 50, 50, 55, 35, 42, 50, 60, 45, 45],
              body: [
                [
                  'Fecha', 'Representante', 'Estudiante', 'Descripción', 'Tipo',
                  'Monto Bs', 'Pendiente', 'A Favor', 'Bs Cancelado', 'Tasa',
                  'USD', 'Método', 'Referencia', 'Estado', 'Pago'
                ],
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

  // 📊 Exportación Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const allTx = await fetchAllTransactionsForExport();

      if (allTx.length === 0) {
        toast.error('No hay transacciones para exportar con los filtros actuales.');
        setExporting(false);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Historial de Transacciones');

      sheet.columns = [
        { header: 'Fecha', key: 'date', width: 12 },
        { header: 'Representante', key: 'rep', width: 25 },
        { header: 'Estudiante', key: 'student', width: 25 },
        { header: 'Descripción', key: 'description', width: 30 },
        { header: 'Tipo', key: 'type', width: 12 },
        { header: 'Monto Bs', key: 'amount', width: 15 },
        { header: 'Monto Pendiente', key: 'pending', width: 15 },
        { header: 'Monto a Favor', key: 'credit', width: 15 },
        { header: 'Monto Bs Cancelado', key: 'paid', width: 18 },
        { header: 'Tasa', key: 'rate', width: 12 },
        { header: 'USD', key: 'usd', width: 12 },
        { header: 'Método', key: 'method', width: 18 },
        { header: 'Referencia', key: 'reference', width: 20 },
        { header: 'Estado', key: 'status', width: 14 },
        { header: 'Pago', key: 'payment', width: 14 },
      ];

      sheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
      });

      allTx.forEach(t => {
        const isFee = t.type === 'fee';
        const isDeposit = t.type === 'deposit';
        const balanceAfter = t.balanceAfter ?? 0;
        const pendingAmount = balanceAfter < 0 ? Math.abs(balanceAfter) : 0;
        const creditAmount = balanceAfter > 0 ? balanceAfter : 0;
        const paidAmount = isDeposit ? t.amount : 0;
        const displayMethod = isFee ? '—' : mapPaymentMethodToDisplay(t.paymentMethod);
        const displayStatus = isFee ? 'Pendiente' : (t.status === 'completed' ? 'Completado' : t.status);
        const displayPaymentStatus = isFee ? 'Incompleto' : (balanceAfter < 0 ? 'Incompleto' : 'Completo');

        sheet.addRow({
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-VE') : '—',
          rep: t.representative?.fullName || '—',
          student: t.student?.fullName || '—',
          description: t.description || '—',
          type: isDeposit ? 'DEPÓSITO' : t.type.toUpperCase(),
          amount: `${isDeposit ? '+' : '-'}${formatCurrencyLocal(t.amount, 'VES')}`,
          pending: pendingAmount > 0 ? formatCurrencyLocal(pendingAmount, 'VES') : '—',
          credit: creditAmount > 0 ? formatCurrencyLocal(creditAmount, 'VES') : '—',
          paid: paidAmount > 0 ? formatCurrencyLocal(paidAmount, 'VES') : '—',
          rate: t.bcvRate ? t.bcvRate.toFixed(4) : '—',
          usd: t.amountUSD !== undefined ? formatCurrencyLocal(t.amountUSD, 'USD') : '—',
          method: displayMethod,
          reference: t.reference || '—',
          status: displayStatus,
          payment: displayPaymentStatus,
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

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <div className="flex items-center space-x-2 mb-6"><FaFilter className="text-blue-600" /><h2 className="text-lg font-bold text-gray-700">Filtros de búsqueda</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Buscar</label>
              <input type="text" value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} placeholder="Referencia, descripción..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
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
            <div className="flex space-x-2">
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
              <div
                ref={topScrollRef}
                className="overflow-x-auto overflow-y-hidden border-b border-gray-200"
                style={{ height: '16px' }}
                onScroll={() => syncScroll('top')}
              >
                <div style={{ height: '1px' }}></div>
              </div>

              <div
                ref={mainScrollRef}
                className="overflow-x-auto"
                onScroll={() => syncScroll('main')}
              >
                <div ref={tableWidthRef}>
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="bg-blue-600">
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Representante</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Estudiante</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Descripción</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Monto (Bs)</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Monto Pendiente</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Monto a Favor</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Monto Bs Cancelado</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tasa</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">USD</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Método</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Referencia</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Pago</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions.map(t => {
                        const isFee = t.type === 'fee';
                        const isDeposit = t.type === 'deposit';
                        const balanceAfter = t.balanceAfter ?? 0;
                        const pendingAmount = balanceAfter < 0 ? Math.abs(balanceAfter) : 0;
                        const creditAmount = balanceAfter > 0 ? balanceAfter : 0;
                        const paidAmount = isDeposit ? t.amount : 0;
                        const displayMethod = isFee ? '—' : mapPaymentMethodToDisplay(t.paymentMethod);
                        const displayStatus = isFee ? 'Pendiente' : (t.status === 'completed' ? 'Completado' : t.status);
                        const displayPaymentStatus = isFee ? 'Incompleto' : (balanceAfter < 0 ? 'Incompleto' : 'Completo');

                        return (
                          <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-VE') : '-'}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{t.representative?.fullName || '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{t.student?.fullName || '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{t.description || '—'}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${isDeposit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {isDeposit ? 'DEPÓSITO' : t.type.toUpperCase()}
                              </span>
                            </td>
                            <td className={`px-6 py-4 text-sm font-bold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                              {isDeposit ? '+' : '-'}{formatCurrencyLocal(t.amount, 'VES')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {pendingAmount > 0 ? formatCurrencyLocal(pendingAmount, 'VES') : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-green-700">
                              {creditAmount > 0 ? formatCurrencyLocal(creditAmount, 'VES') : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {paidAmount > 0 ? formatCurrencyLocal(paidAmount, 'VES') : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{t.bcvRate ? t.bcvRate.toFixed(4) : '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{t.amountUSD !== undefined ? formatCurrencyLocal(t.amountUSD, 'USD') : '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">{displayMethod}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{t.reference || '—'}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${displayStatus === 'Completado' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {displayStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${displayPaymentStatus === 'Incompleto' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {displayPaymentStatus}
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
    </div>
  );
};

export default PaymentHistory;