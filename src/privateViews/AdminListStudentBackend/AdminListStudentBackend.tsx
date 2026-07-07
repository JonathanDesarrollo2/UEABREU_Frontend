import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { useNavigate } from "react-router-dom";
import { FaList, FaUserPlus, FaFilePdf } from 'react-icons/fa';
import { FaDeleteLeft } from "react-icons/fa6";
import AnimatedPage from '../../components/AnimatedPage';
import { sanitizeText } from '../../library/sanitizeInput';
import LoadListStudentsAPI from './components/LoadListStudent';
import { exportAllStudentsAPI } from '../../apis/student';
import { toast } from 'react-toastify';

// pdfmake
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.vfs;

const BusquedaType = {
  Nombre: "1",
  Cedula: "2",
  Grado: "3",
  Representante: "4"
} as const;

type BusquedaType = typeof BusquedaType[keyof typeof BusquedaType];

const opcionesBusqueda = [
  { key: BusquedaType.Nombre, label: "Nombre" },
  { key: BusquedaType.Cedula, label: "Cédula" },
  { key: BusquedaType.Grado, label: "Grado" },
  { key: BusquedaType.Representante, label: "Representante" }
];

const statusOptions = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'regular', label: 'Regular' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'repitiente', label: 'Repitiente' },
  { value: 'condicionado', label: 'Condicionado' },
  { value: 'inactivo', label: 'Inactivo' }
];

