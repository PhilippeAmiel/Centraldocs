import React from 'react';
import { Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "CentralDocs m'a fait gagner 1h par dossier locataire. Et plus de documents oubliés !",
      author: "Julie",
      role: "agente immobilière à Lyon"
    },
    {
      quote: "Mes clients sont bluffés par la simplicité. Je gère mes demandes en 5 minutes.",
      author: "Karim",
      role: "courtier à Bruxelles"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-16">
          Ils ont adopté CentralDocs
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-8 relative">
              <Quote className="absolute top-6 left-6 w-8 h-8 text-blue-200" />
              <blockquote className="relative">
                <p className="text-xl text-gray-800 font-medium mb-4 mt-4 ml-8">
                  "{testimonial.quote}"
                </p>
                <footer className="mt-4">
                  <p className="text-base font-medium text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500">
                    {testimonial.role}
                  </p>
                </footer>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;