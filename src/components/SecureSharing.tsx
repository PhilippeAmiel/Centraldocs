import React, { useState } from 'react';
import { Share2, Clock, Eye, XCircle, HelpCircle, Bell } from 'lucide-react';
import ShareRequestModal from './ShareRequestModal';

interface SharedFolder {
  id: string;
  name: string;
  shareDate: string;
  status: 'actif' | 'expire';
  views: number;
}

interface AccessLogEntry {
  id: string;
  date: string;
  action: string;
  user: string;
}

const SecureSharing: React.FC = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Example data - would come from your API
  const sharedFolders: SharedFolder[] = [
    {
      id: '1',
      name: 'Dossier Mme Dupont (Location)',
      shareDate: '15/06/2025',
      status: 'actif',
      views: 3
    },
    {
      id: '2',
      name: 'Dossier M. Martin (Achat)',
      shareDate: '10/06/2025',
      status: 'expire',
      views: 7
    }
  ];

  const accessLog: AccessLogEntry[] = [
    {
      id: '1',
      date: '15/06/2025 – 14:32',
      action: 'Lien généré pour "Dossier Mme Dupont"',
      user: 'Marie L.'
    },
    {
      id: '2',
      date: '16/06/2025 – 09:12',
      action: 'Lien consulté (par notaire)',
      user: 'Notaire Durand'
    },
    {
      id: '3',
      date: '17/06/2025 – 18:03',
      action: 'Lien expiré automatiquement',
      user: 'Système'
    },
    {
      id: '4',
      date: '18/06/2025 – 11:45',
      action: 'Lien révoqué manuellement',
      user: 'Marie L.'
    },
    {
      id: '5',
      date: '19/06/2025 – 08:20',
      action: 'Tentative d\'accès après expiration (refusée)',
      user: 'Notaire Durand'
    }
  ];

  const notifications = [
    '📩 Nouveau visiteur sur le lien de partage "Dossier M. Martin"',
    '⏰ Le lien du "Dossier Mme Dupont" expirera dans 2 jours',
    '🔔 3 nouveaux accès enregistrés aujourd\'hui'
  ];

  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(`https://centraldocs.io/share/${id}`);
  };

  const handleRevoke = (id: string) => {
    console.log('Revoking share:', id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Partage sécurisé
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Partagez en toute confiance un dossier client avec un notaire, un banquier ou tout autre professionnel, 
          sans qu'il ait besoin de créer un compte. Sélectionnez simplement les documents à partager, définissez 
          une date d'expiration et, si vous le souhaitez, protégez le lien par un mot de passe.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Vos dossiers déjà partagés
          </h2>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
          >
            <Share2 className="w-5 h-5 mr-2" />
            + Partager un dossier
          </button>
        </div>

        {sharedFolders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Aucun dossier partagé pour le moment. Cliquez sur '+ Partager un dossier' pour créer un lien sécurisé.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dossier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de partage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vues
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sharedFolders.map((folder) => (
                  <tr key={folder.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {folder.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {folder.shareDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-2">
                          {folder.status === 'actif' ? '🟢' : '🔴'}
                        </span>
                        <span className="text-sm text-gray-900">
                          {folder.status === 'actif' ? 'Actif' : 'Expiré'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="w-4 h-4 mr-1" />
                        {folder.views}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleCopyLink(folder.id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Copier le lien
                      </button>
                      <button
                        onClick={() => handleRevoke(folder.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Révoquer l'accès
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Historique des partages
            </h3>
            <a href="#history" className="text-blue-600 hover:text-blue-800 text-sm">
              Voir détails
            </a>
          </div>
          <div className="space-y-4">
            {accessLog.map((entry) => (
              <div key={entry.id} className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-900">{entry.action}</p>
                  <p className="text-xs text-gray-500">
                    {entry.date} - {entry.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications récentes
            </h3>
            <a href="#notifications" className="text-blue-600 hover:text-blue-800 text-sm">
              Voir détails
            </a>
          </div>
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Bell className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-900">{notification}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <HelpCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Besoin d'aide ?
            </h2>
            <div className="space-y-2">
              <a href="#faq" className="text-blue-600 hover:text-blue-800 block">
                FAQ Partage sécurisé
              </a>
              <p className="text-gray-600">
                Contactez le support : support@centraldocs.io
              </p>
            </div>
          </div>
        </div>
      </div>

      <ShareRequestModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documents={[
          { id: '1', name: 'Carte d\'identité' },
          { id: '2', name: 'Justificatif de domicile' }
        ]}
      />
    </div>
  );
};

export default SecureSharing;