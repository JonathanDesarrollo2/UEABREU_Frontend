// src/views/admin/users/AdminListUsersBackend.tsx
import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useNavigate } from "react-router-dom";
import { FaList, FaUserPlus } from 'react-icons/fa';
import { FaDeleteLeft } from "react-icons/fa6";
import AnimatedPage from '../../components/AnimatedPage';
import { sanitizeText } from '../../library/sanitizeInput';
import LoadListAPI from './components/LoadListAPI';

// Reemplazar el enum por objeto constante
const BusquedaType = {
  Email: "1",
  Login: "2",
  Nombre: "3",
  Cedula: "4"
} as const;

type BusquedaType = typeof BusquedaType[keyof typeof BusquedaType];

const opcionesBusqueda = [
  { key: BusquedaType.Email, label: "Email" },
  { key: BusquedaType.Login, label: "Login" },
  { key: BusquedaType.Nombre, label: "Nombre" },
  { key: BusquedaType.Cedula, label: "Cédula" }
];

export default function AdminListUsersBackend() {
  const inputStyle = "bg-transparent text-blue-500 font-semibold py-2 px-4 border-2 border-solid border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors";
  const btnStyleGreen = "bg-transparent text-green-500 font-semibold py-2 px-4 border-2 border-solid border-green-500 rounded-md hover:bg-green-50 active:bg-green-100 transition-colors w-full lg:w-32";
  const btnStyleRed = "bg-transparent text-red-500 font-semibold py-2 px-4 border-2 border-solid border-red-500 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors w-full lg:w-32";
  
  const navigate = useNavigate();
  const [idBus, setIdBus] = useState<BusquedaType>(BusquedaType.Email);
  const [DeBus, setDeBus] = useState('');
  const [nivelFilter, setNivelFilter] = useState<'all' | '1' | '2'>('all');
  const [debouncedDeBus] = useDebounce(DeBus, 400);
  
  const buscar = useMemo(() => {
    return { idBus, DeBus: debouncedDeBus, nivelFilter };
  }, [idBus, debouncedDeBus, nivelFilter]);

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen p-4 lg:p-8">
        <h2 className="text-2xl text-center font-bold text-gray-800 mb-6">
          <FaList className="mr-4 inline-block" />
          Lista de Usuarios
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
              value={nivelFilter}
              onChange={(e) => setNivelFilter(e.target.value as 'all' | '1' | '2')}
              className={`${inputStyle} w-full lg:w-48`}
            >
              <option value="all">Todos los niveles</option>
              <option value="1">Representantes (nivel 1)</option>
              <option value="2">Administrativos (nivel 2)</option>
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

        {/* Lista de usuarios */}
        <div className="flex-1">
          <LoadListAPI Buscar={buscar} />
        </div>
      </div>
    </AnimatedPage>
  );
}