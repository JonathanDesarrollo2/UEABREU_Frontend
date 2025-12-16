import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

interface ModalProps {
  isOpen: boolean;
  message: string;
  type: 'success' | 'error' | 'loading';
  onClose: () => void;
}

export const Modal = ({ isOpen, message, type, onClose }: ModalProps) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-4xl" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500 text-4xl" />;
      default:
        return (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        );
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${getBgColor()} rounded-2xl p-6 max-w-sm w-full border-2 shadow-xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                {getIcon()}
                <h3 className="text-lg font-semibold text-gray-800 capitalize">
                  {type === 'loading' ? 'Procesando' : type}
                </h3>
              </div>
              {type !== 'loading' && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              )}
            </div>
            
            <p className="text-gray-700 mb-4">{message}</p>
            
            {type === 'loading' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse"></div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};