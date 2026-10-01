// src/privateViews/tasaLista/components/MonthNavigator.tsx
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MONTH_NAMES } from "../hooks/useTasaLista";

interface Props {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onChangeMonth: (m: number) => void;
  onChangeYear: (y: number) => void;
}

const YEAR_MIN = 2024;
const YEAR_MAX = 2030;
const YEARS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i);

export const MonthNavigator = ({
  year, month, onPrev, onNext, onChangeMonth, onChangeYear,
}: Props) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white rounded-xl shadow-md p-4 max-w-3xl mx-auto">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Mes anterior"
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
      >
        <FaChevronLeft />
      </button>

      <select
        value={month}
        onChange={(e) => onChangeMonth(Number(e.target.value))}
        className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
      >
        {MONTH_NAMES.map((name, idx) => (
          <option key={name} value={idx + 1}>{name}</option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => onChangeYear(Number(e.target.value))}
        className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <button
        type="button"
        onClick={onNext}
        aria-label="Mes siguiente"
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};