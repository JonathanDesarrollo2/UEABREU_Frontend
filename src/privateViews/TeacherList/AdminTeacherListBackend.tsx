import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useNavigate } from "react-router-dom";
import { FaList, FaUserPlus, FaEnvelope } from 'react-icons/fa';
import { FaDeleteLeft } from "react-icons/fa6";
import AnimatedPage from '../../components/AnimatedPage';
import { sanitizeText } from '../../library/sanitizeInput';
import LoadListAPI from './components/LoadListTeacherAPI';

// Reemplazar el enum por objeto constante
const BusquedaType = {
  Email: "1",
  Login: "2",
  Nombre: "3",
  Cedula: "4",
  EmailAdministrativo: "5" // NUEVA OPCIÓN PARA FILTRAR CORREOS ADMINISTRATIVOS
} as const;

type BusquedaType = typeof BusquedaType[keyof typeof BusquedaType];

const opcionesBusqueda = [
  { key: BusquedaType.Email, label: "Email" },
  { key: BusquedaType.Login, label: "Login" },
  { key: BusquedaType.Nombre, label: "Nombre" },
  { key: BusquedaType.Cedula, label: "Cédula" },
  { key: BusquedaType.EmailAdministrativo, label: "Correos Administrativos" } // NUEVA OPCIÓN
];

export default function AdminListUsersBackend() {
  const inputStyle = "bg-transparent text-blue-500 font-semibold py-2 px-4 border-2 border-solid border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors";
  const btnStyleGreen = "bg-transparent text-green-500 font-semibold py-2 px-4 border-2 border-solid border-green-500 rounded-md hover:bg-green-50 active:bg-green-100 transition-colors w-full lg:w-32";
  const btnStyleRed = "bg-transparent text-red-500 font-semibold py-2 px-4 border-2 border-solid border-red-500 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors w-full lg:w-32";
  
  const navigate = useNavigate();
  const [idBus, setIdBus] = useState<BusquedaType>(BusquedaType.Email);
  const [DeBus, setDeBus] = useState('');
  const [nivelFilter, setNivelFilter] = useState<'all' | '1' | '2' | 'admin-emails'>('all');
  const [debouncedDeBus] = useDebounce(DeBus, 400);
  
  // Determinar los filtros basados en las selecciones
  const buscar = useMemo(() => {
    let nivelFilterToSend = nivelFilter;
    let searchText = debouncedDeBus;
    let searchType = idBus;

    // Si seleccionó "Correos Administrativos", ajustamos los filtros automáticamente
    if (idBus === BusquedaType.EmailAdministrativo) {
      nivelFilterToSend = '2'; // Solo administrativos
      searchType = BusquedaType.Email; // Buscar por email
      // No modificamos el texto de búsqueda, pero el usuario puede seguir escribiendo
    }

    return { 
      idBus: searchType, 
      DeBus: searchText, 
      nivelFilter: nivelFilterToSend 
    };
  }, [idBus, debouncedDeBus, nivelFilter]);

  // Efecto para resetear filtros cuando se cambia el tipo de búsqueda
  const handleSearchTypeChange = (value: BusquedaType) => {
    setIdBus(value);
    
    // Si selecciona "Correos Administrativos", ajustar automáticamente el filtro de nivel
    if (value === BusquedaType.EmailAdministrativo) {
      setNivelFilter('2');
      // Opcional: Limpiar el campo de búsqueda o mostrar un placeholder específico
    }
  };

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
              onChange={(e) => handleSearchTypeChange(e.target.value as BusquedaType)}
              className={`${inputStyle} w-full lg:w-52`} // Aumentado el ancho
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
              placeholder={
                idBus === BusquedaType.EmailAdministrativo 
                  ? "Buscar correos administrativos..." 
                  : "Buscar..."
              }
              className={`${inputStyle} w-full`}
            />

            <select 
              value={nivelFilter}
              onChange={(e) => setNivelFilter(e.target.value as 'all' | '1' | '2' | 'admin-emails')}
              className={`${inputStyle} w-full lg:w-48 ${
                idBus === BusquedaType.EmailAdministrativo ? 'bg-blue-50 border-blue-300' : ''
              }`}
              disabled={idBus === BusquedaType.EmailAdministrativo} // Deshabilitado cuando se selecciona correos administrativos
            >
              <option value="all">Todos los niveles</option>
              <option value="1">Representantes (nivel 1)</option>
              <option value="2">Administrativos (nivel 2)</option>
              <option value="admin-emails">Correos Administrativos</option>
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

        {/* Indicador de filtro activo para correos administrativos */}
        {idBus === BusquedaType.EmailAdministrativo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <FaEnvelope className="text-blue-500 mr-2" />
              <span className="text-blue-700 font-medium">
                Filtrando solo correos de usuarios administrativos (nivel 2)
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-1 ml-7">
              Escribe en el campo de búsqueda para filtrar por correo específico
            </p>
          </div>
        )}

        {/* Lista de usuarios */}
        <div className="flex-1">
          <LoadListAPI Buscar={buscar} />
        </div>
      </div>
    </AnimatedPage>
  );
}