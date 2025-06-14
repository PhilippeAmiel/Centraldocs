import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, FileText, Mail, Phone, ChevronRight, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import NewClientModal from './NewClientModal';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  createdAt: string;
  documentsCount: number;
  pendingDocuments: number;
  status: 'active' | 'inactive';
  createdBy?: string;
}

const Clients: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [fixingPermissions, setFixingPermissions] = useState(false);

  // Helper function to check if error is a permissions error
  const isPermissionError = (error: any) => {
    return error.code === 'permission-denied' || 
           error.message?.includes('Missing or insufficient permissions');
  };

  // Helper function to check if error is a missing index error
  const isMissingIndexError = (error: any) => {
    return error.code === 'failed-precondition' || 
           error.message?.includes('index') ||
           error.message?.includes('composite');
  };

  // Function to fix missing createdBy fields
  const fixMissingCreatedByFields = async () => {
    if (!user) return;

    setFixingPermissions(true);
    try {
      console.log('🔧 Fixing missing createdBy fields...');
      
      // Get all clients without proper filtering (admin query)
      const allClientsSnapshot = await getDocs(collection(db, 'clients'));
      const batch = writeBatch(db);
      let fixedCount = 0;

      allClientsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // If document doesn't have createdBy field, add it
        if (!data.createdBy) {
          const clientRef = doc(db, 'clients', docSnap.id);
          batch.update(clientRef, {
            createdBy: user.uid,
            lastUpdated: new Date()
          });
          fixedCount++;
          console.log(`📝 Adding createdBy to client: ${docSnap.id}`);
        }
      });

      if (fixedCount > 0) {
        await batch.commit();
        console.log(`✅ Fixed ${fixedCount} client documents`);
        alert(`✅ Correction terminée !\n\n${fixedCount} documents clients ont été mis à jour avec le champ 'createdBy'.\n\nVeuillez actualiser la page.`);
      } else {
        console.log('✅ All client documents already have createdBy field');
        alert('✅ Tous les documents clients ont déjà le champ "createdBy" requis.');
      }
      
    } catch (error: any) {
      console.error('❌ Error fixing createdBy fields:', error);
      alert(`❌ Erreur lors de la correction: ${error.message}\n\nVeuillez contacter le support technique.`);
    } finally {
      setFixingPermissions(false);
    }
  };

  // Function to load clients with proper error handling
  const loadClients = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('Loading clients for user:', user.uid);
    setError(null);

    try {
      // Simple query without orderBy to avoid composite index requirement
      const clientsQuery = query(
        collection(db, 'clients'),
        where('createdBy', '==', user.uid)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        clientsQuery,
        (snapshot) => {
          console.log('Clients snapshot received, size:', snapshot.size);
          
          const clientsData: Client[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Ensure the document has the required fields and belongs to current user
            if (data.createdBy === user.uid) {
              clientsData.push({
                id: doc.id,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || {},
                notes: data.notes || '',
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                documentsCount: data.documentsCount || 0,
                pendingDocuments: data.pendingDocuments || 0,
                status: data.status || 'active',
                createdBy: data.createdBy
              } as Client);
            }
          });

          // Sort by createdAt in descending order (newest first) in JavaScript
          clientsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          console.log('Processed clients data:', clientsData);
          setClients(clientsData);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Error in real-time listener:', error);
          
          if (isPermissionError(error)) {
            setError(`Erreur de permissions détectée. Cela peut être dû à des documents clients sans le champ 'createdBy' requis.`);
          } else if (isMissingIndexError(error)) {
            setError(`Index Firestore manquant. Veuillez créer l'index composite requis pour la collection 'clients' sur le champ 'createdBy'.`);
          } else if (error.code === 'unavailable') {
            setError('Service Firestore temporairement indisponible. Veuillez réessayer dans quelques instants.');
          } else {
            setError(`Erreur lors du chargement: ${error.message}`);
          }
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error: any) {
      console.error('Error setting up clients listener:', error);
      
      if (isPermissionError(error)) {
        setError(`Erreur de permissions. Vérifiez que tous vos documents clients ont le champ 'createdBy' requis.`);
      } else if (isMissingIndexError(error)) {
        setError(`Index Firestore manquant. Un index composite est requis pour la collection 'clients'.`);
      } else {
        setError('Erreur lors de l\'initialisation du chargement des clients');
      }
      setLoading(false);
    }
  };

  // Load clients on component mount
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      unsubscribe = await loadClients();
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        console.log('Cleaning up clients listener');
        unsubscribe();
      }
    };
  }, [user]);

  const filteredClients = clients.filter(client =>
    client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.phone && client.phone.includes(searchQuery))
  );

  const handleClientCreated = (newClient: Client) => {
    console.log('New client created:', newClient);
    // The real-time listener will automatically update the list
    // But we can also add it immediately for better UX
    setClients(prev => [newClient, ...prev]);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadClients();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des clients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isPermissionIssue = error.includes('permissions') || error.includes('createdBy');
    const isIndexIssue = error.includes('Index') || error.includes('index') || error.includes('composite');

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                {isPermissionIssue ? '🔒 Erreur de permissions' : 
                 isIndexIssue ? '📊 Index Firestore manquant' : 
                 'Erreur de chargement'}
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              
              {isPermissionIssue && (
                <div className="bg-red-100 rounded-md p-4 mb-4">
                  <h4 className="font-medium text-red-800 mb-2">🔧 Solution recommandée :</h4>
                  <p className="text-red-700 text-sm mb-3">
                    Certains documents clients n'ont pas le champ 'createdBy' requis. 
                    Cliquez sur le bouton ci-dessous pour les corriger automatiquement.
                  </p>
                  <button
                    onClick={fixMissingCreatedByFields}
                    disabled={fixingPermissions}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fixingPermissions ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Correction en cours...
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4 mr-2" />
                        Corriger les permissions
                      </>
                    )}
                  </button>
                </div>
              )}

              {isIndexIssue && (
                <div className="bg-red-100 rounded-md p-4 mb-4">
                  <h4 className="font-medium text-red-800 mb-2">📊 Index Firestore requis :</h4>
                  <p className="text-red-700 text-sm mb-3">
                    Un index composite est requis pour la collection 'clients'. 
                    Consultez la console Firebase pour créer l'index automatiquement.
                  </p>
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
                    <strong>Collection :</strong> clients<br />
                    <strong>Champs :</strong> createdBy (Ascending), __name__ (Ascending)
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={handleRetry}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </button>
                
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                >
                  Ouvrir Firebase Console
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos clients et leurs documents ({clients.length} client{clients.length !== 1 ? 's' : ''})
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau client
          </button>
          
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            />
          </div>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client</h3>
          <p className="text-gray-500 mb-6">
            Commencez par ajouter votre premier client pour gérer ses documents.
          </p>
          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un client
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'ajout
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {client.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {client.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="w-4 h-4 mr-2" />
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-2" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {client.documentsCount} documents
                      </span>
                      {client.pendingDocuments > 0 && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {client.pendingDocuments} en attente
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/client/${client.id}`}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      Voir détails
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredClients.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun résultat</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucun client ne correspond à votre recherche "{searchQuery}".
              </p>
            </div>
          )}
        </div>
      )}

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
};

export default Clients;