import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FaSearch, FaFilter, FaTimes, FaChevronLeft, FaChevronRight,
  FaExchangeAlt, FaUser, FaUserTie, FaBalanceScale,
  FaTrophy, FaArrowUp, FaArrowDown, FaUserGraduate,
  FaFilePdf, FaFileExcel, // ⬅️ NUEVO
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getStoredRateAPI, type BCVRateResponse } from '../../apis/bank';
import api from '../../library/axios';
import pdfMake from 'pdfmake/build/pdfmake'; // ⬅️ NUEVO
import pdfFonts from 'pdfmake/build/vfs_fonts'; // ⬅️ NUEVO
import ExcelJS from 'exceljs'; // ⬅️ NUEVO

(pdfMake as any).vfs = pdfFonts.vfs;

interface StudentRankingItem {
  id: string;
  fullName: string;
  identityCard: string;
  currentGrade: string;
  section: string;
  status: string;
  balanceUSD: number;
  representativeId?: string;
  representativeName?: string;
  representativeIdentityCard?: string;
}

interface RankingResponse {
  students: StudentRankingItem[];
  pagination: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };
  summary: {
    totalDebtUSD: number;
    totalCreditUSD: number;
    countDebtors: number;
    countCreditors: number;
  };
}

type RankingType = 'debtors' | 'creditors' | 'up_to_date' | 'all';
type RankDirection = 'most' | 'least';

const GRADE_OPTIONS = ['1ro', '2do', '3ro', '4to', '5to', '6to'];
const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];

const formatBs = (amount: number) =>
  new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);
const formatUsd = (amount: number) =>
  new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(amount);

