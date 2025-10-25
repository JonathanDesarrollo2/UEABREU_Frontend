import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogIn, FiMail, FiPhone, FiMapPin, FiInstagram, FiArrowRight, FiInfo } from 'react-icons/fi';
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

  // Redes sociales con sus enlaces específicos
  const socialLinks = [
    { 
      icon: <FiInstagram size={20} />, 
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600', 
      url: 'https://www.instagram.com/u.e.joseantonioabreu/',
      label: 'Instagram'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Componente para scroll automático al cambiar rutas */}
      <ScrollToTop />
      
      {/* Navbar elegante y moderna */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 shadow-lg py-3 backdrop-blur-md border-b border-gray-100'
            : 'bg-white/80 py-6 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-4 group"
              onClick={() => handleLinkClick('/')}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105 overflow-hidden ${
                scrolled ? 'border border-gray-200' : 'border border-gray-200'
              }`}>
                <img 
                  src="/logo.png" 
                  alt="U.E. José Antonio Abreu" 
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="hidden sm:block">
                <h1 className={`font-bold text-xl leading-tight transition-colors ${scrolled ? 'text-gray-800' : 'text-gray-800'}`}>
                  U.E. José Antonio Abreu
                </h1>
                <p className={`text-sm transition-colors ${scrolled ? 'text-gray-600' : 'text-gray-600'}`}>
                  Formando líderes del mañana
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => handleLinkClick(item.path)}
                  className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    location.pathname === item.path
                      ? scrolled 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : scrolled 
                        ? 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50/80' 
                        : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50/80'
                  }`}
                >
                  {item.name === 'Sobre Nosotros' && <FiInfo className="inline mr-2" />}
                  {item.name}
                  {location.pathname === item.path && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-emerald-500 rounded-full"></span>
                  )}
                </Link>
              ))}
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/login"
                onClick={() => handleLinkClick('/login')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 border ${
                  scrolled 
                    ? 'text-gray-700 border-gray-300 hover:border-emerald-400 hover:text-emerald-600' 
                    : 'text-gray-700 border-gray-300 hover:border-emerald-400 hover:text-emerald-600'
                }`}
              >
                <FiLogIn className="mr-2" />
                Acceder
              </Link>
              <Link
                to="/join-us"
                onClick={() => handleLinkClick('/join-us')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transform hover:-translate-y-0.5`}
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
                className={`p-3 rounded-xl focus:outline-none transition-all border ${
                  scrolled 
                    ? 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50' 
                    : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'
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
                  className={`px-4 py-3 rounded-xl font-medium transition-colors duration-200 border ${
                    location.pathname === item.path
                      ? scrolled 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : scrolled 
                        ? 'text-gray-700 border-gray-200 hover:bg-gray-50' 
                        : 'text-gray-700 border-gray-200 hover:bg-gray-50'
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
                  className={`flex items-center w-full px-4 py-3 rounded-xl font-medium border border-gray-300 text-gray-700 hover:border-emerald-400 hover:text-emerald-600`}
                >
                  <FiLogIn className="mr-2" />
                  Acceder
                </Link>
                <Link
                  to="/join-us"
                  onClick={() => handleLinkClick('/join-us')}
                  className={`flex items-center w-full px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700`}
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
      <main className="flex-grow pt-32">
        <Outlet />
      </main>

      {/* Footer elegante */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Columna izquierda: Contacto */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                  <img 
                    src="/logo.png" 
                    alt="U.E. José Antonio Abreu" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">U.E. José Antonio Abreu</h3>
                  <p className="text-gray-300 text-sm">Formando líderes del mañana</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1 p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                    <FiMail className="text-emerald-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-200">Correo electrónico</p>
                    <p className="text-gray-300">uejantonioabre@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                    <FiPhone className="text-emerald-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-200">Teléfono</p>
                    <p className="text-gray-300">+58 412-208.84.51</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                    <FiMapPin className="text-emerald-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-200">Dirección</p>
                    <p className="text-gray-300">Av. Universidad, Naguanagua</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna central: Enlaces rápidos */}
            <div className="md:text-center">
              <h3 className="text-xl font-bold mb-6 relative pb-3 after:absolute after:left-1/2 after:bottom-0 after:-translate-x-1/2 after:w-16 after:h-0.5 after:bg-emerald-500">
                Enlaces Rápidos
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link 
                    to="/SobreNosotros" 
                    onClick={() => handleLinkClick('/SobreNosotros')}
                    className="text-gray-300 hover:text-white transition-colors inline-block py-2 hover:translate-x-2 duration-300"
                  >
                    Sobre Nosotros
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/PrivacyPolicy" 
                    onClick={() => handleLinkClick('/PrivacyPolicy')}
                    className="text-gray-300 hover:text-white transition-colors inline-block py-2 hover:translate-x-2 duration-300"
                  >
                    Políticas de Privacidad
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/TermsAndConditions" 
                    onClick={() => handleLinkClick('/TermsAndConditions')}
                    className="text-gray-300 hover:text-white transition-colors inline-block py-2 hover:translate-x-2 duration-300"
                  >
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/preguntas-frecuentes" 
                    onClick={() => handleLinkClick('/preguntas-frecuentes')}
                    className="text-gray-300 hover:text-white transition-colors inline-block py-2 hover:translate-x-2 duration-300"
                  >
                    Preguntas Frecuentes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna derecha: Redes Sociales */}
            <div className="md:text-right">
              <h3 className="text-xl font-bold mb-6 relative pb-3 after:absolute after:right-0 after:bottom-0 after:w-16 after:h-0.5 after:bg-emerald-500">
                Síguenos
              </h3>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Mantente conectado con nosotros a través de nuestras redes sociales y descubre todo lo que tenemos para ofrecerte.
              </p>
              <div className="flex md:justify-end space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-4 rounded-xl text-white transition-all duration-300 transform hover:-translate-y-1 shadow-lg ${social.color}`}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-700/50">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                  <img 
                    src="/logo.png" 
                    alt="U.E. José Antonio Abreu" 
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-white font-bold text-sm">JAA</span>';
                      }
                    }}
                  />
                </div>
                <div>
                  <p className="text-gray-300">
                    © {new Date().getFullYear()} U.E. José Antonio Abreu
                  </p>
                  <p className="text-gray-400 text-sm">
                    Todos los derechos reservados
                  </p>
                </div>
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