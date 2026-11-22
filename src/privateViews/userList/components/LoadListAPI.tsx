// src/views/admin/users/components/LoadListAPI.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaFilePdf, FaFileExcel, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import SpinnerGeneral from '../../../layouts/components/spinnerGeneral';
import ListEmpty from '../../../components/ListEmpty';
import Pagination from '../../../components/Pagination';
import type { TypeUserBuscar } from '../../../types/user';
import { NIVEL_LABELS } from '../../../types/user';
import ListAPIs from './ListApis';
import { LoadPaginatedUsers } from '../../../apis/user';
import { exportToPdf, exportToExcel, type ExportColumn } from '../../../library/exportHelpers';

interface BusUserProps {
  Buscar: TypeUserBuscar;
  readOnly?: boolean;
}

export default function LoadListAPI({ Buscar, readOnly = false }: BusUserProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const { data, isError, isLoading, error } = useQuery({
    queryKey: ['users', { page, limit, Buscar }],
    queryFn: () => LoadPaginatedUsers({ page, limit, Buscar }),
    retry: 1,
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
    if (Buscar.DeBus && Buscar.DeBus.trim() !== '') {
      filters.push(`Búsqueda: "${Buscar.DeBus}"`);
    }
    if (Buscar.nivelFilter && Buscar.nivelFilter !== 'all') {
      filters.push(`Rol: ${NIVEL_LABELS[Number(Buscar.nivelFilter)] || Buscar.nivelFilter}`);
    }
    return filters;
  };

  const buildColumns = (): ExportColumn[] => [
    { header: 'Email', key: 'usermail', width: '*' },
    { header: 'Login', key: 'userlogin', width: 'auto' },
    { header: 'Nombre', key: 'username', width: '*' },
    { header: 'Nivel', key: 'nivel', width: 'auto', formatter: (v) => NIVEL_LABELS[Number(v)] || `Nivel ${v}` },
    { header: 'Estado', key: 'userstatus', width: 'auto', formatter: (v) => (v ? 'Activo' : 'Inactivo') },
    { header: 'Fecha creación', key: 'createdAt', width: 'auto', formatter: (v) => v ? new Date(v).toLocaleDateString('es-VE') : '—' },
  ];

  const handleExport = async (kind: 'pdf' | 'excel') => {
    setExporting(kind);
    try {
      const resp = await LoadPaginatedUsers({ page: 1, limit: 9999, Buscar });
      if (!resp.result || !resp.content) throw new Error('No se pudieron cargar los datos para exportar');
      const opts = {
        title: 'Lista de Usuarios',
        filters: getFilterDescriptions(),
        columns: buildColumns(),
        rows: resp.content,
        filename: 'usuarios',
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

  if (isError) {
    console.error('Error cargando usuarios:', error);
    return (
      <ListEmpty 
        message={`Error cargando la lista de usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`}
        columns={[
          { name: "Email", widthPercent: 25 },
          { name: "Login", widthPercent: 20 },
          { name: "Nombre", widthPercent: 20 },
          { name: "Nivel", widthPercent: 15 },
          { name: "Estado", widthPercent: 10 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  // ✅ Garantizar que content sea array
  const usuarios = data?.content || [];
  if (usuarios.length === 0) {
    const mensaje = Buscar.DeBus 
      ? `No hay usuarios que coincidan con "${Buscar.DeBus}"...` 
      : `No hay usuarios registrados...`;
    return (
      <ListEmpty 
        message={mensaje}
        columns={[
          { name: "Email", widthPercent: 25 },
          { name: "Login", widthPercent: 20 },
          { name: "Nombre", widthPercent: 20 },
          { name: "Nivel", widthPercent: 15 },
          { name: "Estado", widthPercent: 10 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  // ✅ Si totalPages es 0, no mostrar paginación
  const totalPages = data?.pagination?.totalPages ?? 1;

  const exportBar = (
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
  );

  if (totalPages === 0) {
    return (
      <>
        {exportBar}
        <ListAPIs data={usuarios} readOnly={readOnly} />
      </>
    );
  }

  return (
    <>
      {exportBar}
      <ListAPIs data={usuarios} readOnly={readOnly} />
      <Pagination
        page={page}
        limit={limit}
        totalPages={totalPages}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />
    </>
  );
}