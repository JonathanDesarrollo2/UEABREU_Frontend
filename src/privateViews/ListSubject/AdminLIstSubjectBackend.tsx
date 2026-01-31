import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useNavigate } from "react-router-dom";
import { FaList, FaBookMedical } from 'react-icons/fa';
import { FaDeleteLeft } from "react-icons/fa6";
import AnimatedPage from '../../components/AnimatedPage';
import { sanitizeText } from '../../library/sanitizeInput';
import LoadListSubjectsAPI from './components/LoadListSubjectAPI';

const BusquedaType = {
  Nombre: "1",
  Codigo: "2",
  Docente: "3"
} as const;

type BusquedaType = typeof BusquedaType[keyof typeof BusquedaType];

const opcionesBusqueda = [
  { key: BusquedaType.Nombre, label: "Nombre" },
  { key: BusquedaType.Codigo, label: "Código" },
  { key: BusquedaType.Docente, label: "Docente" }
];

const typeOptions = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'ordinaria', label: 'Ordinaria' },
  { value: 'regular', label: 'Regular' },
  { value: 'complementaria_obligatoria', label: 'Complementaria Obligatoria' },
  { value: 'complementaria_opcional', label: 'Complementaria Opcional' }
];

const gradeOptions = [
  { value: 'all', label: 'Todos los grados' },
  { value: '1ro', label: '1er Grado' },
  { value: '2do', label: '2do Grado' },
  { value: '3ro', label: '3er Grado' },
  { value: '4to', label: '4to Grado' },
  { value: '5to', label: '5to Grado' },
  { value: '6to', label: '6to Grado' }
];

export default function AdminListSubjectsBackend() {
  const inputStyle = "bg-transparent text-blue-500 font-semibold py-2 px-4 border-2 border-solid border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors";
  const btnStyleGreen = "bg-transparent text-green-500 font-semibold py-2 px-4 border-2 border-solid border-green-500 rounded-md hover:bg-green-50 active:bg-green-100 transition-colors w-full lg:w-32";
  const btnStyleRed = "bg-transparent text-red-500 font-semibold py-2 px-4 border-2 border-solid border-red-500 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors w-full lg:w-32";
  
  const navigate = useNavigate();
  const [idBus, setIdBus] = useState<BusquedaType>(BusquedaType.Nombre);
  const [DeBus, setDeBus] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [debouncedDeBus] = useDebounce(DeBus, 400);
  
  const buscar = useMemo(() => {
    return { 
      idBus, 
      DeBus: debouncedDeBus, 
      subjectType: typeFilter === 'all' ? undefined : typeFilter,
      grade: gradeFilter === 'all' ? undefined : gradeFilter
    };
  }, [idBus, debouncedDeBus, typeFilter, gradeFilter]);

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen p-4 lg:p-8">
        <h2 className="text-2xl text-center font-bold text-gray-800 mb-6">
          <FaList className="mr-4 inline-block" />
          Lista de Materias
        </h2>

        {/* Controles de Búsqueda */}
        <div className="flex flex-col lg:flex-row gap-4 w-full mb-6">
          <div className="w-full lg:w-[900px] flex flex-col lg:flex-row items-start lg:items-center gap-2">
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`${inputStyle} w-full lg:w-48`}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select 
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className={`${inputStyle} w-full lg:w-48`}
            >
              {gradeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => { navigate('/admin/Schedule'); }}
              className={btnStyleGreen}
            >
              <FaBookMedical className="mr-2 inline-block" />
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

        {/* Lista de materias */}
        <div className="flex-1">
          <LoadListSubjectsAPI Buscar={buscar} />
        </div>
      </div>
    </AnimatedPage>
  );
}