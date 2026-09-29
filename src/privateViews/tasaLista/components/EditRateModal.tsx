// src/privateViews/tasaLista/components/EditRateModal.tsx
import { useEffect, useState } from "react";
import { FaExchangeAlt, FaPlus, FaTimes } from "react-icons/fa";
import type { ExchangeRateRecord } from "../../../apis/exchangeRate";

interface Props {
  // Modo edición: registro existente
  record: ExchangeRateRecord | null;
  // Modo creación: fecha valor YYYY-MM-DD
  creatingDate: string | null;
  onClose: () => void;
  onUpdate: (id: string, rate: number) => Promise<boolean>;
  onCreate: (date: string, rate: number) => Promise<boolean>;
}

const formatDateLong = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-VE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const EditRateModal = ({
  record, creatingDate, onClose, onUpdate, onCreate,
}: Props) => {
  const isCreating = !!creatingDate && !record;
  const isOpen = !!record || !!creatingDate;

  const [value, setValue] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setValue(String(record.rate));
    } else if (creatingDate) {
      setValue("");
    }
    setLocalError(null);
  }, [record, creatingDate]);

  if (!isOpen) return null;

  const parsed = Number(value);
  const isValid = Number.isFinite(parsed) && parsed > 0;

  const handleSave = async () => {
    if (!isValid) {
      setLocalError("Ingresa un número mayor a 0");
      return;
    }
    setSaving(true);
    let ok = false;
    if (isCreating && creatingDate) {
      ok = await onCreate(creatingDate, parsed);
    } else if (record) {
      ok = await onUpdate(record.id, parsed);
    }
    setSaving(false);
    if (ok) onClose();
  };

  const displayDate = record?.effectiveDate || creatingDate || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {isCreating ? (
              <>
                <FaPlus className="text-green-600" />
                Agregar Tasa
              </>
            ) : (
              <>
                <FaExchangeAlt className="text-blue-600" />
                Editar Tasa
              </>
            )}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <FaTimes />
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-sm">
          <p className="text-gray-600 text-xs uppercase font-semibold">Fecha (no editable)</p>
          <p className="text-gray-800 font-semibold capitalize mt-1">
            {formatDateLong(displayDate)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isCreating ? "Tasa (Bs/USD) *" : "Nueva tasa (Bs/USD) *"}
          </label>
          <input
            type="number"
            step="0.0001"
            min="0.0001"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setLocalError(null);
            }}
            className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 ${
              localError ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="0.0000"
          />
          {localError && (
            <p className="text-xs text-red-600 mt-1">{localError}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {isCreating
              ? "La tasa se registrará con fuente 'manual' y no recalcula movimientos históricos."
              : "Esta edición no recalcula movimientos históricos."}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid || saving}
            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2 ${
              isCreating
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : (
              isCreating ? "Agregar" : "Guardar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};