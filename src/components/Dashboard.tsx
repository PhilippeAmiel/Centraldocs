import React from 'react';
import { Users, FileText, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Document {
  id: string;
  name: string;
  clientName: string;
  status: 'pending' | 'validated';
  createdAt: string;
}

const Dashboard: React.FC = () => {
  // Ces données viendraient normalement de votre backend
  const stats = {
    clients: 0,
    documentLists: 3,
    pendingDocuments: 0,
    validatedDocuments: 0
  };

  const recentClients: Client[] = [];
  const recentDocuments: Document[] = [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Tableau de bord
      </h1>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/clients"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.clients}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-blue-600">Voir tous les clients</p>
        </Link>

        <Link
          to="/lists"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Listes de documents</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.documentLists}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-blue-600">Voir toutes les listes</p>
        </Link>

        <Link
          to="/documents/pending"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Documents en attente</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingDocuments}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-blue-600">Voir les documents en attente</p>
        </Link>

        <Link
          to="/documents/validated"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Documents validés</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.validatedDocuments}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-blue-600">Voir les documents validés</p>
        </Link>
      </div>

      {/* Sections récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clients récents */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Clients récents</h2>
            <Link to="/clients" className="text-sm text-blue-600 hover:text-blue-800">
              Voir tous
            </Link>
          </div>

          {recentClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun client pour le moment
            </div>
          ) : (
            <div className="space-y-4">
              {recentClients.map(client => (
                <div key={client.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents récents */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Documents récents</h2>
            <Link to="/documents" className="text-sm text-blue-600 hover:text-blue-800">
              Voir tous
            </Link>
          </div>

          {recentDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun document pour le moment
            </div>
          ) : (
            <div className="space-y-4">
              {recentDocuments.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">Client : {doc.clientName}</p>
                  </div>
                  <div className="flex items-center">
                    {doc.status === 'validated' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Validé
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        En attente
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;