import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiPhone, FiMail, FiClock, FiMessageCircle } from 'react-icons/fi';

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
      question: "¿Cuál es el proceso de admisión?",
      answer: "Solicitud online → Entrevista académica → Evaluación diagnóstica → Entrega de documentos → Confirmación de matrícula."
    },
    {
      id: 2,
      question: "¿Qué documentos necesito?",
      answer: "Partida de nacimiento, cédula del estudiante y representante, boletines anteriores, certificado de vacunas, fotos carnet y constancia de conducta."
    },
    {
      id: 3,
      question: "¿Cuáles son los horarios?",
      answer: "Turno mañana: 7:00 AM - 12:30 PM | Turno tarde: 1:00 PM - 5:30 PM | Actividades extracurriculares hasta las 6:30 PM."
    },
    {
      id: 4,
      question: "¿Ofrecen transporte escolar?",
      answer: "Sí, tenemos rutas que cubren las principales zonas de la ciudad. Costo adicional según la zona de residencia."
    },
    {
      id: 5,
      question: "¿Qué incluye la mensualidad?",
      answer: "Clases regulares, uso de instalaciones, seguro estudiantil, material básico y actividades culturales dentro del horario escolar."
    },
    {
      id: 6,
      question: "¿Hay becas o descuentos?",
      answer: "Becas por excelencia académica, deportiva y cultural. Descuentos por hermanos y para hijos de personal."
    }
  ];

  const toggleItem = (id: number) => {
    setActiveItem(activeItem === id ? null : id);
  };

  return (
    <section className="w-screen left-1/2 -translate-x-1/2 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Respuestas a las dudas más comunes de nuestros padres y representantes
          </p>
        </motion.div>

        {/* Grid de preguntas en burbujas horizontales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          {faqData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <motion.button
                onClick={() => toggleItem(item.id)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50/50 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-semibold text-gray-800 text-lg pr-4">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: activeItem === item.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FiChevronDown className="h-5 w-5 text-blue-600 flex-shrink-0" />
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
                    <div className="px-6 pb-6">
                      <motion.p 
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="text-gray-700 whitespace-pre-line leading-relaxed"
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

        {/* Sección final de contacto */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FiMessageCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Nuestro equipo de atención está disponible para resolver todas tus dudas personalmente
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <div className="flex items-center text-gray-700 bg-blue-50/50 px-4 py-2 rounded-lg">
              <FiPhone className="h-4 w-4 text-blue-600 mr-2" />
              <span>(0243) 555-1234</span>
            </div>
            <div className="flex items-center text-gray-700 bg-blue-50/50 px-4 py-2 rounded-lg">
              <FiMail className="h-4 w-4 text-blue-600 mr-2" />
              <span>admisiones@institucion.edu.ve</span>
            </div>
            <div className="flex items-center text-gray-700 bg-blue-50/50 px-4 py-2 rounded-lg">
              <FiClock className="h-4 w-4 text-blue-600 mr-2" />
              <span>Lun-Vie: 7:00 AM - 4:00 PM</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
            >
              Solicitar Información
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              Agendar Visita
            </motion.button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};