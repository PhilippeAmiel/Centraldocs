import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="pt-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Collectez et validez les documents</span>
            <span className="block">de vos clients, sans courir après.</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            CentralDocs est une solution tout-en-un, multilingue et sécurisée, pour les professionnels en Europe qui veulent en finir avec les relances, les erreurs et les PDF mal scannés.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <a
                href="#signup"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
              >
                Essayer gratuitement
              </a>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <a
                href="#demo"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
              >
                Voir une démo
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;