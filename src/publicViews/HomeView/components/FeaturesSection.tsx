import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

export const FeaturesSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const teachers = [
    {
      name: "Carlos Mescia",
      position: "Director",
      image: "../../../../Eq1.png"
    },
    {
      name: "Obed Barboza",
      position: "Evaluación",
      image: "../../../../Eq2.png"
    },
    {
      name: "Leonardo Yépez",
      position: "Administrador",
      image: "../../../../Eq3.png"
    },
    {
      name: "Minerba Pereira",
      position: "Profesora",
      image: "../../../../Eq4.png"
    },
    {
      name: "Obed Barboza",
      position: "Profesor",
      image: "../../../../Eq5.png"
    },
    {
      name: "Johely Gómez",
      position: "Profesora",
      image: "../../../../Eq6.png"
    },
    {
      name: "Javier Mejias",
      position: "Profesor",
      image: "../../../../Eq7.png"
    },
    {
      name: "Milagros Romero",
      position: "Profesora",
      image: "../../../../Eq8.png"
    },
    {
      name: "Leonardo Hidalgo",
      position: "Profesor",
      image: "../../../../Eq9.png"
    },
    {
      name: "Ylbis Solis",
      position: "Profesora",
      image: "../../../../Eq10.png"
    },
    {
      name: "Luis Jose Hernandez",
      position: "Profesor",
      image: "../../../../Eq11.png"
    },
    {
      name: "Wilmer Landaeta",
      position: "Profesor",
      image: "../../../../Eq12.png"
    },
    {
      name: "Miguel J. Mescia",
      position: "Profesor",
      image: "../../../../Eq13.png"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % teachers.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + teachers.length) % teachers.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Nuestro Equipo Docente
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Profesionales comprometidos con la excelencia educativa y formación integral
          </p>
        </motion.div>

        {/* Carrusel Principal */}
        <div className="relative mb-12">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="flex justify-center"
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full max-w-md">
                  <div className="h-80 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={teachers[currentIndex].image}
                      alt={teachers[currentIndex].name}
                      className="h-full w-auto object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x400/4ade80/ffffff?text=Docente';
                      }}
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {teachers[currentIndex].name}
                    </h3>
                    <p className="text-emerald-600 font-semibold">
                      {teachers[currentIndex].position}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Botones de navegación */}
          {teachers.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 z-10"
                aria-label="Docente anterior"
              >
                <FiArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 z-10"
                aria-label="Docente siguiente"
              >
                <FiArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* Indicadores */}
        <div className="flex justify-center mb-8 space-x-2">
          {teachers.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "bg-emerald-500 w-6" 
                  : "bg-gray-300 w-2 hover:bg-gray-400"
              }`}
              aria-label={`Ir al docente ${index + 1}`}
            />
          ))}
        </div>

        {/* Miniaturas de todos los docentes */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-6">
            Conoce a Todo Nuestro Equipo
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {teachers.map((teacher, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`text-center p-3 rounded-lg transition-all duration-300 border ${
                  index === currentIndex 
                    ? "bg-emerald-50 border-emerald-500 shadow-md" 
                    : "bg-gray-50 border-gray-200 hover:bg-white hover:border-emerald-300"
                }`}
              >
                <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-gray-200 border-2 border-white">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/64x64/4ade80/ffffff?text=D';
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-800 block truncate">
                  {teacher.name.split(' ')[0]}
                </span>
                <span className="text-xs text-gray-600 block truncate mt-1">
                  {teacher.position}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-10 p-5 bg-emerald-50 rounded-xl border border-emerald-100"
        >
          <p className="text-gray-700">
            <span className="font-semibold text-emerald-600">{teachers.length} profesionales</span> dedicados a la formación de nuestros estudiantes
          </p>
        </motion.div>
      </div>
    </section>
  );
};