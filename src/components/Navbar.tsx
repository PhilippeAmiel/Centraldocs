import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-blue-900 hover:text-blue-700 transition-colors duration-200">
              CentralDocs
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <a href="#features" className="text-blue-900 hover:text-blue-600 transition-colors duration-200">
              Fonctionnalités
            </a>
            <a href="#pricing" className="text-blue-900 hover:text-blue-600 transition-colors duration-200">
              Tarifs
            </a>
            <a href="#about" className="text-blue-900 hover:text-blue-600 transition-colors duration-200">
              À propos
            </a>
            <a href="/dashboard" className="text-blue-900 hover:text-blue-600 transition-colors duration-200">
              Connexion
            </a>
            <a
              href="#signup"
              className="ml-4 inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 transition-colors duration-200"
            >
              Essayer gratuitement
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-900 hover:text-blue-600 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          <a
            href="#features"
            className="block px-3 py-2 rounded-md text-base font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
          >
            Fonctionnalités
          </a>
          <a
            href="#pricing"
            className="block px-3 py-2 rounded-md text-base font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
          >
            Tarifs
          </a>
          <a
            href="#about"
            className="block px-3 py-2 rounded-md text-base font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
          >
            À propos
          </a>
          <a
            href="/dashboard"
            className="block px-3 py-2 rounded-md text-base font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
          >
            Connexion
          </a>
          <a
            href="#signup"
            className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors duration-200"
          >
            Essayer gratuitement
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;