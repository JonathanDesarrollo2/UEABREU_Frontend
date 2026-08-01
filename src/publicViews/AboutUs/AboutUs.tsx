import React from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiAward, FiUsers, FiHeart, FiStar, FiBook } from 'react-icons/fi';

const AboutUsView: React.FC = () => {
  const values = [
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Trabajo en Equipo",
      description: "Fomentamos la colaboración y el trabajo conjunto para lograr objetivos comunes."
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: "Amistad y Honestidad",
      description: "Valoramos las relaciones genuinas basadas en la verdad y la transparencia."
    },
    {
      icon: <FiStar className="w-8 h-8" />,
      title: "Dedicación y Esfuerzo",
      description: "Creemos en el trabajo constante y el compromiso con la excelencia."
    },
    {
      icon: <FiBook className="w-8 h-8" />,
      title: "Solidaridad y Tolerancia",
      description: "Practicamos el respeto a la diversidad y el apoyo mutuo."
    },
    {
      icon: <FiTarget className="w-8 h-8" />,
      title: "Responsabilidad y Confianza",
      description: "Cumplimos con nuestros compromisos y generamos relaciones de confianza."
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Respeto y Compromiso",
      description: "Actuamos con consideración hacia los demás y nos comprometemos con nuestra misión."
    }
  ];

  const projectPhases = [
    { 
      phase: "Análisis", 
      description: "Evaluación de necesidades y oportunidades para el desarrollo educativo integral."
    },
    { 
      phase: "Ideas", 
      description: "Generación de propuestas innovadoras que respondan a los desafíos educativos actuales."
    },
    { 
      phase: "Investigación", 
      description: "Estudio y aplicación de las mejores prácticas pedagógicas y metodológicas."
    },
    { 
      phase: "Valores", 
      description: "Implementación de nuestro sistema de valores en todos los procesos educativos."
    },
    { 
      phase: "Resultados", 
      description: "Evaluación continua y mejora basada en los logros y aprendizajes obtenidos."
    }
  ];

  return (
    <div className="min-h-screen pt-28 bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Sobre Nosotros
          </motion.h1>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl max-w-3xl mx-auto"
          >
            Inspirados por el legado del Maestro José Antonio Abreu, formamos líderes con espíritu de servicio
          </motion.p>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4 border border-blue-200">
                  <FiTarget className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Nuestra Visión</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Formar jóvenes mediante una educación integral y de excelencia que promueve el pensamiento crítico, 
                la constancia y la solidaridad. Inspirados por el legado del Maestro José Antonio Abreu, desarrollamos 
                en nuestros estudiantes un liderazgo con espíritu de servicio, capacitándolos para transformar los 
                desafíos en oportunidades.
              </p>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4 border border-blue-200">
                  <FiAward className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Nuestra Misión</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Consolidarnos como la institución que forma a la nueva generación de profesionales y ciudadanos, 
                reconocida por un modelo educativo donde la excelencia académica y el espíritu de servicio se unen 
                para honrar el legado del Maestro José Antonio Abreu.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Nuestros Valores</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Principios fundamentales que guían nuestra labor educativa diaria
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-blue-700 mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3 text-center">{value.title}</h3>
                <p className="text-slate-600 text-center">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Proyecto a Ejecutar en el Tiempo */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Proyecto a Ejecutar en el Tiempo</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Nuestra metodología de trabajo basada en un proceso continuo de mejora
            </p>
          </motion.div>

          <div className="space-y-8">
            {projectPhases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center gap-8"
              >
                <div className="flex-shrink-0 w-28 h-28 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white">
                  {index + 1}
                </div>
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                  <div className="flex items-center mb-4">
                    <div className="w-4 h-4 rounded-full bg-blue-700 mr-3"></div>
                    <h3 className="text-xl font-bold text-slate-800">{phase.phase}</h3>
                  </div>
                  <p className="text-slate-600">{phase.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para ser parte de nuestra familia?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Únete a la U.E. José Antonio Abreu y comienza un camino hacia la excelencia educativa
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/join-us"
                className="bg-white text-blue-800 px-8 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-lg"
              >
                Solicitar Información
              </a>
              <a
                href="/login"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Acceder al Sistema
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsView;