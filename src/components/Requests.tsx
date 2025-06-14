import React, { useState } from 'react';
import { Search, Plus, ChevronRight } from 'lucide-react';
import NewRequestModal from './NewRequestModal';

interface Request {
  id: string;
  clientName: string;
  createdAt: string;
  status: 'pending' | 'complete' | 'blocked';
  documentsReceived: number;
  totalDocuments: number;
}

interface RequestsProps {
  onRequestSelect: (requestId: string) => void;
}

const getStatusIcon = (status: Request['status']) => {
  switch (status) {
    case 'pending':
      return '🟡';
    case 'complete':
      return '🟢';
    case 'blocked':
      return '🔴';
    default:
      return '⚪';
  }
};

const getStatusText = (status: Request['status']) => {
  switch (status) {
    case 'pending':
      return 'En cours';
    case 'complete':
      return 'Complet';
    case 'blocked':
      return 'Bloqué';
    default:
      return 'Inconnu';
  }
};

const Requests: React.FC<RequestsProps> = ({ onRequestSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  // Example data - would come from your backend
  const requests: Request[] = [
    {
      id: '1',
      clientName: 'Martin Dubois',
      createdAt: '2024-03-15',
      status: 'pending',
      documentsReceived: 3,
      totalDocuments: 5,
    },
    {
      id: '2',
      clientName: 'Sophie Laurent',
      createdAt: '2024-03-14',
      status: 'complete',
      documentsReceived: 4,
      totalDocuments: 4,
    },
    {
      id: '3',
      clientName: 'Jean Petit',
      createdAt: '2024-03-13',
      status: 'blocked',
      documentsReceived: 2,
      totalDocuments: 6,
    },
  ];

  const filteredRequests = requests.filter(request =>
    request.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRequestCreated = () => {
    // In a real app, this would refresh the requests list
    setIsNewRequestModalOpen(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900">Mes demandes</h3>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setIsNewRequestModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle demande
          </button>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un client ou un dossier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de création
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documents
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request, index) => (
              <tr
                key={request.id}
                className={`
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  hover:bg-gray-100 cursor-pointer transition-colors duration-150
                `}
                onClick={() => onRequestSelect(request.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {request.clientName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-2">{getStatusIcon(request.status)}</span>
                    <span className="text-sm text-gray-900">
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {request.documentsReceived}/{request.totalDocuments}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onRequestCreated={handleRequestCreated}
      />
    </main>
  );
};

export default Requests;