export default function StudentsRanking() {
  const [searchParams] = useSearchParams();
  const urlType = searchParams.get('type') as RankingType | null;
  const initialType: RankingType = urlType && ['debtors', 'creditors', 'up_to_date', 'all'].includes(urlType)
    ? urlType
    : 'debtors';

  const [bcvRate, setBcvRate] = useState<BCVRateResponse | null>(null);
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false); // ⬅️ NUEVO

  const [filters, setFilters] = useState({
    type: initialType,
    rankDirection: 'most' as RankDirection,
    search: '',
    representativeId: '',
    grade: '',
    section: '',
    page: 1,
    limit: 20,
  });

  const [repSearchTerm, setRepSearchTerm] = useState('');
  const [repResults, setRepResults] = useState<any[]>([]);
  const [showRepDropdown, setShowRepDropdown] = useState(false);
  const [selectedRepName, setSelectedRepName] = useState('');
  const repInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (tableWidthRef.current && topScrollRef.current) {
      const contentWidth = tableWidthRef.current.scrollWidth;
      const innerDiv = topScrollRef.current.querySelector('div');
      if (innerDiv) {
        innerDiv.style.width = `${contentWidth}px`;
      }
    }
  }, [data?.students]);

  useEffect(() => {
    if (urlType && ['debtors', 'creditors', 'up_to_date', 'all'].includes(urlType)) {
      setFilters(prev => prev.type === urlType ? prev : { ...prev, type: urlType, page: 1 });
    }
  }, [urlType]);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await getStoredRateAPI();
        if (res.result && res.content) setBcvRate(res.content);
      } catch (err) {
        console.error('Error al obtener tasa BCV', err);
      }
    };
    fetchRate();
  }, []);

  const computeSortOrder = (type: RankingType, dir: RankDirection): 'asc' | 'desc' => {
    if (type === 'debtors') return dir === 'most' ? 'asc' : 'desc';
    if (type === 'creditors') return dir === 'most' ? 'desc' : 'asc';
    if (type === 'up_to_date') return dir === 'most' ? 'asc' : 'desc';
    return dir === 'most' ? 'desc' : 'asc';
  };

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    try {
      const sortOrder = computeSortOrder(filters.type, filters.rankDirection);
      const { data: res } = await api.get('/private/balance/students-ranking', {
        params: {
          type: filters.type,
          search: filters.search || undefined,
          representativeId: filters.representativeId || undefined,
          grade: filters.grade || undefined,
          section: filters.section || undefined,
          page: filters.page,
          limit: filters.limit,
          sortOrder,
        },
      });
      if (res.result) {
        setData(res.content);
      } else {
        toast.error(res.error?.[0] || 'Error al cargar el ranking');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.[0] || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const searchReps = useCallback(async (term: string) => {
    if (term.length < 2) { setRepResults([]); return; }
    try {
      const { data } = await api.get('/private/balance/representatives', { params: { search: term, limit: 10 } });
      if (data.result) {
        setRepResults(data.content.representatives || data.content || []);
        setShowRepDropdown(true);
      }
    } catch (err) { /* silencioso */ }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (repSearchTerm.trim().length >= 2) searchReps(repSearchTerm);
      else setRepResults([]);
    }, 300);
    return () => clearTimeout(t);
  }, [repSearchTerm, searchReps]);

  const handleApplyFilters = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'debtors',
      rankDirection: 'most',
      search: '',
      representativeId: '',
      grade: '',
      section: '',
      page: 1,
      limit: 20,
    });
    setRepSearchTerm('');
    setSelectedRepName('');
    setRepResults([]);
    setShowRepDropdown(false);
  };

  const selectRepresentative = (rep: any) => {
    setFilters(prev => ({ ...prev, representativeId: rep.id, page: 1 }));
    setSelectedRepName(rep.fullName);
    setRepSearchTerm('');
    setShowRepDropdown(false);
  };

  const clearRepresentative = () => {
    setFilters(prev => ({ ...prev, representativeId: '', page: 1 }));
    setSelectedRepName('');
    setRepSearchTerm('');
  };

  // ═══════════════════════════════════════════════════════════════
  // 🔽 NUEVO: Helpers para exportación
  // ═══════════════════════════════════════════════════════════════
  const getTypeLabel = (): string => {
    const labels: Record<RankingType, string> = {
      debtors: 'Deudores (más de $1)',
      creditors: 'Con saldo a favor',
      up_to_date: 'Al día (entre -$1 y $0)',
      all: 'Todos los estudiantes',
    };
    return labels[filters.type];
  };

  const getDirectionLabel = (): string => {
    if (filters.type === 'creditors') return filters.rankDirection === 'most' ? 'Mayor saldo primero' : 'Menor saldo primero';
    if (filters.type === 'debtors') return filters.rankDirection === 'most' ? 'Mayor deuda primero' : 'Menor deuda primero';
    if (filters.type === 'up_to_date') return filters.rankDirection === 'most' ? 'Deuda más cercana a $1 primero' : 'Deuda cero primero';
    return filters.rankDirection === 'most' ? 'Mayor saldo primero' : 'Menor saldo primero';
  };

  const getFilterDescriptions = (): string[] => {
    const descriptions: string[] = [];
    descriptions.push(`Tipo: ${getTypeLabel()}`);
    descriptions.push(`Orden: ${getDirectionLabel()}`);
    if (filters.search) descriptions.push(`Búsqueda: "${filters.search}"`);
    if (selectedRepName) descriptions.push(`Representante: ${selectedRepName}`);
    if (filters.grade) descriptions.push(`Año: ${filters.grade}`);
    if (filters.section) descriptions.push(`Sección: ${filters.section}`);
    return descriptions;
  };

  const fetchAllStudentsForExport = async (): Promise<StudentRankingItem[]> => {
    const limitPerPage = 100;
    let page = 1;
    let allStudents: StudentRankingItem[] = [];
    let totalPages = 1;

    do {
      const sortOrder = computeSortOrder(filters.type, filters.rankDirection);
      const { data: res } = await api.get('/private/balance/students-ranking', {
        params: {
          type: filters.type,
          search: filters.search || undefined,
          representativeId: filters.representativeId || undefined,
          grade: filters.grade || undefined,
          section: filters.section || undefined,
          page,
          limit: limitPerPage,
          sortOrder,
        },
      });

      if (!res.result) {
        throw new Error(res.error?.[0] || 'Error al obtener datos para exportar');
      }

      allStudents = allStudents.concat(res.content.students || []);
      totalPages = res.content.pagination.totalPages;
      page++;
    } while (page <= totalPages);

    return allStudents;
  };

  const handleExportPDF = async () => {
    if (!bcvRate) {
      toast.error('La tasa BCV aún no está disponible. Intenta de nuevo en unos segundos.');
      return;
    }
    setExporting(true);
    try {
      const allStudents = await fetchAllStudentsForExport();
      if (allStudents.length === 0) {
        toast.error('No hay estudiantes para exportar con los filtros actuales.');
        return;
      }

      const tableBody = allStudents.map((s, idx) => {
        const balance = s.balanceUSD || 0;
        const isDebt = balance < -1;
        const isCredit = balance > 0;
        const stateLabel = isDebt ? 'Deudor' : isCredit ? 'Saldo a favor' : 'Al día';
        const balanceBs = balance * bcvRate.PriceRateBCV;

        return [
          (idx + 1).toString(),
          s.fullName || '—',
          s.identityCard || '—',
          s.currentGrade || '—',
          s.section || '—',
          s.representativeName || '—',
          formatBs(balanceBs),
          formatUsd(balance),
          stateLabel,
        ];
      });

      const filterDescriptions = getFilterDescriptions();

      const docDefinition: any = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [20, 20, 20, 20],
        content: [
          { text: 'RANKING DE ESTUDIANTES', style: 'title' },
          { text: 'U.E. José Antonio Abreu', style: 'subtitle' },
          { text: `Generado: ${new Date().toLocaleDateString('es-VE')} a las ${new Date().toLocaleTimeString('es-VE')}`, style: 'subtitle' },
          { text: '\n' },
          {
            text: [
              { text: 'Filtros aplicados: ', bold: true, fontSize: 8 },
              { text: filterDescriptions.join('  |  '), fontSize: 8 },
            ],
            margin: [0, 4, 0, 2],
          },
          {
            text: `Total de estudiantes: ${allStudents.length}`,
            fontSize: 8,
            bold: true,
            margin: [0, 2, 0, 6],
          },
          {
            table: {
              headerRows: 1,
              widths: [25, '*', 60, 35, 35, 100, 65, 55, 50],
              body: [
                ['#', 'Estudiante', 'Cédula', 'Año', 'Sec.', 'Representante', 'Saldo (Bs)', 'Saldo (USD)', 'Estado'],
                ...tableBody,
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#aaaaaa',
              vLineColor: () => '#aaaaaa',
              paddingLeft: () => 3,
              paddingRight: () => 3,
              paddingTop: () => 2,
              paddingBottom: () => 2,
            },
          },
        ],
        styles: {
          title: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 2] },
          subtitle: { fontSize: 9, alignment: 'center', color: '#555', margin: [0, 0, 0, 1] },
        },
        defaultStyle: { fontSize: 8, lineHeight: 1.15 },
      };

      pdfMake.createPdf(docDefinition).download(`Ranking_Estudiantes_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success(`PDF generado con ${allStudents.length} estudiantes.`);
    } catch (error: any) {
      console.error('Error al exportar PDF:', error);
      toast.error(error.message || 'Error al exportar PDF.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!bcvRate) {
      toast.error('La tasa BCV aún no está disponible. Intenta de nuevo en unos segundos.');
      return;
    }
    setExporting(true);
    try {
      const allStudents = await fetchAllStudentsForExport();
      if (allStudents.length === 0) {
        toast.error('No hay estudiantes para exportar con los filtros actuales.');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'U.E. José Antonio Abreu';
      workbook.created = new Date();

      // Hoja 1: Filtros aplicados
      const infoSheet = workbook.addWorksheet('Filtros');
      infoSheet.columns = [
        { header: 'Campo', key: 'field', width: 22 },
        { header: 'Valor', key: 'value', width: 60 },
      ];
      infoSheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
      });
      infoSheet.addRow({ field: 'Tipo', value: getTypeLabel() });
      infoSheet.addRow({ field: 'Orden', value: getDirectionLabel() });
      infoSheet.addRow({ field: 'Búsqueda', value: filters.search || 'Sin filtro' });
      infoSheet.addRow({ field: 'Representante', value: selectedRepName || 'Sin filtro' });
      infoSheet.addRow({ field: 'Año', value: filters.grade || 'Sin filtro' });
      infoSheet.addRow({ field: 'Sección', value: filters.section || 'Sin filtro' });
      infoSheet.addRow({ field: 'Total estudiantes', value: allStudents.length });
      infoSheet.addRow({ field: 'Generado', value: `${new Date().toLocaleDateString('es-VE')} ${new Date().toLocaleTimeString('es-VE')}` });

      // Hoja 2: Datos
      const sheet = workbook.addWorksheet('Ranking');
      sheet.columns = [
        { header: '#', key: 'num', width: 6 },
        { header: 'Estudiante', key: 'name', width: 32 },
        { header: 'Cédula', key: 'id', width: 15 },
        { header: 'Año', key: 'grade', width: 10 },
        { header: 'Sección', key: 'section', width: 10 },
        { header: 'Representante', key: 'rep', width: 30 },
        { header: 'Saldo (Bs)', key: 'bs', width: 18 },
        { header: 'Saldo (USD)', key: 'usd', width: 15 },
        { header: 'Estado', key: 'status', width: 15 },
      ];

      sheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
      });

      allStudents.forEach((s, idx) => {
        const balance = s.balanceUSD || 0;
        const isDebt = balance < -1;
        const isCredit = balance > 0;
        const stateLabel = isDebt ? 'Deudor' : isCredit ? 'Saldo a favor' : 'Al día';
        const balanceBs = balance * bcvRate.PriceRateBCV;

        sheet.addRow({
          num: idx + 1,
          name: s.fullName || '—',
          id: s.identityCard || '—',
          grade: s.currentGrade || '—',
          section: s.section || '—',
          rep: s.representativeName || '—',
          bs: formatBs(balanceBs),
          usd: formatUsd(balance),
          status: stateLabel,
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Ranking_Estudiantes_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Excel generado con ${allStudents.length} estudiantes.`);
    } catch (error: any) {
      console.error('Error al exportar Excel:', error);
      toast.error(error.message || 'Error al exportar Excel.');
    } finally {
      setExporting(false);
    }
  };

  const summary = data?.summary;
  const students = data?.students || [];
  const pagination = data?.pagination;

  const sortLabel = filters.type === 'creditors'
    ? { most: 'Mayor saldo primero', least: 'Menor saldo primero' }
    : filters.type === 'debtors'
    ? { most: 'Mayor deuda primero', least: 'Menor deuda primero' }
    : filters.type === 'up_to_date'
    ? { most: 'Deuda más cercana a $1 primero', least: 'Deuda cero primero' }
    : { most: 'Mayor saldo primero', least: 'Menor saldo primero' };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 rounded-2xl shadow-lg">
              <FaTrophy className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Ranking de Estudiantes</h1>
              <p className="text-gray-600">Consulta de mayor deuda o mayor saldo a favor por estudiante</p>
            </div>
          </div>
          {bcvRate && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-blue-800 flex items-center gap-2">
              <FaExchangeAlt />
              <span className="text-sm font-bold">{bcvRate.PriceRateBCV.toFixed(2)} Bs/USD</span>
              <span className="text-xs text-blue-600">{bcvRate.dtRate}</span>
            </div>
          )}
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-700 uppercase">Total Deuda</p>
              <p className="text-xl font-bold text-red-800 mt-1">{formatBs(summary.totalDebtUSD * (bcvRate?.PriceRateBCV || 0))}</p>
              <p className="text-xs text-red-700 font-bold mt-0.5">≈ {formatUsd(summary.totalDebtUSD)}</p>
              <p className="text-xs text-red-600 mt-1">{summary.countDebtors} estudiantes</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-700 uppercase">Total a Favor</p>
              <p className="text-xl font-bold text-green-800 mt-1">{formatBs(summary.totalCreditUSD * (bcvRate?.PriceRateBCV || 0))}</p>
              <p className="text-xs text-green-700 font-bold mt-0.5">≈ {formatUsd(summary.totalCreditUSD)}</p>
              <p className="text-xs text-green-600 mt-1">{summary.countCreditors} estudiantes</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase">Registros</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{pagination?.totalRecords ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">con los filtros actuales</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase">Balance Neto</p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {formatBs((summary.totalCreditUSD - summary.totalDebtUSD) * (bcvRate?.PriceRateBCV || 0))}
              </p>
              <p className="text-xs text-gray-500 font-bold mt-0.5">
                ≈ {formatUsd(summary.totalCreditUSD - summary.totalDebtUSD)}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaFilter className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-700">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Ver</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as RankingType, page: 1 }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="debtors">Quienes me deben (más de $1)</option>
                <option value="up_to_date">Al día (entre -$1 y $0)</option>
                <option value="creditors">Quienes tienen saldo a favor</option>
                <option value="all">Todos los estudiantes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Ordenar por</label>
              <select
                value={filters.rankDirection}
                onChange={(e) => setFilters(prev => ({ ...prev, rankDirection: e.target.value as RankDirection, page: 1 }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="most">{sortLabel.most}</option>
                <option value="least">{sortLabel.least}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Buscar</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Nombre, cédula..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Año del estudiante</label>
              <select
                value={filters.grade}
                onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value, page: 1 }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="">Todos los años</option>
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Sección</label>
              <select
                value={filters.section}
                onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value, page: 1 }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="">Todas las secciones</option>
                {SECTION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="lg:col-span-3 relative">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Representante (verá todos sus hijos)</label>

              {selectedRepName ? (
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                  <FaUserTie className="text-indigo-600" />
                  <span className="text-indigo-800 font-semibold flex-1 truncate">{selectedRepName}</span>
                  <button
                    onClick={clearRepresentative}
                    className="text-red-600 hover:text-red-800"
                    title="Quitar filtro"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    ref={repInputRef}
                    type="text"
                    value={repSearchTerm}
                    onChange={(e) => setRepSearchTerm(e.target.value)}
                    placeholder="Escriba nombre o cédula del representante..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                  {showRepDropdown && repResults.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-auto">
                      {repResults.map(rep => (
                        <div
                          key={rep.id}
                          onClick={() => selectRepresentative(rep)}
                          className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-gray-700 flex justify-between items-center"
                        >
                          <span>{rep.fullName}</span>
                          <span className="text-xs text-gray-400">{rep.identityCard}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleApplyFilters}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition inline-flex items-center"
            >
              <FaSearch className="mr-2" /> Aplicar filtros
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 inline-flex items-center"
            >
              <FaTimes className="mr-2" /> Limpiar
            </button>

            {/* 🔽 NUEVO: Botones de exportación */}
            <button
              onClick={handleExportPDF}
              disabled={exporting || loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center"
              title="Exportar la lista completa con los filtros actuales a PDF"
            >
              <FaFilePdf className="mr-2" /> {exporting ? 'Exportando...' : 'Exportar PDF'}
            </button>
            <button
              onClick={handleExportExcel}
              disabled={exporting || loading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl shadow-md hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center"
              title="Exportar la lista completa con los filtros actuales a Excel"
            >
              <FaFileExcel className="mr-2" /> {exporting ? 'Exportando...' : 'Exportar Excel'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col mb-8" style={{ maxHeight: '75vh' }}>
          
          {!loading && students.length > 0 && (
            <div
              ref={topScrollRef}
              className="bg-gray-100 border-b border-gray-300 shrink-0"
              style={{ overflowX: 'auto', overflowY: 'hidden', height: '18px' }}
              onScroll={() => syncScroll('top')}
            >
              <div style={{ height: '1px' }}></div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64 flex-1">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-20 flex-1">
              <FaUserGraduate className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No se encontraron estudiantes</p>
              <p className="text-gray-400">Pruebe ajustando los filtros</p>
            </div>
          ) : (
            <div
              ref={mainScrollRef}
              className="overflow-auto flex-1"
              onScroll={() => syncScroll('main')}
            >
              <div ref={tableWidthRef}>
                <table className="w-full min-w-max border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-indigo-600">
                      <th className="px-5 py-4 text-left text-xs font-bold text-white uppercase whitespace-nowrap">#</th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Estudiante</th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Cédula</th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Año</th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Sección</th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Representante</th>
                      <th className="px-5 py-4 text-right text-xs font-bold text-white uppercase whitespace-nowrap">Saldo (Bs)</th>
                      <th className="px-5 py-4 text-right text-xs font-bold text-white uppercase whitespace-nowrap">Saldo (USD)</th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {students.map((s, idx) => {
                      const balance = s.balanceUSD;
                      const isDebt = balance < -1;
                      const isCredit = balance > 0;
                      const isUpToDate = balance >= -1 && balance <= 0;
                      const balanceBs = balance * (bcvRate?.PriceRateBCV || 0);
                      const stateLabel = isDebt ? 'Deudor' : isCredit ? 'Saldo a favor' : 'Al día';
                      const stateColor = isDebt
                        ? 'bg-red-100 text-red-800'
                        : isCredit
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800';

                      const rank = (pagination?.currentPage ? (pagination.currentPage - 1) * pagination.pageSize : 0) + idx + 1;

                      return (
                        <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                              idx < 3 && filters.rankDirection === 'most'
                                ? (isDebt ? 'bg-red-500 text-white' : isUpToDate ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white')
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {rank}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900">{s.fullName}</div>
                            <div className="text-xs text-gray-500">{s.status}</div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 font-mono">{s.identityCard || '—'}</td>
                          <td className="px-5 py-4 text-sm text-gray-700">{s.currentGrade}</td>
                          <td className="px-5 py-4 text-sm text-gray-700">{s.section}</td>
                          <td className="px-5 py-4 text-sm text-gray-700">
                            <div className="flex items-center gap-1">
                              <FaUser className="text-[10px] text-gray-400" />
                              <span>{s.representativeName || '—'}</span>
                            </div>
                            {s.representativeIdentityCard && (
                              <div className="text-xs text-gray-500">{s.representativeIdentityCard}</div>
                            )}
                          </td>
                          <td className={`px-5 py-4 text-sm font-bold text-right ${
                            isDebt ? 'text-red-600' : isCredit ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            <div className="inline-flex items-center gap-1">
                              {isDebt ? <FaArrowDown className="text-[10px]" /> : isCredit ? <FaArrowUp className="text-[10px]" /> : null}
                              {formatBs(balanceBs)}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className={`text-base font-extrabold ${
                              isDebt ? 'text-red-600' : isCredit ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {formatUsd(balance)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${stateColor}`}>
                              {stateLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100 shrink-0">
              <span className="text-sm text-gray-600">
                Página {pagination.currentPage} de {pagination.totalPages} (Total: {pagination.totalRecords})
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                >
                  <FaChevronLeft className="text-gray-600" />
                </button>
                <button
                  disabled={filters.page === pagination.totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                >
                  <FaChevronRight className="text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <FaBalanceScale />
          <span>El ranking se calcula en base al saldo actual de cada estudiante. "Al día" incluye saldos entre -$1.00 y $0.00.</span>
        </div>
      </div>
    </div>
  );
}