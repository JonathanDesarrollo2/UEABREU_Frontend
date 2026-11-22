import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useNavigate } from 'react-router-dom';
import { FaList, FaUserPlus } from 'react-icons/fa';
import { FaDeleteLeft } from 'react-icons/fa6';
import AnimatedPage from '../../components/AnimatedPage';
import { sanitizeText } from '../../library/sanitizeInput';
import LoadListAPI from './components/LoadListAPI';
import type { TypeUserBuscar } from '../../types/user';

const nivelOptions = [
  { value: 'all', label: 'Todos los roles' },
  { value: '1', label: 'Representante' },
  { value: '2', label: 'Socio' },
  { value: '3', label: 'Financiero' },
  { value: '4', label: 'Administrativo' },
  { value: '5', label: 'Administrativo 2' },
  { value: '6', label: 'Coordinador de Evaluación' },
];

interface Props {
  readOnly?: boolean;
}

export default function AdminListUsersBackend({ readOnly = false }: Props) {
  const inputStyle = "bg-transparent text-blue-500 font-semibold py-2 px-4 border-2 border-solid border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors";
  const btnStyleGreen = "bg-transparent text-green-500 font-semibold py-2 px-4 border-2 border-solid border-green-500 rounded-md hover:bg-green-50 active:bg-green-100 transition-colors w-full lg:w-32";
  const btnStyleRed = "bg-transparent text-red-500 font-semibold py-2 px-4 border-2 border-solid border-red-500 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors w-full lg:w-32";
  
  const navigate = useNavigate();
  const [DeBus, setDeBus] = useState('');
  const [nivelFilter, setNivelFilter] = useState<NonNullable<TypeUserBuscar['nivelFilter']>>('all');
  const [debouncedDeBus] = useDebounce(DeBus, 400);
  
  const buscar = useMemo(() => {
    return { idBus: '1', DeBus: debouncedDeBus, nivelFilter }; // idBus fijo en '1' para que busque en usermail, userlogin, username y representante
  }, [debouncedDeBus, nivelFilter]);

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen p-4 lg:p-8">
        <h2 className="text-2xl text-center font-bold text-gray-800 mb-6">
          <FaList className="mr-4 inline-block" />
          Lista de Usuarios {readOnly && <span className="text-blue-500 text-sm ml-2">(Solo Lectura)</span>}        </h2>

        <div className="flex flex-col lg:flex-row gap-4 w-full mb-6">
          <div className="w-full lg:w-[800px] flex flex-col lg:flex-row items-start lg:items-center gap-2">
            <input
              type="text"
              value={DeBus}
              onChange={(e) => setDeBus(sanitizeText(e.target.value))}
              placeholder="Buscar por email, login, nombre o cédula..."
              className={`${inputStyle} w-full`}
            />
            <select 
              value={nivelFilter}
              onChange={(e) => setNivelFilter(e.target.value as NonNullable<TypeUserBuscar['nivelFilter']>)}
              className={`${inputStyle} w-full lg:w-64`}
            >
              {nivelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            {!readOnly && (
              <button
                type="button"
                onClick={() => navigate('/admin/users/insert')}
                className={btnStyleGreen}
              >
                <FaUserPlus className="mr-2 inline-block" />
                Nuevo
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={btnStyleRed}
            >
              <FaDeleteLeft className="mr-2 inline-block" />
              {readOnly ? 'Volver' : 'Cancelar'}
            </button>
          </div>
        </div>

        <div className="flex-1">
          <LoadListAPI Buscar={buscar} readOnly={readOnly} />
        </div>
      </div>
    </AnimatedPage>
  );
}