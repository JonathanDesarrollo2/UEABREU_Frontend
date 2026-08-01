interface ColumnConfig {
    name: string;
    widthPercent: number; // Porcentaje del ancho total (0-100)
  }
  
  interface ListEmptyProps {
    message: string;
    columns: ColumnConfig[];
  }
  
  export default function ListEmpty({ message, columns }: ListEmptyProps) {
    // Validar que la suma de porcentajes sea 100%
    const totalWidth = columns.reduce((sum, col) => sum + col.widthPercent, 0);
    if (totalWidth !== 100) {
      console.warn(`La suma total de los porcentajes de ancho debe ser 100%. Actual: ${totalWidth}%`);
    }
  
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-blue-100/50">
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index}
                  className={`px-4 py-2 text-left text-gray-700 font-bold`}
                  style={{ width: `${column.widthPercent}%` }}
                >
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className="text-center hover:bg-gray-100 p-4 rounded">
                {message}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }