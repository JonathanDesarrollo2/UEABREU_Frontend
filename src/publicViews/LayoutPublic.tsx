import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogIn, FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiArrowRight, FiInfo } from 'react-icons/fi';
import ScrollToTop from './Components/ScrollToTop';

const LayoutPublic = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar el menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Servicios', path: '#servicios' },
    { name: 'Ventajas', path: '#ventajas' },
    { name: 'Docentes', path: '#docentes' },
    { name: 'Sobre Nosotros', path: '/SobreNosotros' },
  ];

  // Función para manejar clicks en enlaces
  const handleLinkClick = (path: string) => {
    setIsMenuOpen(false);
    
    // Si es un hash link (ancla), no hacer scroll al top
    if (path.startsWith('#')) {
      return;
    }
    
    // Para rutas normales, hacer scroll al top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Componente para scroll automático al cambiar rutas */}
      <ScrollToTop />
      
      {/* Navbar grande y moderna */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 shadow-xl py-3 backdrop-blur-md'
            : 'bg-gradient-to-r from-blue-900/95 to-indigo-800/95 py-6 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-3 group"
              onClick={() => handleLinkClick('/')}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 ${
                scrolled ? 'bg-blue-700' : 'bg-white/20 backdrop-blur-md'
              }`}>
                <span className={`font-bold text-xl ${scrolled ? 'text-white' : 'text-white'}`}>
                  JAA
                </span>
              </div>
              <div className="hidden sm:block">
                <h1 className={`font-bold text-lg leading-tight transition-colors ${scrolled ? 'text-gray-800' : 'text-white'}`}>
                  U.E. José Antonio Abreu
                </h1>
                <p className={`text-xs transition-colors ${scrolled ? 'text-gray-500' : 'text-blue-100'}`}>
                  Formando líderes del mañana
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => handleLinkClick(item.path)}
                  className={`relative px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                    location.pathname === item.path
                      ? scrolled 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-white/20 text-white'
                      : scrolled 
                        ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-100/80' 
                        : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name === 'Sobre Nosotros' && <FiInfo className="inline mr-2" />}
                  {item.name}
                  {location.pathname === item.path && (
                    <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </Link>
              ))}
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/login"
                onClick={() => handleLinkClick('/login')}
                className={`flex items-center px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                  scrolled 
                    ? 'text-blue-700 hover:bg-blue-50' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <FiLogIn className="mr-2" />
                Acceder
              </Link>
              <Link
                to="/join-us"
                onClick={() => handleLinkClick('/join-us')}
                className={`flex items-center px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg ${
                  scrolled 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-white text-blue-800 hover:bg-blue-50'
                }`}
              >
                <FiUser className="mr-2" />
                Unirse
                <FiArrowRight className="ml-2" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-3 rounded-xl focus:outline-none transition-all ${
                  scrolled 
                    ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' 
                    : 'text-white bg-white/20 hover:bg-white/30'
                }`}
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
              isMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="flex flex-col space-y-3 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => handleLinkClick(item.path)}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors duration-200 ${
                    location.pathname === item.path
                      ? scrolled 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-white/20 text-white'
                      : scrolled 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.name === 'Sobre Nosotros' && <FiInfo className="inline mr-2" />}
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link
                  to="/login"
                  onClick={() => handleLinkClick('/login')}
                  className={`flex items-center w-full px-4 py-3 rounded-xl font-medium ${
                    scrolled 
                      ? 'text-blue-700 hover:bg-blue-50' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <FiLogIn className="mr-2" />
                  Acceder
                </Link>
                <Link
                  to="/join-us"
                  onClick={() => handleLinkClick('/join-us')}
                  className={`flex items-center w-full px-4 py-3 rounded-xl font-medium ${
                    scrolled 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-white text-blue-800 hover:bg-blue-50'
                  }`}
                >
                  <FiUser className="mr-2" />
                  Unirse
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-28">
        <Outlet />
      </main>

      {/* Footer moderno */}
      <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Columna izquierda: Contacto */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4 relative pb-2 after:absolute after:left-0 after:bottom-0 after:w-12 after:h-1 after:bg-blue-500">
                Contacto
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1 p-2 bg-blue-600/20 rounded-lg">
                    <FiMail className="text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">Correo electrónico</p>
                    <p className="text-gray-300">info@uejaa.edu</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 p-2 bg-blue-600/20 rounded-lg">
                    <FiPhone className="text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">Teléfono</p>
                    <p className="text-gray-300">+58 123-4567890</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 p-2 bg-blue-600/20 rounded-lg">
                    <FiMapPin className="text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">Dirección</p>
                    <p className="text-gray-300">Av. Principal, Ciudad</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna central: Enlaces rápidos */}
            <div className="md:text-center">
              <h3 className="text-xl font-bold mb-4 relative pb-2 after:absolute after:left-1/2 after:bottom-0 after:-translate-x-1/2 after:w-12 after:h-1 after:bg-blue-500">
                Enlaces Rápidos
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/SobreNosotros" 
                    onClick={() => handleLinkClick('/SobreNosotros')}
                    className="text-gray-300 hover:text-white transition-colors inline-block py-1"
                  >
                    Sobre Nosotros
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/PrivacyPolicy" 
                    onClick={() => handleLinkClick('/PrivacyPolicy')}
                    className="text-gray-300 hover:text-white transition-colors inline-block py-1"
                  >
                    Políticas de Privacidad
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/TermsAndConditions" 
                    onClick={() => handleLinkClick('/TermsAndConditions')}
                    className="text-gray-300 hover:text-white transition-colors inline-block py-1"
                  >
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/preguntas-frecuentes" 
                    onClick={() => handleLinkClick('/preguntas-frecuentes')}
                    className="text-gray-300 hover:text-white transition-colors inline-block py-1"
                  >
                    Preguntas Frecuentes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna derecha: Redes Sociales */}
            <div className="md:text-right">
              <h3 className="text-xl font-bold mb-4 relative pb-2 after:absolute after:right-0 after:bottom-0 after:w-12 after:h-1 after:bg-blue-500">
                Síguenos
              </h3>
              <p className="text-gray-300 mb-6">
                Mantente conectado con nosotros a través de nuestras redes sociales.
              </p>
              <div className="flex md:justify-end space-x-3">
                {[
                  { icon: <FiInstagram size={20} />, color: 'bg-pink-600 hover:bg-pink-700' },
                  { icon: <FiFacebook size={20} />, color: 'bg-blue-600 hover:bg-blue-700' },
                  { icon: <FiTwitter size={20} />, color: 'bg-sky-500 hover:bg-sky-600' },
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className={`p-3 rounded-xl text-white transition-all duration-300 transform hover:-translate-y-1 ${social.color}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-700/50">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
                  JAA
                </div>
                <p className="text-gray-300">
                  © {new Date().getFullYear()} U.E. José Antonio Abreu. Todos los derechos reservados.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-gray-400 text-sm">
                  Diseñado con ❤️ para la educación del futuro
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LayoutPublic;