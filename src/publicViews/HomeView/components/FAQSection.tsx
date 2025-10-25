import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiPhone, FiMail, FiMessageCircle } from 'react-icons/fi';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export const FAQSection: React.FC = () => {
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "¿Qué niveles educativos ofrecen?",
      answer: "Ofrecemos educación desde primaria hasta bachillerato, con una formación integral basada en valores y excelencia académica."
    },
    {
      id: 2,
      question: "¿Cómo puedo obtener más información?",
      answer: "Puedes contactarnos directamente por teléfono o correo electrónico. Estaremos encantados de resolver todas tus dudas y agendar una visita si lo deseas."
    }
  ];

  const toggleItem = (id: number) => {
    setActiveItem(activeItem === id ? null : id);
  };

  return (
    <section className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-gradient-to-br from-gray-50 to-emerald-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Información básica sobre nuestra institución
          </p>
        </motion.div>

        {/* Grid de preguntas - Solo 2 preguntas */}
        <div className="grid grid-cols-1 gap-6 mb-16 max-w-2xl mx-auto">
          {faqData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden"
            >
              <motion.button
                onClick={() => toggleItem(item.id)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="font-semibold text-gray-800 text-lg pr-4">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: activeItem === item.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FiChevronDown className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {activeItem === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                      <motion.p 
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="text-gray-700 leading-relaxed"
                      >
                        {item.answer}
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Sección de contacto simplificada */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-2xl mx-auto"
        >
          <div className="text-center mb-6">
            <div className="bg-emerald-100 p-3 rounded-full inline-flex mb-4">
              <FiMessageCircle className="h-8 w-8 text-emerald-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              ¿Necesitas más información?
            </h3>
            <p className="text-gray-600">
              Contáctanos directamente para resolver todas tus dudas
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <div className="flex items-center text-gray-700">
              <FiPhone className="h-5 w-5 text-emerald-600 mr-2" />
              <span>+58 412-208.84.51</span>
            </div>
            <div className="flex items-center text-gray-700">
              <FiMail className="h-5 w-5 text-emerald-600 mr-2" />
              <span>uejantonioabre@gmail.com</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-md"
            >
              Contactar Ahora
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};