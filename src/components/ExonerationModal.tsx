import React, { useState } from 'react';

interface ExonerationModalProps {
  show: boolean;
  studentName: string;
  currentPercent: number;
  onClose: () => void;
  onSave: (percent: number) => void;
  isSaving?: boolean;
}

const ExonerationModal: React.FC<ExonerationModalProps> = ({
  show,
  studentName,
  currentPercent,
  onClose,
  onSave,
  isSaving,
}) => {
  const [percent, setPercent] = useState<number>(currentPercent);

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (percent >= 0 && percent <= 100) {
      onSave(percent);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-bold mb-4">Exonerar a {studentName}</h3>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Porcentaje de exoneración (0 - 100)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={percent}
            onChange={(e) => setPercent(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExonerationModal;