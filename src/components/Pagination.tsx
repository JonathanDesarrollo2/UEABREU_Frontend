interface PaginationProps {
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}
export default function Pagination({
  page,
  limit,
  totalPages,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const btnPagination = "bg-transparent text-blue-500 font-semibold py-2 px-4 border border-blue-500 rounded-md hover:bg-blue-50 active:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const selectLimit = "bg-transparent text-blue-500 font-semibold py-2 px-4 border border-blue-500 rounded-md hover:bg-blue-50 active:bg-blue-100 transition-colors";
  return (
    <div className="mt-4 flex flex-col lg:flex-row justify-between items-center gap-4 w-full px-4">
      {/* Selector de límite */}
      <div className="w-full lg:w-64 flex items-center gap-2">
        <span className="text-gray-700 whitespace-nowrap">Mostrar:</span>
        <select
          value={limit}
          onChange={onLimitChange}
          className={`${selectLimit} w-full`}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
        <span className="text-gray-700 whitespace-nowrap">elementos</span>
      </div>
      {/* Botones de paginación */}
      <div className="w-full lg:w-auto flex flex-col lg:flex-row items-center gap-2">
        <div className="w-full flex flex-wrap justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(1)}
            className={`${btnPagination} w-full lg:w-auto`}
          >
            Inicio
          </button>
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className={`${btnPagination} w-full lg:w-auto`}
          >
            Anterior
          </button>
          <span className="text-gray-700 w-full text-center lg:w-auto lg:px-4">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className={`${btnPagination} w-full lg:w-auto`}
          >
            Siguiente
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(totalPages)}
            className={`${btnPagination} w-full lg:w-auto`}
          >
            Final
          </button>
        </div>
      </div>
    </div>
  );
}