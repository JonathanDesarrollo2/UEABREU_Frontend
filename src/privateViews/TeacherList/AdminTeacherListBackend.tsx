// src/pages/teacher/TeacherListPage.tsx
import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useNavigate } from "react-router-dom";
import { FaList, FaUserPlus } from 'react-icons/fa';
import { FaDeleteLeft } from "react-icons/fa6";
import AnimatedPage from '../../components/AnimatedPage';
import { sanitizeText } from '../../library/sanitizeInput';
import LoadListTeacherAPI from './components/LoadListTeacherAPI';

// Definimos los tipos de búsqueda
const BusquedaType = {
  Nombre: "1",
  Cedula: "2",
  Email: "3",
  Especializacion: "4",
} as const;

type BusquedaType = typeof BusquedaType[keyof typeof BusquedaType];

const opcionesBusqueda = [
  { key: BusquedaType.Nombre, label: "Nombre" },
  { key: BusquedaType.Cedula, label: "Cédula" },
  { key: BusquedaType.Email, label: "Email" },
  { key: BusquedaType.Especializacion, label: "Especialización" },
];

export default function TeacherListPage() {
  const inputStyle = "bg-transparent text-blue-500 font-semibold py-2 px-4 border-2 border-solid border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors";
  const btnStyleGreen = "bg-transparent text-green-500 font-semibold py-2 px-4 border-2 border-solid border-green-500 rounded-md hover:bg-green-50 active:bg-green-100 transition-colors w-full lg:w-32";
  const btnStyleRed = "bg-transparent text-red-500 font-semibold py-2 px-4 border-2 border-solid border-red-500 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors w-full lg:w-32";
  
  const navigate = useNavigate();
  const [idBus, setIdBus] = useState<BusquedaType>(BusquedaType.Nombre);
  const [DeBus, setDeBus] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [debouncedDeBus] = useDebounce(DeBus, 400);
  
  // Determinar los filtros basados en las selecciones
  const buscar = useMemo(() => {
    return { 
      idBus, 
      DeBus: debouncedDeBus, 
      statusFilter 
    };
  }, [idBus, debouncedDeBus, statusFilter]);

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen p-4 lg:p-8">
        <h2 className="text-2xl text-center font-bold text-gray-800 mb-6">
          <FaList className="mr-4 inline-block" />
          Lista de Profesores
        </h2>

        {/* Controles de Búsqueda */}
        <div className="flex flex-col lg:flex-row gap-4 w-full mb-6">
          <div className="w-full lg:w-[800px] flex flex-col lg:flex-row items-start lg:items-center gap-2">
            <span className="text-gray-700 whitespace-nowrap">Buscar por:</span>
            <select 
              value={idBus}
              onChange={(e) => setIdBus(e.target.value as BusquedaType)}
              className={`${inputStyle} w-full lg:w-52`}
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
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className={`${inputStyle} w-full lg:w-48`}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => { navigate('/admin/Schedule'); }}
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

        {/* Lista de profesores */}
        <div className="flex-1">
          <LoadListTeacherAPI Buscar={buscar} />
        </div>
      </div>
    </AnimatedPage>
  );
}