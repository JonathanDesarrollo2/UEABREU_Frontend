import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import SpinnerGeneral from '../../../layouts/components/spinnerGeneral';
import ListEmpty from '../../../components/ListEmpty';
import Pagination from '../../../components/Pagination';
import { getPaginatedStudentsAPI } from '../../../apis/student';
import ListStudentsAPI from './ListStudentAPI';
import type { TypeStudent } from '../../../types/student';
import { FaPrint, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface BusStudentProps {
  Buscar: {
    idBus: string;
    DeBus: string;
    status?: string;
    grade?: string;
    section?: string;
  };
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

export default function LoadListStudentsAPI({ Buscar }: BusStudentProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [printData, setPrintData] = useState<TypeStudent[] | null>(null);
  const [printing, setPrinting] = useState(false);

  // ✅ Normalizar valores a primitivos (sin undefined) para el queryKey y para el API
  const safeIdBus = Buscar.idBus || '';
  const safeDeBus = Buscar.DeBus || '';
  const safeStatus = Buscar.status || '';
  const safeGrade = Buscar.grade || '';
  const safeSection = Buscar.section || '';

  // Reset page cuando cambian los filtros
  useEffect(() => {
    setPage(1);
  }, [safeIdBus, safeDeBus, safeStatus, safeGrade, safeSection]);

  const { data, isError, isLoading, isFetching } = useQuery({
    // ✅ queryKey plano: cada filtro es un elemento del array.
    // Cuando CUALQUIERA cambia, React Query refetch automáticamente.
    queryKey: ['students', page, limit, safeIdBus, safeDeBus, safeStatus, safeGrade, safeSection],
    queryFn: () =>
      getPaginatedStudentsAPI(
        page,
        limit,
        safeDeBus,
        safeStatus || undefined,
        safeGrade || undefined,
        safeSection || undefined
      ),
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  });

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

  const handlePrint = useCallback(async () => {
    setPrinting(true);
    try {
      const response = await getPaginatedStudentsAPI(
        1,
        9999,
        safeDeBus,
        safeStatus || undefined,
        safeGrade || undefined,
        safeSection || undefined
      );
      if (response.result && response.content) {
        setPrintData(response.content);
        setTimeout(() => window.print(), 300);
      } else {
        toast.error('No se pudieron cargar los datos para imprimir');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al preparar la impresión');
    } finally {
      setPrinting(false);
    }
  }, [safeDeBus, safeStatus, safeGrade, safeSection]);

  const formatDate = (date?: Date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-VE');
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
      : `No hay estudiantes registrados con los filtros aplicados...`;

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

  const filterDescriptions = getFilterDescriptions();

  const printContent = printData && (
    <div className="print-content">
      <style>{`
        .print-content { display: none; }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          body > *:not(.print-content) { display: none !important; }
          .print-content { display: block !important; }
          .print-content table {
            border-collapse: collapse;
            width: 100%;
            font-size: 10px;
          }
          .print-content th,
          .print-content td {
            border: 1px solid #333 !important;
            padding: 4px 6px !important;
            text-align: left;
            vertical-align: top;
          }
          .print-content thead {
            background: #f0f0f0 !important;
            display: table-header-group;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-content tr { page-break-inside: avoid; }
          .print-content th { font-weight: bold; }
        }
        @page { size: A4 portrait; margin: 12mm; }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Lista de Estudiantes</h1>
        <p style={{ fontSize: '11px', margin: '2px 0', color: '#555' }}>
          Generado el {new Date().toLocaleDateString('es-VE')} a las {new Date().toLocaleTimeString('es-VE')}
        </p>
        {filterDescriptions.length > 0 ? (
          <div style={{ fontSize: '11px', marginTop: '6px' }}>
            <strong>Filtros aplicados:</strong>
            <ul style={{ listStyle: 'none', padding: 0, margin: '2px 0 0 0' }}>
              {filterDescriptions.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        ) : (
          <p style={{ fontSize: '11px', marginTop: '6px' }}><strong>Sin filtros aplicados</strong></p>
        )}
        <p style={{ fontSize: '11px', marginTop: '4px' }}>
          Total: <strong>{printData.length}</strong> estudiante(s)
        </p>
      </div>

      <table>
        <thead>
          <tr>
            <th style={{ width: '30px' }}>#</th>
            <th>Nombre</th>
            <th>Cédula</th>
            <th>Grado</th>
            <th>Sección</th>
            <th>Estado</th>
            <th>Admisión</th>
            <th>Representante</th>
          </tr>
        </thead>
        <tbody>
          {printData.map((student, idx) => (
            <tr key={student.id}>
              <td>{idx + 1}</td>
              <td>{student.fullName || '—'}</td>
              <td>{student.identityCard || '—'}</td>
              <td>{student.currentGrade || 'En asignar'}</td>
              <td>{student.section || 'Pendiente'}</td>
              <td>
                {(student.status || 'pendiente').charAt(0).toUpperCase() +
                  (student.status || 'pendiente').slice(1)}
              </td>
              <td>{formatDate(student.admissionDate)}</td>
              <td>
                {student.representative
                  ? `${student.representative.fullName} (${student.representative.identityCard})`
                  : 'No asignado'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="flex justify-end items-center gap-3 mb-3">
        {isFetching && !isLoading && (
          <span className="inline-flex items-center gap-2 text-sm text-blue-600">
            <FaSpinner className="animate-spin" />
            Actualizando...
          </span>
        )}
        <button
          type="button"
          onClick={handlePrint}
          disabled={printing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {printing ? (
            <>
              <FaSpinner className="animate-spin" />
              Preparando...
            </>
          ) : (
            <>
              <FaPrint />
              Imprimir lista
            </>
          )}
        </button>
      </div>

      <ListStudentsAPI data={data.content} />
      <Pagination
        page={page}
        limit={limit}
        totalPages={data.pagination.totalPages}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      {printContent && createPortal(printContent, document.body)}
    </>
  );
}