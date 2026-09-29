// src/privateViews/tasaLista/components/EditRateModal.tsx
import { useEffect, useState } from "react";
import { FaExchangeAlt, FaTimes } from "react-icons/fa";
import type { ExchangeRateRecord } from "../../../apis/exchangeRate";

interface Props {
  record: ExchangeRateRecord | null;
  onClose: () => void;
  onSave: (id: string, rate: number) => Promise<boolean>;
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

export const EditRateModal = ({ record, onClose, onSave }: Props) => {
  const [value, setValue] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setValue(String(record.rate));
      setLocalError(null);
    }
  }, [record]);

  if (!record) return null;

  const parsed = Number(value);
  const isValid = Number.isFinite(parsed) && parsed > 0;

  const handleSave = async () => {
    if (!isValid) {
      setLocalError("Ingresa un número mayor a 0");
      return;
    }
    setSaving(true);
    const ok = await onSave(record.id, parsed);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaExchangeAlt className="text-blue-600" />
            Editar Tasa
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
            {formatDateLong(record.effectiveDate)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nueva tasa (Bs/USD) *
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
            Esta edición no recalcula movimientos históricos.
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};