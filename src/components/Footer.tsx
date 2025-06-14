import React from 'react';

const Footer: React.FC = () => {
  const links = [
    { name: 'À propos', href: '#about' },
    { name: 'FAQ', href: '#faq' },
    { name: 'RGPD', href: '#rgpd' },
    { name: 'Connexion Pro', href: '/login' },
    { name: 'Connexion Client', href: '/client-login' },
  ];

  return (
    <footer className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="text-2xl font-bold text-blue-900">
            CentralDocs
          </div>
          
          <nav className="flex flex-wrap justify-center gap-8">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} CentralDocs. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;