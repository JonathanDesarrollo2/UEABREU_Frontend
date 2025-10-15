import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTarget, FiHeart, FiBook, FiGlobe, FiStar } from 'react-icons/fi';

const AboutUsView: React.FC = () => {
  const stats = [
    { number: '25+', label: 'Años de experiencia' },
    { number: '5,000+', label: 'Estudiantes graduados' },
    { number: '50+', label: 'Profesores calificados' },
    { number: '15+', label: 'Programas académicos' }
  ];

  const values = [
    {
      icon: <FiBook className="w-8 h-8" />,
      title: "Excelencia Académica",
      description: "Comprometidos con la más alta calidad educativa y formación integral."
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: "Formación en Valores",
      description: "Desarrollamos ciudadanos responsables con sólidos principios éticos."
    },
    {
      icon: <FiGlobe className="w-8 h-8" />,
      title: "Visión Global",
      description: "Preparamos estudiantes para los desafíos de un mundo interconectado."
    },
    {
      icon: <FiStar className="w-8 h-8" />,
      title: "Innovación Educativa",
      description: "Implementamos metodologías modernas y tecnología de vanguardia."
    }
  ];

  const milestones = [
    { year: '1998', event: 'Fundación de la institución' },
    { year: '2005', event: 'Acreditación de excelencia educativa' },
    { year: '2012', event: 'Expansión de instalaciones' },
    { year: '2020', event: 'Implementación de educación digital' },
    { year: '2024', event: 'Certificación internacional' }
  ];

  return (
    <div className="min-h-screen pt-28 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
            Con más de 25 años de experiencia, la U.E. José Antonio Abreu se ha consolidado 
            como un referente en educación de calidad, formando generaciones de líderes.
          </motion.p>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <FiTarget className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Nuestra Misión</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Formar ciudadanos integrales con valores, conocimientos y habilidades para la vida, 
                mediante una educación de calidad que promueva el desarrollo humano y la excelencia académica, 
                preparando a nuestros estudiantes para los desafíos del siglo XXI.
              </p>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <FiAward className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Nuestra Visión</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Ser la institución educativa líder en la región, reconocida por su excelencia académica, 
                innovación pedagógica y formación en valores, contribuyendo al desarrollo social y 
                formando ciudadanos comprometidos con la transformación positiva de su entorno.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Nuestros Valores</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Principios que guían cada acción y decisión en nuestra institución
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="text-blue-600 mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Línea de Tiempo */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Nuestra Historia</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un recorrido por los hitos más importantes de nuestra institución
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex items-center mb-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                  <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                    <p className="text-gray-700">{milestone.event}</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full border-4 border-white z-10"></div>
                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
                className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
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