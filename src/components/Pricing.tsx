import React from 'react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Basic',
      price: '19€',
      period: '/mois',
      description: 'Pour les indépendants',
      buttonText: "S'abonner",
      buttonStyle: 'bg-blue-600 hover:bg-blue-500',
    },
    {
      name: 'Pro',
      price: '49€',
      period: '/mois',
      description: 'Pour les PME avec collaborateurs',
      buttonText: "S'abonner",
      buttonStyle: 'bg-blue-600 hover:bg-blue-500',
      featured: true,
    },
    {
      name: 'Sur-mesure',
      price: 'Dès 99€',
      period: '/mois',
      description: 'Pour cabinets, réseaux, franchises',
      buttonText: 'Contactez-nous',
      buttonStyle: 'bg-gray-800 hover:bg-gray-700',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Tarifs simples et transparents
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            15 jours d'essai gratuit pour tous nos forfaits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105 ${
                plan.featured ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  {plan.name}
                </h3>
                <div className="text-center mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-center text-gray-500 mb-8">
                  {plan.description}
                </p>
                <div className="flex justify-center">
                  <a
                    href="#essai"
                    className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors duration-200 w-full ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Tous les plans incluent : portail client multilingue, quota IA, support email.
        </p>
      </div>
    </section>
  );
};

export default Pricing;