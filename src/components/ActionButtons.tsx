import { 
  FaSave, 
  FaTrashAlt, 
  FaTimes
} from 'react-icons/fa';

interface ActionButtonsProps {
  onCancel: () => void;
  onClear: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onCancel, onClear }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {/* Botón Guardar */}
      <button
        type="submit"
        className="flex items-center justify-center min-w-[120px] bg-transparent text-blue-500 font-semibold py-2 px-6 border-2 border-solid border-blue-500 rounded-md hover:bg-blue-50 active:bg-blue-100 transition-colors"
      >
        <FaSave className="mr-2 inline-block" />
        <span>Guardar</span>
      </button>

      {/* Botón Limpiar */}
      <button
        type="button"
        onClick={onClear}
        className="flex items-center justify-center min-w-[120px] bg-transparent text-green-600 font-semibold py-2 px-6 border-2 border-solid border-green-300 rounded-md hover:bg-green-50 active:bg-green-100 transition-colors"
      >
        <FaTrashAlt className="mr-2 inline-block" />
        <span>Limpiar</span>
      </button>

      {/* Botón Cancelar */}
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center justify-center min-w-[120px] bg-transparent text-red-500 font-semibold py-2 px-6 border-2 border-solid border-red-500 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors"
      >
        <FaTimes className="mr-2 inline-block" />
        <span>Cancelar</span>
      </button>
    </div>
  );
};