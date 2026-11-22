import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import SpinnerGeneral from '../../../layouts/components/spinnerGeneral';
import ListEmpty from '../../../components/ListEmpty';
import Pagination from '../../../components/Pagination';
import { getPaginatedStudentsAPI } from '../../../apis/student';
import ListStudentsAPI from './ListStudentAPI';
import type { TypeStudent } from '../../../types/student';
import { FaFilePdf, FaFileExcel, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { exportToPdf, exportToExcel, type ExportColumn } from '../../../library/exportHelpers';

interface BusStudentProps {
  Buscar: {
    idBus: string;
    DeBus: string;
    status?: string;
    grade?: string;
    section?: string;
  };
  readOnly?: boolean; // ⬅️ NUEVO
}

const BUSQUEDA_LABELS: Record<string, string> = {
  '1': 'Nombre',
  '2': 'Cédula',
  '3': 'Grado',
  '4': 'Representante',
};

const STATUS_LABELS: Record<string, string> = {
  'regular': 'Regular',
  'pendiente': 'Pendiente',
  'repitiente': 'Repitiente',
  'condicionado': 'Condicionado',
  'inactivo': 'Inactivo',
};

const GRADE_LABELS: Record<string, string> = {
  '1ro': '1er Año',
  '2do': '2do Año',
  '3ro': '3er Año',
  '4to': '4to Año',
  '5to': '5to Año',
  '6to': '6to Año',
};

const SECTION_LABELS: Record<string, string> = {
  'A': 'Sección A',
  'B': 'Sección B',
  'C': 'Sección C',
  'D': 'Sección D',
  'E': 'Sección E',
};

export default function LoadListStudentsAPI({ Buscar, readOnly = false }: BusStudentProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [includeRepresentative, setIncludeRepresentative] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  // Valores normalizados (nunca undefined) para el queryKey
  const safeIdBus = Buscar.idBus || '';
  const safeDeBus = Buscar.DeBus || '';
  const safeStatus = Buscar.status || '';
  const safeGrade = Buscar.grade || '';
  const safeSection = Buscar.section || '';

  const { data, isError, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      'students',
      page,
      limit,
      safeIdBus,
      safeDeBus,
      safeStatus,
      safeGrade,
      safeSection,
    ],
    queryFn: async () => {
      const resp = await getPaginatedStudentsAPI(
        page,
        limit,
        safeDeBus,
        safeStatus || undefined,
        safeGrade || undefined,
        safeSection || undefined
      );
      console.log('✅ [LoadListStudentsAPI] Respuesta del backend:', {
        params: { page, limit, search: safeDeBus, status: safeStatus, grade: safeGrade, section: safeSection },
        total: resp?.pagination?.totalRecords,
        primerosRegistros: resp?.content?.slice(0, 3).map((s: any) => ({
          nombre: s.fullName,
          grado: s.currentGrade,
          seccion: s.section,
        })),
      });
      return resp;
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    networkMode: 'always',
  });

  // Reset de página cuando cambian los filtros
  useEffect(() => {
    setPage(1);
  }, [safeIdBus, safeDeBus, safeStatus, safeGrade, safeSection]);

  // ✅ Fuerza refetch cada vez que cambia cualquier filtro
  const filtersSignature = `${safeIdBus}|${safeDeBus}|${safeStatus}|${safeGrade}|${safeSection}`;
  const lastSignatureRef = useRef<string>('');
  useEffect(() => {
    if (lastSignatureRef.current === filtersSignature) return;
    lastSignatureRef.current = filtersSignature;
    console.log('🔄 [LoadListStudentsAPI] Cambiaron los filtros. Forzando refetch:', {
      safeIdBus, safeDeBus, safeStatus, safeGrade, safeSection,
    });
    refetch();
  }, [filtersSignature, refetch, safeIdBus, safeDeBus, safeStatus, safeGrade, safeSection]);

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  const getFilterDescriptions = (): string[] => {
    const filters: string[] = [];
    if (safeDeBus.trim() !== '') {
      filters.push(`Búsqueda por ${BUSQUEDA_LABELS[safeIdBus] || 'campo'}: "${safeDeBus}"`);
    }
    if (safeStatus) {
      filters.push(`Estado: ${STATUS_LABELS[safeStatus] || safeStatus}`);
    }
    if (safeGrade) {
      filters.push(`Año: ${GRADE_LABELS[safeGrade] || safeGrade}`);
    }
    if (safeSection) {
      filters.push(`Sección: ${SECTION_LABELS[safeSection] || safeSection}`);
    }
    return filters;
  };

  const fetchAllRows = async (): Promise<TypeStudent[]> => {
    const resp = await getPaginatedStudentsAPI(1, 9999, safeDeBus, safeStatus || undefined, safeGrade || undefined, safeSection || undefined);
    if (!resp.result || !resp.content) throw new Error('No se pudieron cargar los datos para exportar');
    return resp.content as TypeStudent[];
  };

  const buildColumns = (): ExportColumn[] => {
    const cols: ExportColumn[] = [
      { header: 'Nombre', key: 'fullName', width: '*' },
      { header: 'Cédula', key: 'identityCard', width: 'auto' },
      { header: 'Fecha Nac.', key: 'birthDate', width: 'auto', formatter: (v) => v ? new Date(v).toLocaleDateString('es-VE') : '—' },
      { header: 'Grado', key: 'currentGrade', width: 'auto' },
      { header: 'Sección', key: 'section', width: 'auto' },
      { header: 'Estado', key: 'status', width: 'auto', formatter: (v) => v ? v.charAt(0).toUpperCase() + v.slice(1) : 'Pendiente' },
      { header: 'Admisión', key: 'admissionDate', width: 'auto', formatter: (v) => v ? new Date(v).toLocaleDateString('es-VE') : '—' },
      { header: 'Exoneración', key: 'exonerationPercent', width: 'auto', formatter: (v) => `${v ?? 0}%` },
      { header: 'Balance (USD)', key: 'balance', width: 'auto', formatter: (v) => `$${Number(v || 0).toFixed(2)}` },
    ];
    if (includeRepresentative) {
      cols.push(
        { header: 'Representante', key: '__repName', width: '*', formatter: (_v, row) => row.representative?.fullName || 'No asignado' },
        { header: 'Cédula Rep.', key: '__repCard', width: 'auto', formatter: (_v, row) => row.representative?.identityCard || '—' },
        { header: 'Teléfono Rep.', key: '__repPhone', width: 'auto', formatter: (_v, row) => row.representative?.phone || '—' }
      );
    }
    return cols;
  };

  const handleExport = async (kind: 'pdf' | 'excel') => {
    setExporting(kind);
    try {
      const rows = await fetchAllRows();
      const columns = buildColumns();
      const opts = {
        title: 'Lista de Estudiantes',
        filters: getFilterDescriptions(),
        columns,
        rows,
        filename: 'estudiantes',
      };
      if (kind === 'pdf') await exportToPdf(opts);
      else await exportToExcel(opts);
      toast.success(`Exportación ${kind.toUpperCase()} generada correctamente`);
    } catch (err: any) {
      toast.error(err?.message || 'Error al exportar');
    } finally {
      setExporting(null);
    }
  };

  if (isLoading) return <SpinnerGeneral />;

  if (isError || !data) {
    return (
      <ListEmpty
        message="Error cargando la lista de estudiantes..."
        columns={[
          { name: "Nombre", widthPercent: 20 },
          { name: "Cédula", widthPercent: 15 },
          { name: "Grado", widthPercent: 15 },
          { name: "Sección", widthPercent: 10 },
          { name: "Estado", widthPercent: 15 },
          { name: "Representante", widthPercent: 15 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  if (!data.content || data.content.length === 0) {
    const mensaje = safeDeBus
      ? `No hay estudiantes que coincidan con "${safeDeBus}"...`
      : `No hay estudiantes con los filtros aplicados...`;

    return (
      <ListEmpty
        message={mensaje}
        columns={[
          { name: "Nombre", widthPercent: 20 },
          { name: "Cédula", widthPercent: 15 },
          { name: "Grado", widthPercent: 15 },
          { name: "Sección", widthPercent: 10 },
          { name: "Estado", widthPercent: 15 },
          { name: "Representante", widthPercent: 15 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  return (
    <>
      <div className="flex flex-wrap justify-end items-center gap-3 mb-3">
        {isFetching && !isLoading && (
          <span className="inline-flex items-center gap-2 text-sm text-blue-600">
            <FaSpinner className="animate-spin" /> Actualizando...
          </span>
        )}
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeRepresentative}
            onChange={(e) => setIncludeRepresentative(e.target.checked)}
            className="h-4 w-4"
          />
          Incluir representante
        </label>
        <button
          type="button"
          onClick={() => handleExport('pdf')}
          disabled={!!exporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {exporting === 'pdf' ? (<><FaSpinner className="animate-spin" />Generando...</>) : (<><FaFilePdf />PDF</>)}
        </button>
        <button
          type="button"
          onClick={() => handleExport('excel')}
          disabled={!!exporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {exporting === 'excel' ? (<><FaSpinner className="animate-spin" />Generando...</>) : (<><FaFileExcel />Excel</>)}
        </button>
      </div>

      <ListStudentsAPI data={data.content} readOnly={readOnly} />
      <Pagination
        page={page}
        limit={limit}
        totalPages={data.pagination.totalPages}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />
    </>
  );
}