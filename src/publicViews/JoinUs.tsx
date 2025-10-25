import React from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiUsers, FiClock, FiArrowRight, FiStar, FiShield } from 'react-icons/fi';

export const JoinUsView: React.FC = () => {
  const contactInfo = [
    {
      icon: <FiPhone className="w-6 h-6" />,
      title: "Teléfonos de Contacto",
      details: ["+58 412-208.84.51"],
      description: "Líneas directas para información sobre admisiones"
    },
    {
      icon: <FiMail className="w-6 h-6" />,
      title: "Correo Electrónico",
      details: ["uejantonioabre@gmail.com"],
      description: "Respondemos dentro de las 24 horas hábiles"
    },
    {
      icon: <FiMapPin className="w-6 h-6" />,
      title: "Ubicación",
      details: ["Av. Principal de la Urb. Los Samanes", "Ciudad Bolívar, Estado Bolívar"],
      description: "Visita nuestras instalaciones previa cita"
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: "Horarios de Atención",
      details: ["Lunes a Viernes: 7:00 AM - 4:00 PM", "Sábados: 8:00 AM - 12:00 PM"],
      description: "Atención personalizada para entrevistas"
    }
  ];

  const benefits = [
    "Educación personalizada y de calidad",
    "Instalaciones modernas y seguras",
    "Profesores altamente calificados",
    "Programas extracurriculares diversos",
    "Comunidad educativa inclusiva",
    "Formación en valores y excelencia académica"
  ];

  return (
    <section className="w-screen left-1/2 -translate-x-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 py-24">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Hero Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <FiShield className="mr-2" />
            Admisión Personalizada
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Únete a Nuestra Familia Educativa
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Forma parte de la comunidad <span className="font-semibold text-emerald-600">U.E. José Antonio Abreu</span>. 
            Contamos con un proceso de admisión personalizado para garantizar 
            la mejor experiencia educativa para tu hijo.
          </p>
        </motion.div>

        {/* Información Principal */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Columna izquierda - Proceso */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-emerald-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FiUsers className="mr-3 text-emerald-600" />
              Proceso de Admisión
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-emerald-100 text-emerald-600 rounded-lg p-3 mt-1">
                  <span className="font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contacto Inicial</h3>
                  <p className="text-gray-700">
                    Comuníquese con nosotros para programar una entrevista informativa.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-emerald-100 text-emerald-600 rounded-lg p-3 mt-1">
                  <span className="font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Entrevista Personal</h3>
                  <p className="text-gray-700">
                    Reunión con el departamento académico para conocer sus expectativas.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-emerald-100 text-emerald-600 rounded-lg p-3 mt-1">
                  <span className="font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Invitación Formal</h3>
                  <p className="text-gray-700">
                    Una vez evaluada la solicitud, extendemos la invitación formal.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Columna derecha - Beneficios */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl shadow-lg p-8 text-white"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FiStar className="mr-3 text-yellow-300" />
              Por Qué Elegirnos
            </h2>
            
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center">
                  <FiArrowRight className="mr-3 text-emerald-300 flex-shrink-0" />
                  <span className="text-emerald-100">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-4 bg-white/10 rounded-xl">
              <p className="text-sm text-emerald-100">
                <strong>Nota:</strong> El proceso de admisión está sujeto a disponibilidad de cupos 
                y cumplimiento de los requisitos académicos establecidos.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Información de Contacto */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comuníquese con Nosotros
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Estamos aquí para responder todas sus preguntas y guiarle en el proceso de admisión.
          </p>
        </motion.div>

        {/* Grid de Contacto */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((item, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow border border-emerald-100"
            >
              <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <div className="text-emerald-600">
                  {item.icon}
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-3">{item.title}</h3>
              
              <div className="space-y-2 mb-3">
                {item.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-700 font-medium">{detail}</p>
                ))}
              </div>
              
              <p className="text-sm text-gray-500">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Final */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-emerald-100"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Listo para Comenzar?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Agenda tu entrevista personal hoy mismo y descubre por qué somos la mejor opción educativa para tu familia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="tel:+584121234567"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center justify-center"
            >
              <FiPhone className="mr-2" />
              Llamar Ahora
            </motion.a>
            
            <motion.a
              href="mailto:admisiones@colegiojoseantonioabreu.edu.ve"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-emerald-600 text-emerald-600 px-8 py-3 rounded-lg hover:bg-emerald-50 transition-colors font-semibold flex items-center justify-center"
            >
              <FiMail className="mr-2" />
              Enviar Email
            </motion.a>
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

export default JoinUsView;