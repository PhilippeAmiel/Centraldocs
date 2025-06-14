import React from 'react';
import { Settings, Upload, Bell, Bot, CheckCircle } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Settings className="w-12 h-12 text-blue-600" />,
      title: "Créez votre demande",
      description: "Choisissez une checklist ou créez la vôtre. Invitez vos clients via un lien sécurisé."
    },
    {
      icon: <Upload className="w-12 h-12 text-blue-600" />,
      title: "Upload par le client",
      description: "Le client voit sa liste, téléverse ses fichiers, et suit l'avancement de son dossier."
    },
    {
      icon: <Bell className="w-12 h-12 text-blue-600" />,
      title: "Vous êtes notifié",
      description: "À chaque document reçu, vous êtes alerté. Vous voyez ce qu'il manque."
    },
    {
      icon: <Bot className="w-12 h-12 text-blue-600" />,
      title: "Validez avec l'IA",
      description: "L'IA lit les documents, extrait les données, et vous assiste dans la validation."
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-blue-600" />,
      title: "Dossier complet",
      description: "Vous finalisez le dossier, le client est notifié. Propre et rapide."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Comment ça marche ?
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Simplifiez vos échanges documentaires en quelques étapes, avec l'aide de l'IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4 p-6 rounded-lg transition-all duration-200 hover:bg-gray-50">
              <div className="flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;