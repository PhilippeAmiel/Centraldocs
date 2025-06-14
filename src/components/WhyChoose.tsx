import React from 'react';
import { Clock, Bot, Globe, Lock, Link2 } from 'lucide-react';

const WhyChoose: React.FC = () => {
  const benefits = [
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      text: "Gagnez jusqu'à 70 % de temps sur la collecte documentaire"
    },
    {
      icon: <Bot className="w-8 h-8 text-blue-600" />,
      text: "Laissez l'IA vérifier vos documents à votre place"
    },
    {
      icon: <Globe className="w-8 h-8 text-blue-600" />,
      text: "Multilingue : français, allemand, espagnol, italien"
    },
    {
      icon: <Lock className="w-8 h-8 text-blue-600" />,
      text: "Données 100 % hébergées en Europe, conforme RGPD"
    },
    {
      icon: <Link2 className="w-8 h-8 text-blue-600" />,
      text: "Connectez CentralDocs à vos outils : API, Zapier, Make"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-16">
          Pourquoi choisir CentralDocs ?
        </h2>

        <div className="space-y-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center space-x-6 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex-shrink-0 bg-white p-3 rounded-lg shadow-sm">
                {benefit.icon}
              </div>
              <p className="text-xl text-gray-800">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;