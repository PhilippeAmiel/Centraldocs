import React from 'react';
import { LogOut, Building, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Request {
  id: string;
  professional: {
    name: string;
    logo?: string;
  };
  type: string;
  createdAt: string;
  progress: number;
  isComplete: boolean;
}

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Example data - would come from your API
  const requests: Request[] = [
    {
      id: `client_${user?.uid || 'unknown'}_1`,
      professional: {
        name: 'Agence Immobilière Dupont',
        logo: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=64'
      },
      type: 'Dossier location',
      createdAt: '2024-03-15',
      progress: 60,
      isComplete: false
    },
    {
      id: `client_${user?.uid || 'unknown'}_2`,
      professional: {
        name: 'Crédit Mutuel',
        logo: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=64'
      },
      type: 'Dossier crédit',
      createdAt: '2024-03-14',
      progress: 30,
      isComplete: false
    }
  ];

  const handleLogout = () => {
    navigate('/client-login');
  };

  const handleOpenRequest = (requestId: string) => {
    navigate(`/client/request/${requestId}`);
  };

  if (!user) {
    navigate('/client-login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-semibold text-blue-900">
                CentralDocs
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Vos demandes de documents
        </h2>
        <p className="text-gray-600 mb-8">
          Voici la liste des professionnels qui vous ont demandé des pièces justificatives.
        </p>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune demande en cours.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {request.professional.logo ? (
                      <img
                        src={request.professional.logo}
                        alt={request.professional.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Building className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.professional.name}
                      </h3>
                      <p className="text-sm text-gray-500">{request.type}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Avancement</span>
                      <span>{request.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${request.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Créé le {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <button 
                      onClick={() => handleOpenRequest(request.id)}
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      Ouvrir
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;