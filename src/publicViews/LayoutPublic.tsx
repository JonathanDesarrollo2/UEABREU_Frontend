import { Outlet } from 'react-router-dom';
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
    
    // Si es el enlace de Inicio y ya estamos en la página principal, hacer scroll al top
    if (path === '/' && location.pathname === '/') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Redes sociales con sus enlaces específicos
  const socialLinks = [
    { 
      icon: <FiInstagram size={20} />, 
      color: 'bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950', 
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
            ? 'bg-white/95 shadow-lg py-3 backdrop-blur-md border-b border-slate-200'
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
              <div className="w-24 h-24 flex items-center justify-center transition-all duration-300 group-hover:scale-105 overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="U.E. José Antonio Abreu" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="hidden sm:block">
                <h1 className={`font-bold text-xl leading-tight transition-colors ${scrolled ? 'text-slate-800' : 'text-slate-800'}`}>
                  U.E. José Antonio Abreu
                </h1>
                <p className={`text-sm transition-colors ${scrolled ? 'text-slate-600' : 'text-slate-600'}`}>
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
                        ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                      : scrolled 
                        ? 'text-slate-700 hover:text-blue-800 hover:bg-slate-50/80' 
                        : 'text-slate-700 hover:text-blue-800 hover:bg-slate-50/80'
                  }`}
                >
                  {item.name === 'Sobre Nosotros' && <FiInfo className="inline mr-2" />}
                  {item.name}
                  {location.pathname === item.path && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-blue-800 rounded-full"></span>
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
                    ? 'text-slate-700 border-slate-300 hover:border-blue-700 hover:text-blue-800' 
                    : 'text-slate-700 border-slate-300 hover:border-blue-700 hover:text-blue-800'
                }`}
              >
                <FiLogIn className="mr-2" />
                Acceder
              </Link>
              <Link
                to="/join-us"
                onClick={() => handleLinkClick('/join-us')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg bg-gradient-to-r from-blue-800 to-blue-900 text-white hover:from-blue-900 hover:to-blue-950 transform hover:-translate-y-0.5`}
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
                    ? 'text-slate-700 border-slate-300 bg-white hover:bg-slate-50' 
                    : 'text-slate-700 border-slate-300 bg-white hover:bg-slate-50'
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
                        ? 'bg-blue-50 text-blue-800 border-blue-200' 
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                      : scrolled 
                        ? 'text-slate-700 border-slate-200 hover:bg-slate-50' 
                        : 'text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item.name === 'Sobre Nosotros' && <FiInfo className="inline mr-2" />}
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <Link
                  to="/login"
                  onClick={() => handleLinkClick('/login')}
                  className={`flex items-center w-full px-4 py-3 rounded-xl font-medium border border-slate-300 text-slate-700 hover:border-blue-700 hover:text-blue-800`}
                >
                  <FiLogIn className="mr-2" />
                  Acceder
                </Link>
                <Link
                  to="/join-us"
                  onClick={() => handleLinkClick('/join-us')}
                  className={`flex items-center w-full px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-blue-800 to-blue-900 text-white hover:from-blue-900 hover:to-blue-950`}
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
      <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Columna izquierda: Contacto */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/logo.png" 
                    alt="U.E. José Antonio Abreu" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">U.E. José Antonio Abreu</h3>
                  <p className="text-slate-300 text-sm">Formando líderes del mañana Produccion</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1 p-2 bg-blue-700/30 rounded-lg border border-blue-600/30">
                    <FiMail className="text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-slate-200">Correo electrónico</p>
                    <p className="text-slate-300">uejantonioabre@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 p-2 bg-blue-700/30 rounded-lg border border-blue-600/30">
                    <FiPhone className="text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-slate-200">Teléfono</p>
                    <p className="text-slate-300">: 0412-341.87.73</p>
                    <p className="text-slate-300">: 0412-208.84.51</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 p-2 bg-blue-700/30 rounded-lg border border-blue-600/30">
                    <FiMapPin className="text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-slate-200">Dirección</p>
                    <p className="text-slate-300">Av. Universidad, Naguanagua</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna central: Enlaces rápidos */}
            <div className="md:text-center">
              <h3 className="text-xl font-bold mb-6 relative pb-3 after:absolute after:left-1/2 after:bottom-0 after:-translate-x-1/2 after:w-16 after:h-0.5 after:bg-blue-700">
                Enlaces Rápidos
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link 
                    to="/SobreNosotros" 
                    onClick={() => handleLinkClick('/SobreNosotros')}
                    className="text-slate-300 hover:text-white transition-colors inline-block py-2 hover:translate-x-2 duration-300"
                  >
                    Sobre Nosotros
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/PrivacyPolicy" 
                    onClick={() => handleLinkClick('/PrivacyPolicy')}
                    className="text-slate-300 hover:text-white transition-colors inline-block py-2 hover:translate-x-2 duration-300"
                  >
                    Políticas de Privacidad
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/TermsAndConditions" 
                    onClick={() => handleLinkClick('/TermsAndConditions')}
                    className="text-slate-300 hover:text-white transition-colors inline-block py-2 hover:translate-x-2 duration-300"
                  >
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/preguntas-frecuentes" 
                    onClick={() => handleLinkClick('/preguntas-frecuentes')}
                    className="text-slate-300 hover:text-white transition-colors inline-block py-2 hover:translate-x-2 duration-300"
                  >
                    Preguntas Frecuentes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna derecha: Redes Sociales */}
            <div className="md:text-right">
              <h3 className="text-xl font-bold mb-6 relative pb-3 after:absolute after:right-0 after:bottom-0 after:w-16 after:h-0.5 after:bg-blue-700">
                Síguenos
              </h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
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

          <div className="mt-16 pt-8 border-t border-slate-700/50">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/logo.png" 
                    alt="U.E. José Antonio Abreu" 
                    className="w-full h-full object-contain"
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
                  <p className="text-slate-300">
                    © {new Date().getFullYear()} U.E. José Antonio Abreu
                  </p>
                  <p className="text-slate-400 text-sm">
                    Todos los derechos reservados
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-slate-400 text-sm">
                  Diseñado con ❤️ para la educación del futuro
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LayoutPublic;