export default function AdminListStudentsBackend() {
  const inputStyle = "bg-transparent text-blue-500 font-semibold py-2 px-4 border-2 border-solid border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors";
  const btnStyleGreen = "bg-transparent text-green-500 font-semibold py-2 px-4 border-2 border-solid border-green-500 rounded-md hover:bg-green-50 active:bg-green-100 transition-colors w-full lg:w-32";
  const btnStyleRed = "bg-transparent text-red-500 font-semibold py-2 px-4 border-2 border-solid border-red-500 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors w-full lg:w-32";
  
  const navigate = useNavigate();
  const [idBus, setIdBus] = useState<BusquedaType>(BusquedaType.Nombre);
  const [DeBus, setDeBus] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [debouncedDeBus] = useDebounce(DeBus, 400);
  const [exporting, setExporting] = useState(false);

  const buscar = useMemo(() => {
    return { 
      idBus, 
      DeBus: debouncedDeBus, 
      status: statusFilter === 'all' ? undefined : statusFilter 
    };
  }, [idBus, debouncedDeBus, statusFilter]);

  // Función para exportar PDF
  const handleExportPDF = useCallback(async () => {
    setExporting(true);
    try {
      const estudiantes = await exportAllStudentsAPI(debouncedDeBus, statusFilter !== 'all' ? statusFilter : undefined);
      if (estudiantes.length === 0) {
        toast.error('No hay estudiantes para exportar con los filtros actuales.');
        setExporting(false);
        return;
      }

      // Construir definición del documento PDF
      const content: any[] = [];
      estudiantes.forEach((est, index) => {
        // Cada estudiante en una página nueva (excepto el primero)
        if (index > 0) content.push({ text: '', pageBreak: 'before' });

        const fechaNac = est.birthDate ? new Date(est.birthDate).toLocaleDateString() : 'No disponible';
        const fechaAdm = est.admissionDate ? new Date(est.admissionDate).toLocaleDateString() : 'No disponible';

        content.push(
          { text: 'DATOS DEL ESTUDIANTE', style: 'sectionHeader' },
          { text: `Nombre: ${est.fullName}` },
          { text: `Cédula: ${est.identityCard}` },
          { text: `Fecha de Nacimiento: ${fechaNac}` },
          { text: `Nacionalidad: ${est.nationality || 'No disponible'}` },
          { text: `País de Nacimiento: ${est.birthCountry || 'No disponible'}` },
          { text: `Estado: ${est.state || 'No disponible'}` },
          { text: `Zona: ${est.zone || 'No disponible'}` },
          { text: `Dirección: ${est.addressDescription || 'No disponible'}` },
          { text: `Teléfono: ${est.phone || 'No disponible'}` },
          { text: `Grado: ${est.currentGrade || 'En asignar'}` },
          { text: `Sección: ${est.section || 'Pendiente'}` },
          { text: `Estado Académico: ${est.status ? est.status.charAt(0).toUpperCase() + est.status.slice(1) : 'Pendiente'}` },
          { text: `Fecha de Admisión: ${fechaAdm}` },
          { text: `Exoneración: ${est.exonerationPercent ?? 0}%` },
          { text: '' },
          { text: 'DATOS DEL REPRESENTANTE', style: 'sectionHeader' },
          est.representative ? (
            [
              { text: `Nombre: ${est.representative.fullName}` },
              { text: `Cédula: ${est.representative.identityCard}` },
              { text: `Teléfono: ${est.representative.phone}` },
              { text: `Relación: ${est.representative.relationship}` },
              { text: `Dirección: ${est.representative.address || 'No disponible'}` },
            ]
          ) : (
            { text: 'No asignado' }
          ),
          { text: '' },
          { text: '________________________________________', alignment: 'center' }
        );
      });

      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [20, 20, 20, 20],
        content,
        styles: {
          sectionHeader: { fontSize: 12, bold: true, decoration: 'underline', margin: [0, 10, 0, 5] },
        },
        defaultStyle: { fontSize: 10, lineHeight: 1.3 },
      };

      pdfMake.createPdf(docDefinition).download('estudiantes.pdf');
      toast.success(`PDF generado con ${estudiantes.length} estudiantes.`);
    } catch (error: any) {
      toast.error('Error al exportar: ' + error.message);
    } finally {
      setExporting(false);
    }
  }, [debouncedDeBus, statusFilter]);

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen p-4 lg:p-8">
        <h2 className="text-2xl text-center font-bold text-gray-800 mb-6">
          <FaList className="mr-4 inline-block" />
          Lista de Estudiantes
        </h2>

        {/* Controles de Búsqueda */}
        <div className="flex flex-col lg:flex-row gap-4 w-full mb-6">
          <div className="w-full lg:w-[800px] flex flex-col lg:flex-row items-start lg:items-center gap-2">
            <span className="text-gray-700 whitespace-nowrap">Buscar por:</span>
            <select 
              value={idBus}
              onChange={(e) => setIdBus(e.target.value as BusquedaType)}
              className={`${inputStyle} w-full lg:w-40`}
            >
              {opcionesBusqueda.map((op) => (
                <option key={op.key} value={op.key}>
                  {op.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={DeBus}
              onChange={(e) => setDeBus(sanitizeText(e.target.value))}
              placeholder="Buscar..."
              className={`${inputStyle} w-full`}
            />

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputStyle} w-full lg:w-48`}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={exporting}
              className="bg-transparent text-amber-500 font-semibold py-2 px-4 border-2 border-solid border-amber-500 rounded-md hover:bg-amber-50 active:bg-amber-100 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <FaFilePdf />
              {exporting ? 'Exportando...' : 'Exportar PDF'}
            </button>
            <button
              type="button"
              onClick={() => { navigate('/admin/users/insert'); }}
              className={btnStyleGreen}
            >
              <FaUserPlus className="mr-2 inline-block" />
              Nuevo
            </button>
            <button
              type="button"
              onClick={() => { navigate(-1); }}
              className={btnStyleRed}
            >
              <FaDeleteLeft className="mr-2 inline-block" />
              Cancelar
            </button>
          </div>
        </div>

        {/* Lista de estudiantes */}
        <div className="flex-1">
          <LoadListStudentsAPI Buscar={buscar} />
        </div>
      </div>
    </AnimatedPage>
  );
}