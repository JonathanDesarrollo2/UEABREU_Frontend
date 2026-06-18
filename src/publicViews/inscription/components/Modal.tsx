import React from 'react';
import { motion } from 'framer-motion';
import { ACUERDO_TEXT } from '../const/constants';  // ajusta la ruta si tu constantes está en otro lado

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const AcuerdoModal: React.FC<Props> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Acuerdo de Convivencia</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">
            {ACUERDO_TEXT}
          </pre>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onAccept}
            className="bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition font-semibold"
          >
            Acepto el Acuerdo de Convivencia
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AcuerdoModal; 