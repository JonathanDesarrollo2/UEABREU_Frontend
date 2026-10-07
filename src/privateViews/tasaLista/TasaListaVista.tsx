// src/privateViews/tasaLista/TasaListaVista.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaExchangeAlt, FaInfoCircle } from "react-icons/fa";
import AnimatedPage from "../../components/AnimatedPage";
import { useTasaLista, MONTH_NAMES } from "./hooks/useTasaLista";
import { MonthNavigator } from "./components/MonthNavigator";
import { RateTable } from "./components/RateTable";
import { EditRateModal } from "./components/EditRateModal";
import type { ExchangeRateRecord } from "../../apis/exchangeRate";

interface TasaListaProps {
  readOnly?: boolean;
}

export default function TasaLista({ readOnly = false }: TasaListaProps = {}) {
  const navigate = useNavigate();
  const {
    year, month,
    setYear, setMonth,
    goPrevMonth, goNextMonth,
    ratesByDate,
    loading,
    error,
    updateRate,
    createRate,
    reload,
  } = useTasaLista();

  const [editingRecord, setEditingRecord] = useState<ExchangeRateRecord | null>(null);
  const [creatingDate, setCreatingDate] = useState<string | null>(null);

  const closeModal = () => {
    setEditingRecord(null);
    setCreatingDate(null);
  };

  return (
    <>
      <AnimatedPage className="flex justify-center">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft /> <span>Volver</span>
            </button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
              <FaExchangeAlt className="mr-3" />
              Gestión de Tasas BCV
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {readOnly
                ? "Consulta las tasas diarias registradas por mes (solo lectura)."
                : "Consulta, agrega y edita las tasas diarias registradas. Los cambios no recalculan movimientos históricos."}
            </p>
          </div>

          <div className="mb-6">
            <MonthNavigator
              year={year}
              month={month}
              onPrev={goPrevMonth}
              onNext={goNextMonth}
              onChangeMonth={setMonth}
              onChangeYear={setYear}
            />
          </div>

          <div className="text-center mb-4 text-sm text-gray-600">
            Mostrando <strong>{MONTH_NAMES[month - 1]} {year}</strong>
          </div>

          {loading && (
            <div className="text-center py-10 text-gray-500">Cargando tasas...</div>
          )}

          {!loading && error && (
            <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center justify-center gap-2">
              <FaInfoCircle />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && (
            <RateTable
              year={year}
              month={month}
              ratesByDate={ratesByDate}
              onEdit={(r) => setEditingRecord(r)}
              onAdd={(iso) => setCreatingDate(iso)}
              readOnly={readOnly}
            />
          )}

          {!loading && !error && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={reload}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Recargar
              </button>
            </div>
          )}
        </div>
      </AnimatedPage>

      {!readOnly && (
        <EditRateModal
          record={editingRecord}
          creatingDate={creatingDate}
          onClose={closeModal}
          onUpdate={updateRate}
          onCreate={createRate}
        />
      )}
    </>
  );
}