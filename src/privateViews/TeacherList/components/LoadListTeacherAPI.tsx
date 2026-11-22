// src/pages/teacher/components/LoadListTeacherAPI.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPaginatedTeachersAPI } from '../../../apis/teacher';
import { FaFilePdf, FaFileExcel, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import SpinnerGeneral from '../../../layouts/components/spinnerGeneral';
import ListEmpty from '../../../components/ListEmpty';
import Pagination from '../../../components/Pagination';
import ListTeachersAPI from './ListTeacherAPI';
import { exportToPdf, exportToExcel, type ExportColumn } from '../../../library/exportHelpers';

interface BusTeacherProps {
  Buscar: {
    idBus: string;
    DeBus: string;
    statusFilter: 'all' | 'active' | 'inactive';
  };
  readOnly?: boolean;
}

export default function LoadListTeacherAPI({ Buscar, readOnly = false }: BusTeacherProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  // Ajustar los parámetros de búsqueda antes de enviarlos
  const adjustedBuscar = React.useMemo(() => {
    let search = '';
    if (Buscar.DeBus) {
      // Dependiendo del tipo de búsqueda, construimos un string que el backend pueda usar
      // El backend espera un parámetro 'search' que busca en varios campos
      // Pero si queremos filtrar por estado, debemos hacerlo aparte.
      // Sin embargo, el backend actual no soporta filtrar por estado en el mismo endpoint.
      // Por ahora, solo usamos el texto de búsqueda.
      search = Buscar.DeBus;
    }
    return { search, status: Buscar.statusFilter };
  }, [Buscar]);

  const { data, isError, isLoading } = useQuery({
    queryKey: ['teachers', { page, limit, ...adjustedBuscar }],
    queryFn: () => getPaginatedTeachersAPI(page, limit, adjustedBuscar.search),
    // Nota: El backend no soporta filtrar por estado en el endpoint paginado.
    // Podríamos filtrar en el frontend, pero no es lo ideal. 
    // Por ahora, ignoramos el estado en la consulta y filtramos en el frontend.
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
    if (Buscar.statusFilter !== 'all') filters.push(`Estado: ${Buscar.statusFilter === 'active' ? 'Activos' : 'Inactivos'}`);
    return filters;
  };

  const buildColumns = (): ExportColumn[] => [
    { header: 'Nombre', key: 'fullName', width: '*' },
    { header: 'Cédula', key: 'identityCard', width: 'auto' },
    { header: 'Email', key: 'email', width: '*' },
    { header: 'Teléfono', key: 'phone', width: 'auto' },
    { header: 'Especialización', key: 'specialization', width: 'auto', formatter: (v) => v || 'No especificada' },
    { header: 'Estado', key: 'status', width: 'auto', formatter: (v) => (v ? 'Activo' : 'Inactivo') },
    { header: 'Registro', key: 'createdAt', width: 'auto', formatter: (v) => v ? new Date(v).toLocaleDateString('es-VE') : '—' },
  ];

  const handleExport = async (kind: 'pdf' | 'excel') => {
    setExporting(kind);
    try {
      const resp = await getPaginatedTeachersAPI(1, 9999, adjustedBuscar.search);
      if (!resp.result || !resp.content) throw new Error('No se pudieron cargar los datos para exportar');
      let rows = resp.content;
      if (adjustedBuscar.status !== 'all') {
        const statusBoolean = adjustedBuscar.status === 'active';
        rows = rows.filter((t) => t.status === statusBoolean);
      }
      const opts = {
        title: 'Lista de Docentes',
        filters: getFilterDescriptions(),
        columns: buildColumns(),
        rows,
        filename: 'docentes',
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
        message="Error cargando la lista de profesores..."
        columns={[
          { name: "Nombre", widthPercent: 20 },
          { name: "Cédula", widthPercent: 15 },
          { name: "Email", widthPercent: 20 },
          { name: "Teléfono", widthPercent: 15 },
          { name: "Especialización", widthPercent: 15 },
          { name: "Estado", widthPercent: 10 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  // Filtramos por estado en el frontend si es necesario (hasta que el backend lo soporte)
  let teachers = data?.content || [];
  if (adjustedBuscar.status !== 'all') {
    const statusBoolean = adjustedBuscar.status === 'active';
    teachers = teachers.filter(teacher => teacher.status === statusBoolean);
  }

  if (teachers.length === 0) {
    let mensaje = '';
    
    if (Buscar.DeBus) {
      mensaje = `No hay profesores que coincidan con "${Buscar.DeBus}"...`;
    } else {
      mensaje = `No hay profesores registrados...`;
    }
    
    return (
      <ListEmpty 
        message={mensaje}
        columns={[
          { name: "Nombre", widthPercent: 20 },
          { name: "Cédula", widthPercent: 15 },
          { name: "Email", widthPercent: 20 },
          { name: "Teléfono", widthPercent: 15 },
          { name: "Especialización", widthPercent: 15 },
          { name: "Estado", widthPercent: 10 },
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
      <ListTeachersAPI data={teachers} readOnly={readOnly} />
      <Pagination
        page={page}
        limit={limit}
        totalPages={data?.pagination?.totalPages || 1}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />
    </>
  );
}