import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  ArrowLeft,
  RefreshCw,
  Download,
  Eye,
  Plus,
  ChevronRight
} from 'lucide-react';
import { doc, getDoc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import NewRequestModal from './NewRequestModal';

interface Document {
  id: string;
  name: string;
  fileName: string;
  status: 'pending' | 'validating' | 'validated' | 'rejected';
  uploadedAt: string;
  downloadURL?: string;
  rejectReason?: string;
  fileSize?: number;
  fileType?: string;
}

interface Request {
  id: string;
  type: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  documentsCount: number;
  pendingDocuments: number;
  documentListName?: string;
  aiEnabled: boolean;
  requestedDocuments?: Array<{
    name: string;
    description?: string;
    required: boolean;
  }>;
}

interface Activity {
  id: string;
  type: 'upload' | 'validation' | 'message' | 'created' | 'request_created';
  description: string;
  date: string;
  icon: React.ReactNode;
}

interface ClientData {
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
  lastUpdated?: string;
  documentsCount: number;
  pendingDocuments: number;
  status: 'active' | 'inactive';
}

const ClientDetails: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'requests' | 'history'>('overview');
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  // Load client data from Firestore
  useEffect(() => {
    const loadClientData = async () => {
      if (!id || !user) {
        setError('ID client manquant ou utilisateur non connecté');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading client data for ID:', id);
        
        const clientRef = doc(db, 'clients', id);
        const clientSnap = await getDoc(clientRef);

        if (!clientSnap.exists()) {
          setError('Client non trouvé');
          setLoading(false);
          return;
        }

        const data = clientSnap.data();
        
        // Verify that the client belongs to the current user
        if (data.createdBy !== user.uid) {
          setError('Vous n\'avez pas accès à ce client');
          setLoading(false);
          return;
        }

        // Transform Firestore data to our ClientData interface
        const clientInfo: ClientData = {
          id: clientSnap.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || {},
          notes: data.notes || '',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString(),
          documentsCount: data.documentsCount || 0,
          pendingDocuments: data.pendingDocuments || 0,
          status: data.status || 'active'
        };

        console.log('Loaded client data:', clientInfo);
        setClientData(clientInfo);
        setError(null);

        // Add initial activity for client creation
        const initialActivity: Activity = {
          id: 'client_created',
          type: 'created',
          description: `Client ${clientInfo.fullName} créé`,
          date: clientInfo.createdAt,
          icon: <User className="w-5 h-5 text-blue-500" />
        };
        setActivities([initialActivity]);

      } catch (error: any) {
        console.error('Error loading client data:', error);
        
        if (error.code === 'permission-denied') {
          setError('Permissions insuffisantes pour accéder à ce client');
        } else if (error.code === 'unavailable') {
          setError('Service temporairement indisponible');
        } else {
          setError('Erreur lors du chargement des données client');
        }
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [id, user]);

  // Load client requests and documents
  useEffect(() => {
    if (!user || !clientData) return;

    const loadClientRequestsAndDocuments = async () => {
      setDocumentsLoading(true);
      
      try {
        console.log('Loading requests for client ID:', clientData.id);
        
        // Query for requests where this user is the professional and the clientId matches
        const requestsQuery = query(
          collection(db, 'requests'),
          where('professionalId', '==', user.uid),
          where('clientId', '==', clientData.id)
        );

        // Set up real-time listener for requests
        const unsubscribe = onSnapshot(
          requestsQuery,
          async (requestsSnapshot) => {
            console.log('Requests snapshot received, size:', requestsSnapshot.size);
            
            const requestsData: Request[] = [];
            const allDocuments: Document[] = [];
            const documentActivities: Activity[] = [];

            // Process each request
            for (const requestDoc of requestsSnapshot.docs) {
              const requestId = requestDoc.id;
              const requestData = requestDoc.data();
              
              console.log('Processing request:', requestId, requestData);

              // Add request to list
              requestsData.push({
                id: requestId,
                type: requestData.type || 'document_request',
                status: requestData.status || 'pending',
                createdAt: requestData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                documentsCount: requestData.documentsCount || 0,
                pendingDocuments: requestData.pendingDocuments || 0,
                documentListName: requestData.documentListName,
                aiEnabled: requestData.aiEnabled || false,
                requestedDocuments: requestData.requestedDocuments || []
              });

              // Add activity for request creation
              documentActivities.push({
                id: `request_${requestId}`,
                type: 'request_created',
                description: `Demande "${requestData.documentListName || 'Documents'}" créée`,
                date: requestData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                icon: <FileText className="w-5 h-5 text-blue-500" />
              });

              try {
                // Get documents for this request
                const documentsSnapshot = await getDocs(
                  collection(db, 'requests', requestId, 'documents')
                );
                
                documentsSnapshot.forEach((docSnap) => {
                  const docData = docSnap.data();
                  
                  const document: Document = {
                    id: docSnap.id,
                    name: docData.fileName || docSnap.id,
                    fileName: docData.fileName || 'Document',
                    status: docData.status || 'pending',
                    uploadedAt: docData.uploadedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                    downloadURL: docData.downloadURL,
                    rejectReason: docData.rejectReason,
                    fileSize: docData.fileSize,
                    fileType: docData.fileType
                  };

                  allDocuments.push(document);

                  // Create activity for this document
                  const activity: Activity = {
                    id: `doc_${docSnap.id}`,
                    type: 'upload',
                    description: `Document "${document.fileName}" téléversé`,
                    date: document.uploadedAt,
                    icon: <FileText className="w-5 h-5 text-blue-500" />
                  };

                  documentActivities.push(activity);

                  // Add validation activity if document is validated/rejected
                  if (document.status === 'validated') {
                    documentActivities.push({
                      id: `val_${docSnap.id}`,
                      type: 'validation',
                      description: `Document "${document.fileName}" validé`,
                      date: document.uploadedAt,
                      icon: <CheckCircle className="w-5 h-5 text-green-500" />
                    });
                  } else if (document.status === 'rejected') {
                    documentActivities.push({
                      id: `rej_${docSnap.id}`,
                      type: 'validation',
                      description: `Document "${document.fileName}" rejeté${document.rejectReason ? ` : ${document.rejectReason}` : ''}`,
                      date: document.uploadedAt,
                      icon: <XCircle className="w-5 h-5 text-red-500" />
                    });
                  }
                });
              } catch (docError) {
                console.error('Error loading documents for request:', requestId, docError);
              }
            }

            // Sort documents by upload date (newest first)
            allDocuments.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
            
            // Sort requests by creation date (newest first)
            requestsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            // Sort activities by date (newest first) and combine with existing activities
            documentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            // Combine with initial activities (client creation)
            const allActivities = [...documentActivities];
            if (clientData) {
              allActivities.push({
                id: 'client_created',
                type: 'created',
                description: `Client ${clientData.fullName} créé`,
                date: clientData.createdAt,
                icon: <User className="w-5 h-5 text-blue-500" />
              });
            }
            
            // Sort all activities by date
            allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            console.log('Loaded requests:', requestsData);
            console.log('Loaded documents:', allDocuments);
            console.log('Generated activities:', allActivities);

            setRequests(requestsData);
            setDocuments(allDocuments);
            setActivities(allActivities);
            setDocumentsLoading(false);
          },
          (error) => {
            console.error('Error in requests listener:', error);
            setDocumentsLoading(false);
          }
        );

        return unsubscribe;

      } catch (error: any) {
        console.error('Error loading requests and documents:', error);
        setDocumentsLoading(false);
      }
    };

    const unsubscribe = loadClientRequestsAndDocuments();
    
    return () => {
      if (unsubscribe) {
        unsubscribe.then(unsub => unsub && unsub());
      }
    };
  }, [user, clientData]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Re-trigger the useEffect by updating a dependency
    window.location.reload();
  };

  const handleRequestCreated = () => {
    console.log('Request created for client:', clientData?.fullName);
    setIsNewRequestModalOpen(false);
    // The real-time listener will automatically update the data
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'validating':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'validated':
        return 'Validé';
      case 'rejected':
        return 'Rejeté';
      case 'validating':
        return 'En validation';
      default:
        return 'En attente';
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'validated':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'validating':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatAddress = (address?: ClientData['address']) => {
    if (!address || !address.street) return 'Adresse non renseignée';
    
    const parts = [
      address.street,
      address.postalCode && address.city ? `${address.postalCode} ${address.city}` : address.city,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des détails du client...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/clients"
          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour aux clients
        </Link>
        
        <div className="bg-red-50 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
              <p className="text-red-700 mb-4">{error}</p>
              
              <button
                onClick={handleRetry}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/clients"
          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour aux clients
        </Link>
        
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Client non trouvé</h3>
          <p className="text-gray-500">Le client demandé n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/clients"
          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour aux clients
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{clientData.fullName}</h1>
            <p className="text-gray-500">
              Client depuis le {new Date(clientData.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <button 
            onClick={() => setIsNewRequestModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Créer une demande
          </button>
        </div>
      </div>

      {/* Client Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-gray-500" />
            </div>
          </div>
          <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center text-gray-500 mb-2">
                <Mail className="w-4 h-4 mr-2" />
                {clientData.email}
              </div>
              {clientData.phone && (
                <div className="flex items-center text-gray-500 mb-2">
                  <Phone className="w-4 h-4 mr-2" />
                  {clientData.phone}
                </div>
              )}
              <div className="text-gray-500 text-sm">
                {formatAddress(clientData.address)}
              </div>
            </div>
            <div>
              <div className="flex items-center text-gray-500 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Dernière activité : {new Date(clientData.lastUpdated || clientData.createdAt).toLocaleDateString('fr-FR')}
              </div>
              <div className="flex items-center text-gray-500">
                <FileText className="w-4 h-4 mr-2" />
                {documents.length} documents ({documents.filter(d => d.status === 'pending' || d.status === 'validating').length} en attente)
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200">
                <Send className="w-4 h-4 mr-2" />
                Envoyer un message
              </button>
            </div>
          </div>
        </div>
        
        {/* Notes section */}
        {clientData.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
            <p className="text-gray-600 text-sm">{clientData.notes}</p>
          </div>
        )}
      </div>

      {/* Requests Summary */}
      {requests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Demandes en cours ({requests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((request) => (
              <Link
                key={request.id}
                to={`/request/${request.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {request.documentListName || 'Documents personnalisés'}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                </div>
                
                <div className="text-sm text-gray-500 mb-3">
                  Créé le {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status === 'completed' ? 'Terminé' : 
                     request.status === 'cancelled' ? 'Annulé' : 'En cours'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {request.documentsCount - request.pendingDocuments}/{request.documentsCount}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${request.documentsCount > 0 ? ((request.documentsCount - request.pendingDocuments) / request.documentsCount) * 100 : 0}%` 
                    }}
                  />
                </div>
                
                {/* Documents list preview */}
                {request.requestedDocuments && request.requestedDocuments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Documents demandés :</p>
                    <div className="space-y-1">
                      {request.requestedDocuments.slice(0, 2).map((doc, index) => (
                        <div key={index} className="flex items-center text-xs text-gray-600">
                          <FileText className="w-3 h-3 mr-1" />
                          <span className="truncate">{doc.name}</span>
                          {doc.required && <span className="text-red-500 ml-1">*</span>}
                        </div>
                      ))}
                      {request.requestedDocuments.length > 2 && (
                        <p className="text-xs text-gray-400">
                          +{request.requestedDocuments.length - 2} autres...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Aperçu' },
            { id: 'requests', label: `Demandes (${requests.length})` },
            { id: 'documents', label: `Documents (${documents.length})` },
            { id: 'history', label: 'Historique' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Documents */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Documents récents
            </h2>
            {documentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">Aucun document</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Ce client n'a pas encore téléversé de documents.
                </p>
                <button 
                  onClick={() => setIsNewRequestModalOpen(true)}
                  className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Créer une demande
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                          {doc.fileSize && ` • ${formatFileSize(doc.fileSize)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(doc.status)}
                      <span className={`ml-2 text-sm ${getStatusColor(doc.status)}`}>
                        {getStatusText(doc.status)}
                      </span>
                    </div>
                  </div>
                ))}
                {documents.length > 3 && (
                  <button
                    onClick={() => setActiveTab('documents')}
                    className="w-full text-center py-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Voir tous les documents ({documents.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Activité récente
            </h2>
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">Aucune activité</h3>
                <p className="text-sm text-gray-500">
                  L'activité apparaîtra ici lorsque le client téléversera des documents.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    {activity.icon}
                    <div>
                      <p className="text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.date).toLocaleDateString('fr-FR')} à {new Date(activity.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
              <p className="text-gray-500 mb-6">
                Aucune demande n'a encore été créée pour ce client.
              </p>
              <button 
                onClick={() => setIsNewRequestModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer une demande
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <Link
                  key={request.id}
                  to={`/request/${request.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.documentListName || 'Documents personnalisés'}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span>Créé le {new Date(request.createdAt).toLocaleDateString('fr-FR')}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status === 'completed' ? 'Terminé' : 
                           request.status === 'cancelled' ? 'Annulé' : 'En cours'}
                        </span>
                        {request.aiEnabled && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            IA activée
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {request.documentsCount - request.pendingDocuments}/{request.documentsCount} documents reçus
                        </span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${request.documentsCount > 0 ? ((request.documentsCount - request.pendingDocuments) / request.documentsCount) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {documentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des documents...</p>
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document</h3>
              <p className="text-gray-500 mb-6">
                Ce client n'a encore téléversé aucun document. Créez une demande de documents pour commencer.
              </p>
              <button 
                onClick={() => setIsNewRequestModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer une demande de documents
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de téléversement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taille
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <span className="text-gray-900 font-medium">{doc.fileName}</span>
                          {doc.fileType && (
                            <span className="ml-2 text-xs text-gray-500 uppercase">
                              {doc.fileType.split('/')[1]}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')} à {new Date(doc.uploadedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {formatFileSize(doc.fileSize) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(doc.status)}
                        <span className={`ml-2 text-sm ${getStatusColor(doc.status)}`}>
                          {getStatusText(doc.status)}
                        </span>
                      </div>
                      {doc.status === 'rejected' && doc.rejectReason && (
                        <p className="text-xs text-red-600 mt-1">
                          {doc.rejectReason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {doc.downloadURL && (
                          <>
                            <button
                              onClick={() => window.open(doc.downloadURL, '_blank')}
                              className="text-blue-600 hover:text-blue-900"
                              title="Voir le document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = doc.downloadURL!;
                                link.download = doc.fileName;
                                link.click();
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Télécharger"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Historique complet des activités
          </h2>
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité</h3>
              <p className="text-gray-500">
                L'historique des activités apparaîtra ici au fur et à mesure des interactions avec ce client.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 border-b border-gray-200 pb-6 last:border-b-0">
                  {activity.icon}
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleDateString('fr-FR')} à {new Date(activity.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Request Modal */}
      <NewRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onRequestCreated={handleRequestCreated}
        preSelectedClient={clientData ? {
          id: clientData.id,
          name: clientData.fullName,
          email: clientData.email,
          phone: clientData.phone
        } : undefined}
      />
    </div>
  );
};

export default ClientDetails;