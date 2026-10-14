import React, { useState, useEffect, useCallback } from 'react';
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
  const [shouldPrint, setShouldPrint] = useState(false);
  const [printing, setPrinting] = useState(false);

  const { data, isError, isLoading } = useQuery({
    queryKey: ['students', { page, limit, Buscar }],
    queryFn: () =>
      getPaginatedStudentsAPI(
        page,
        limit,
        Buscar.DeBus,
        Buscar.status,
        Buscar.grade,
        Buscar.section
      ),
  });

  useEffect(() => {
    setPage(1);
  }, [Buscar]);

  // Cuando los datos de impresión están listos, lanzamos window.print()
  useEffect(() => {
    if (shouldPrint && printData) {
      const timer = setTimeout(() => {
        window.print();
        setShouldPrint(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [shouldPrint, printData]);

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  const getFilterDescriptions = (): string[] => {
    const filters: string[] = [];
    if (Buscar.DeBus && Buscar.DeBus.trim() !== '') {
      filters.push(`Búsqueda por ${BUSQUEDA_LABELS[Buscar.idBus] || 'campo'}: "${Buscar.DeBus}"`);
    }
    if (Buscar.status) {
      filters.push(`Estado: ${STATUS_LABELS[Buscar.status] || Buscar.status}`);
    }
    if (Buscar.grade) {
      filters.push(`Año: ${GRADE_LABELS[Buscar.grade] || Buscar.grade}`);
    }
    if (Buscar.section) {
      filters.push(`Sección: ${SECTION_LABELS[Buscar.section] || Buscar.section}`);
    }
    return filters;
  };

  const handlePrint = useCallback(async () => {
    setPrinting(true);
    try {
      const response = await getPaginatedStudentsAPI(
        1,
        9999,
        Buscar.DeBus,
        Buscar.status,
        Buscar.grade,
        Buscar.section
      );
      if (response.result && response.content) {
        setPrintData(response.content);
        setShouldPrint(true);
      } else {
        toast.error('No se pudieron cargar los datos para imprimir');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al preparar la impresión');
    } finally {
      setPrinting(false);
    }
  }, [Buscar]);

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
    const mensaje = Buscar.DeBus
      ? `No hay estudiantes que coincidan con "${Buscar.DeBus}"...`
      : `No hay estudiantes registrados...`;

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

  return (
    <>
      {/* Estilos de impresión */}
      <style>{`
        .print-zone { display: none; }
        @media print {
          body * { visibility: hidden; }
          .print-zone, .print-zone * { visibility: visible; }
          .print-zone {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 10px;
          }
          .print-zone table { border-collapse: collapse; width: 100%; font-size: 11px; }
          .print-zone th, .print-zone td {
            border: 1px solid #333 !important;
            padding: 6px !important;
            page-break-inside: avoid;
          }
          .print-zone thead {
            background: #f0f0f0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 10mm; }
        }
      `}</style>

      {/* Botón imprimir (solo visible en pantalla) */}
      <div className="no-print flex justify-end mb-3">
        <button
          type="button"
          onClick={handlePrint}
          disabled={printing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Imprimir lista completa con los filtros actuales"
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

      {/* Contenido visible en pantalla */}
      <div className="no-print">
        <ListStudentsAPI data={data.content} />
        <Pagination
          page={page}
          limit={limit}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
        />
      </div>

      {/* Área de impresión (oculta en pantalla, visible solo al imprimir) */}
      <div className="print-zone">
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Lista de Estudiantes</h1>
          <p style={{ fontSize: '12px', margin: '4px 0' }}>
            Generado el {new Date().toLocaleDateString('es-VE')} a las{' '}
            {new Date().toLocaleTimeString('es-VE')}
          </p>
          {filterDescriptions.length > 0 ? (
            <div style={{ fontSize: '11px', marginTop: '6px' }}>
              <strong>Filtros aplicados:</strong>
              <ul style={{ listStyle: 'none', padding: 0, margin: '4px 0 0 0' }}>
                {filterDescriptions.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={{ fontSize: '11px', marginTop: '6px' }}>
              <strong>Sin filtros aplicados</strong>
            </p>
          )}
          <p style={{ fontSize: '11px', marginTop: '6px' }}>
            Total: <strong>{printData?.length || 0}</strong> estudiante(s)
          </p>
        </div>

        {printData && printData.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>#</th>
                <th style={{ textAlign: 'left' }}>Nombre</th>
                <th style={{ textAlign: 'left' }}>Cédula</th>
                <th style={{ textAlign: 'left' }}>Grado</th>
                <th style={{ textAlign: 'left' }}>Sección</th>
                <th style={{ textAlign: 'left' }}>Estado</th>
                <th style={{ textAlign: 'left' }}>Admisión</th>
                <th style={{ textAlign: 'left' }}>Representante</th>
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
        ) : (
          <p style={{ textAlign: 'center', fontSize: '12px' }}>
            No hay estudiantes para imprimir.
          </p>
        )}
      </div>
    </>
  );
}