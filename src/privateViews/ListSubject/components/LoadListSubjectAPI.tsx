import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaFilePdf, FaFileExcel, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import SpinnerGeneral from '../../../layouts/components/spinnerGeneral';
import ListEmpty from '../../../components/ListEmpty';
import Pagination from '../../../components/Pagination';
import { getPaginatedSubjectsAPI } from '../../../apis/subject';
import ListSubjectsAPI from './ListSubjectAPI';
import { exportToPdf, exportToExcel, type ExportColumn } from '../../../library/exportHelpers';

interface BusSubjectProps {
  Buscar: {
    idBus: string;
    DeBus: string;
    subjectType?: string;
    grade?: string;
  };
  readOnly?: boolean;
}

const SUBJECT_TYPE_LABELS: Record<string, string> = {
  ordinaria: 'Ordinaria',
  regular: 'Regular',
  complementaria_obligatoria: 'Complementaria Obligatoria',
  complementaria_opcional: 'Complementaria Opcional',
};

const GRADE_LABELS: Record<string, string> = {
  '1ro': '1er Grado',
  '2do': '2do Grado',
  '3ro': '3er Grado',
  '4to': '4to Grado',
  '5to': '5to Grado',
  '6to': '6to Grado',
};

export default function LoadListSubjectsAPI({ Buscar, readOnly = false }: BusSubjectProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const { data, isError, isLoading } = useQuery({
    queryKey: ['subjects', { page, limit, Buscar }],
    queryFn: () => getPaginatedSubjectsAPI(
      page, 
      limit, 
      Buscar.DeBus, 
      Buscar.grade, 
      Buscar.subjectType
    ),
  });

  useEffect(() => {
    setPage(1);
  }, [Buscar]);

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  const getFilterDescriptions = (): string[] => {
    const filters: string[] = [];
    if (Buscar.DeBus && Buscar.DeBus.trim() !== '') filters.push(`Búsqueda: "${Buscar.DeBus}"`);
    if (Buscar.subjectType) filters.push(`Tipo: ${SUBJECT_TYPE_LABELS[Buscar.subjectType] || Buscar.subjectType}`);
    if (Buscar.grade) filters.push(`Grado: ${GRADE_LABELS[Buscar.grade] || Buscar.grade}`);
    return filters;
  };

  const buildColumns = (): ExportColumn[] => [
    { header: 'Código', key: 'code', width: 'auto' },
    { header: 'Nombre', key: 'name', width: '*' },
    { header: 'Tipo', key: 'subjectType', width: 'auto', formatter: (v) => SUBJECT_TYPE_LABELS[v] || v || 'No especificado' },
    { header: 'Horas/Semana', key: 'hoursPerWeek', width: 'auto', formatter: (v) => `${v ?? 0} hrs` },
    { header: 'Horas Teóricas', key: 'theoreticalHours', width: 'auto', formatter: (v) => `${v ?? 0}` },
    { header: 'Horas Lab.', key: 'labHours', width: 'auto', formatter: (v) => `${v ?? 0}` },
    { header: 'Docente', key: 'teacher', width: '*', formatter: (_v, row) => row.teacher?.fullName || 'No asignado' },
  ];

  const handleExport = async (kind: 'pdf' | 'excel') => {
    setExporting(kind);
    try {
      const resp = await getPaginatedSubjectsAPI(1, 9999, Buscar.DeBus, Buscar.grade, Buscar.subjectType);
      if (!resp.result || !resp.content) throw new Error('No se pudieron cargar los datos para exportar');
      const opts = {
        title: 'Lista de Materias',
        filters: getFilterDescriptions(),
        columns: buildColumns(),
        rows: resp.content,
        filename: 'materias',
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

  if (isLoading) {
    return <SpinnerGeneral />;
  }

  if (isError) {
    return (
      <ListEmpty 
        message="Error cargando la lista de materias..."
        columns={[
          { name: "Código", widthPercent: 15 },
          { name: "Nombre", widthPercent: 25 },
          { name: "Tipo", widthPercent: 15 },
          { name: "Horas/Semana", widthPercent: 15 },
          { name: "Docente", widthPercent: 20 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  if (!data || data.content.length === 0) {
    const mensaje = Buscar.DeBus 
      ? `No hay materias que coincidan con "${Buscar.DeBus}"...` 
      : `No hay materias registradas...`;
    
    return (
      <ListEmpty 
        message={mensaje}
        columns={[
          { name: "Código", widthPercent: 15 },
          { name: "Nombre", widthPercent: 25 },
          { name: "Tipo", widthPercent: 15 },
          { name: "Horas/Semana", widthPercent: 15 },
          { name: "Docente", widthPercent: 20 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  return (
    <>
      <div className="flex flex-wrap justify-end items-center gap-3 mb-3">
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
      <ListSubjectsAPI data={data.content} readOnly={readOnly} />
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