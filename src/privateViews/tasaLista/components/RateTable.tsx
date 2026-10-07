// src/privateViews/tasaLista/components/RateTable.tsx
import { FaEdit, FaPlus } from "react-icons/fa";
import type { ExchangeRateRecord } from "../../../apis/exchangeRate";

interface Props {
  year: number;
  month: number;
  ratesByDate: Record<string, ExchangeRateRecord>;
  onEdit: (record: ExchangeRateRecord) => void;
  onAdd: (isoDate: string) => void;
  readOnly?: boolean; // ← NUEVO
}

const formatRate = (value: number) =>
  new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);

const formatDateLong = (date: Date) =>
  date.toLocaleDateString("es-VE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

const pad = (n: number) => String(n).padStart(2, "0");

export const RateTable = ({ year, month, ratesByDate, onEdit, onAdd, readOnly = false }: Props) => {
  const totalDays = getDaysInMonth(year, month);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-4xl mx-auto">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Tasa (Bs/USD)
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Fuente
              </th>
              {!readOnly && (
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {days.map((day) => {
              const iso = `${year}-${pad(month)}-${pad(day)}`;
              const record = ratesByDate[iso];
              const dateObj = new Date(year, month - 1, day);
              const hasRate = !!record;

              return (
                <tr
                  key={iso}
                  className={hasRate ? "hover:bg-gray-50 transition-colors" : "bg-gray-50 text-gray-400"}
                >
                  <td className="px-4 py-3 text-sm capitalize">
                    {formatDateLong(dateObj)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono">
                    {hasRate ? (
                      <span className="font-bold text-gray-800">
                        {formatRate(record.rate)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {hasRate ? (record.source || "—") : ""}
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-3 text-sm text-right">
                      {hasRate ? (
                        <button
                          type="button"
                          onClick={() => onEdit(record)}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-semibold"
                        >
                          <FaEdit className="text-[10px]" />
                          Editar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAdd(iso)}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs font-semibold"
                        >
                          <FaPlus className="text-[10px]" />
                          Agregar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};