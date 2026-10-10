import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useNavigate } from "react-router-dom";
import { FaList, FaUserPlus } from 'react-icons/fa';
import { FaDeleteLeft } from "react-icons/fa6";
import AnimatedPage from '../../components/AnimatedPage';
import { sanitizeText } from '../../library/sanitizeInput';
import LoadListStudentsAPI from './components/LoadListStudent';

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

// 🆕 Filtros de año y sección
const GRADE_OPTIONS = [
  { value: 'all', label: 'Todos los años' },
  { value: '1ro', label: '1er Año' },
  { value: '2do', label: '2do Año' },
  { value: '3ro', label: '3er Año' },
  { value: '4to', label: '4to Año' },
  { value: '5to', label: '5to Año' },
  { value: '6to', label: '6to Año' },
];

const SECTION_OPTIONS = [
  { value: 'all', label: 'Todas las secciones' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
];

export default function AdminListStudentsBackend() {
  const inputStyle = "bg-transparent text-blue-500 font-semibold py-2 px-4 border-2 border-solid border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors";
  const btnStyleGreen = "bg-transparent text-green-500 font-semibold py-2 px-4 border-2 border-solid border-green-500 rounded-md hover:bg-green-50 active:bg-green-100 transition-colors w-full lg:w-32";
  const btnStyleRed = "bg-transparent text-red-500 font-semibold py-2 px-4 border-2 border-solid border-red-500 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors w-full lg:w-32";
  
  const navigate = useNavigate();
  const [idBus, setIdBus] = useState<BusquedaType>(BusquedaType.Nombre);
  const [DeBus, setDeBus] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // 🆕 Estados nuevos
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [debouncedDeBus] = useDebounce(DeBus, 400);
  
  const buscar = useMemo(() => {
    return { 
      idBus, 
      DeBus: debouncedDeBus, 
      status: statusFilter === 'all' ? undefined : statusFilter,
      // 🆕 Nuevos filtros
      grade: gradeFilter === 'all' ? undefined : gradeFilter,
      section: sectionFilter === 'all' ? undefined : sectionFilter,
    };
  }, [idBus, debouncedDeBus, statusFilter, gradeFilter, sectionFilter]);

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen p-4 lg:p-8">
        <h2 className="text-2xl text-center font-bold text-gray-800 mb-6">
          <FaList className="mr-4 inline-block" />
          Lista de Estudiantes
        </h2>

        {/* Controles de Búsqueda */}
        <div className="flex flex-col lg:flex-row gap-4 w-full mb-6">
          <div className="w-full lg:w-[900px] flex flex-col lg:flex-row items-start lg:items-center gap-2 flex-wrap">
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
              className={`${inputStyle} w-full lg:w-64`}
            />

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputStyle} w-full lg:w-44`}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* 🆕 Selector de Año */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className={`${inputStyle} w-full lg:w-40`}
            >
              {GRADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* 🆕 Selector de Sección */}
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className={`${inputStyle} w-full lg:w-44`}
            >
              {SECTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
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