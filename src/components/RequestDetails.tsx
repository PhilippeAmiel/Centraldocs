import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  RefreshCw, 
  Send, 
  Check, 
  X, 
  Share2, 
  Phone, 
  Mail,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  ArrowLeft,
  FileText,
  Bot,
  Calendar,
  Eye,
  Download,
  MailIcon,
  Info
} from 'lucide-react';
import { doc, getDoc, collection, onSnapshot, query, orderBy, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import ShareRequestModal from './ShareRequestModal';
import SendEmailModal from './SendEmailModal';
import { EmailService } from '../services/emailService';

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

interface RequestData {
  id: string;
  clientId: string;
  professionalId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  type: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  documentListName?: string;
  aiEnabled: boolean;
  validationRules?: string;
  requestedDocuments: Array<{
    name: string;
    description?: string;
    required: boolean;
  }>;
  documentsCount: number;
  pendingDocuments: number;
  emailSent?: boolean;
  emailSentAt?: string;
  clientCredentials?: {
    email: string;
    password: string;
    generatedAt: string;
  };
}

interface Activity {
  id: string;
  date: string;
  action: string;
  actor: string;
  icon: React.ReactNode;
}

const RequestDetails: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [note, setNote] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showProductionInfo, setShowProductionInfo] = useState(false);

  // Load request data
  useEffect(() => {
    const loadRequestData = async () => {
      if (!id || !user) {
        setError('ID de demande manquant ou utilisateur non connecté');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading request data for ID:', id);
        
        const requestRef = doc(db, 'requests', id);
        const requestSnap = await getDoc(requestRef);

        if (!requestSnap.exists()) {
          setError('Demande non trouvée');
          setLoading(false);
          return;
        }

        const data = requestSnap.data();
        
        // Verify that the user has access to this request
        if (data.createdBy !== user.uid && data.professionalId !== user.uid && data.clientId !== user.uid) {
          setError('Vous n\'avez pas accès à cette demande');
          setLoading(false);
          return;
        }

        // Transform Firestore data to our RequestData interface
        const requestInfo: RequestData = {
          id: requestSnap.id,
          clientId: data.clientId || '',
          professionalId: data.professionalId || '',
          clientName: data.clientName || 'Client',
          clientEmail: data.clientEmail || '',
          clientPhone: data.clientPhone || '',
          type: data.type || 'document_request',
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          documentListName: data.documentListName || '',
          aiEnabled: data.aiEnabled || false,
          validationRules: data.validationRules || '',
          requestedDocuments: data.requestedDocuments || [],
          documentsCount: data.documentsCount || 0,
          pendingDocuments: data.pendingDocuments || 0,
          emailSent: data.emailSent || false,
          emailSentAt: data.emailSentAt?.toDate?.()?.toISOString(),
          clientCredentials: data.clientCredentials || null
        };

        console.log('Loaded request data:', requestInfo);
        setRequestData(requestInfo);
        setError(null);

        // Add initial activity for request creation
        const initialActivity: Activity = {
          id: 'request_created',
          date: requestInfo.createdAt,
          action: `Demande "${requestInfo.documentListName || 'Documents'}" créée pour ${requestInfo.clientName}`,
          actor: 'Système',
          icon: <FileText className="w-5 h-5 text-blue-500" />
        };
        setActivities([initialActivity]);

      } catch (error: any) {
        console.error('Error loading request data:', error);
        
        if (error.code === 'permission-denied') {
          setError('Permissions insuffisantes pour accéder à cette demande');
        } else if (error.code === 'unavailable') {
          setError('Service temporairement indisponible');
        } else {
          setError('Erreur lors du chargement des données de la demande');
        }
      } finally {
        setLoading(false);
      }
    };

    loadRequestData();
  }, [id, user]);

  // Load documents for this request
  useEffect(() => {
    if (!id || !requestData) return;

    console.log('Setting up documents listener for request:', id);

    try {
      const documentsQuery = query(
        collection(db, 'requests', id, 'documents'),
        orderBy('uploadedAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        documentsQuery,
        (snapshot) => {
          console.log('Documents snapshot received, size:', snapshot.size);
          
          const documentsData: Document[] = [];
          const documentActivities: Activity[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data();
            
            const document: Document = {
              id: doc.id,
              name: data.fileName || doc.id,
              fileName: data.fileName || 'Document',
              status: data.status || 'pending',
              uploadedAt: data.uploadedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              downloadURL: data.downloadURL,
              rejectReason: data.rejectReason,
              fileSize: data.fileSize,
              fileType: data.fileType
            };

            documentsData.push(document);

            // Create activity for this document
            documentActivities.push({
              id: `doc_${doc.id}`,
              date: document.uploadedAt,
              action: `Document "${document.fileName}" téléversé par ${requestData.clientName}`,
              actor: requestData.clientName,
              icon: <FileText className="w-5 h-5 text-blue-500" />
            });

            // Add validation activity if document is validated/rejected
            if (document.status === 'validated') {
              documentActivities.push({
                id: `val_${doc.id}`,
                date: document.uploadedAt,
                action: `Document "${document.fileName}" validé`,
                actor: 'Professionnel',
                icon: <CheckCircle className="w-5 h-5 text-green-500" />
              });
            } else if (document.status === 'rejected') {
              documentActivities.push({
                id: `rej_${doc.id}`,
                date: document.uploadedAt,
                action: `Document "${document.fileName}" rejeté${document.rejectReason ? ` : ${document.rejectReason}` : ''}`,
                actor: 'Professionnel',
                icon: <XCircle className="w-5 h-5 text-red-500" />
              });
            }
          });

          console.log('Processed documents:', documentsData);
          setDocuments(documentsData);

          // Combine document activities with initial activities
          const allActivities = [
            ...documentActivities,
            {
              id: 'request_created',
              date: requestData.createdAt,
              action: `Demande "${requestData.documentListName || 'Documents'}" créée pour ${requestData.clientName}`,
              actor: 'Système',
              icon: <FileText className="w-5 h-5 text-blue-500" />
            }
          ];

          // Add email sent activity if email was sent
          if (requestData.emailSent && requestData.clientCredentials) {
            allActivities.push({
              id: 'email_sent',
              date: requestData.emailSentAt || requestData.clientCredentials.generatedAt,
              action: `📧 Email de demande envoyé à ${requestData.clientEmail} avec identifiants de connexion`,
              actor: 'Système',
              icon: <MailIcon className="w-5 h-5 text-green-500" />
            });
          }

          // Sort activities by date (newest first)
          allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setActivities(allActivities);
        },
        (error) => {
          console.error('Error in documents listener:', error);
        }
      );

      return () => {
        console.log('Cleaning up documents listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up documents listener:', error);
    }
  }, [id, requestData]);

  // Handle sending email with credentials using EmailService
  const handleSendEmailWithCredentials = async (customMessage?: string) => {
    if (!requestData || !user) return;

    setSendingEmail(true);

    try {
      console.log('🚀 Envoi d\'email via EmailService...');
      
      const result = await EmailService.sendDocumentRequestEmail(requestData, customMessage);

      if (result.success && result.credentials) {
        // Update local state
        setRequestData(prev => prev ? {
          ...prev,
          emailSent: true,
          emailSentAt: new Date().toISOString(),
          clientCredentials: result.credentials
        } : null);

        // Show success message with credentials
        alert(`✅ Email envoyé avec succès (SIMULÉ) !

📧 Configuration :
• Expéditeur : noreply@centraldocs.io
• Destinataire : ${requestData.clientEmail}
• Service : Simulation (développement)

🔐 Identifiants générés :
• Email : ${result.credentials.email}
• Mot de passe : ${result.credentials.password}
• Lien : ${window.location.origin}/client-login

📋 Contenu de l'email :
• Liste des documents demandés
• Instructions de connexion
• Design professionnel HTML + texte

⚠️ MODE DÉVELOPPEMENT :
L'email est simulé. En production, il sera envoyé via SendGrid.

Le client peut maintenant se connecter et téléverser ses documents.`);

        console.log('✅ Email envoyé avec succès (simulé) avec identifiants:', result.credentials);

      } else {
        throw new Error(result.error || 'Erreur inconnue lors de l\'envoi');
      }

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi d\'email:', error);
      alert(`❌ Erreur lors de l'envoi de l'email : ${error.message}

🔧 Vérifications :
• Configuration du service d'email
• Adresse email du destinataire
• Connexion internet
• Permissions Firestore

💡 En mode développement, l'email est simulé.
Consultez la console pour voir le contenu de l'email.

Contactez le support si le problème persiste.`);
    } finally {
      setSendingEmail(false);
    }
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

  const calculateProgress = () => {
    if (!requestData || requestData.documentsCount === 0) return 0;
    const completed = requestData.documentsCount - requestData.pendingDocuments;
    return Math.round((completed / requestData.documentsCount) * 100);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des détails de la demande...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/requests"
          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour aux demandes
        </Link>
        
        <div className="bg-red-50 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
              <p className="text-red-700 mb-4">{error}</p>
              
              <button
                onClick={() => window.location.reload()}
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

  if (!requestData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/requests"
          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour aux demandes
        </Link>
        
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Demande non trouvée</h3>
          <p className="text-gray-500">La demande demandée n'existe pas ou a été supprimée.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/requests"
          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour aux demandes
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {requestData.documentListName || 'Documents personnalisés'} – {requestData.clientName}
            </h1>
            <div className="flex items-center space-x-4 mt-2 text-gray-500">
              <span>Date de création : {new Date(requestData.createdAt).toLocaleDateString('fr-FR')}</span>
              <span>•</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                requestData.status === 'completed' 
                  ? 'bg-green-100 text-green-800'
                  : requestData.status === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                Statut : {requestData.status === 'completed' ? 'Terminé' : 
                         requestData.status === 'cancelled' ? 'Annulé' : 'En cours'}
              </span>
              {requestData.aiEnabled && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Bot className="w-3 h-3 mr-1" />
                    IA activée
                  </span>
                </>
              )}
              {requestData.emailSent && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <MailIcon className="w-3 h-3 mr-1" />
                    Email envoyé
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Send Email Button */}
          <div className="flex items-center space-x-3">
            {!requestData.emailSent && (
              <button
                onClick={() => handleSendEmailWithCredentials()}
                disabled={sendingEmail}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <MailIcon className="w-4 h-4 mr-2" />
                    Envoyer par email
                  </>
                )}
              </button>
            )}
            
            {/* Production Info Button */}
            <button
              onClick={() => setShowProductionInfo(!showProductionInfo)}
              className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
              title="Informations pour la production"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Production Info Alert */}
      {showProductionInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                🚀 Configuration pour la production
              </h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p><strong>Mode actuel :</strong> Développement (emails simulés)</p>
                <p><strong>Pour la production :</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Créer une API backend (Node.js/Express)</li>
                  <li>Configurer SendGrid : <code className="bg-blue-100 px-1 rounded">SENDGRID_API_KEY</code></li>
                  <li>Implémenter l'authentification DKIM/SPF</li>
                  <li>Hasher les mots de passe avec bcrypt</li>
                  <li>Ajouter la validation et les logs d'audit</li>
                </ul>
                <p className="mt-2">
                  <strong>Expéditeur configuré :</strong> noreply@centraldocs.io<br />
                  <strong>Service recommandé :</strong> SendGrid (fiabilité optimale)
                </p>
              </div>
              <button
                onClick={() => console.log(EmailService.getProductionEmailInstructions())}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Voir les instructions complètes dans la console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Status Alert */}
      {requestData.emailSent && requestData.clientCredentials && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800 mb-1">
                ✅ Email envoyé avec succès ! (Mode développement - simulé)
              </h3>
              <p className="text-sm text-green-700 mb-2">
                📧 <strong>Expéditeur :</strong> noreply@centraldocs.io<br />
                📧 <strong>Destinataire :</strong> {requestData.clientEmail}<br />
                📅 <strong>Envoyé le :</strong> {requestData.emailSentAt ? new Date(requestData.emailSentAt).toLocaleDateString('fr-FR') + ' à ' + new Date(requestData.emailSentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Date inconnue'}
              </p>
              <div className="bg-green-100 rounded-md p-3 text-sm">
                <p className="font-medium text-green-800 mb-1">🔐 Identifiants générés :</p>
                <p className="text-green-700">📧 Email : {requestData.clientCredentials.email}</p>
                <p className="text-green-700">🔑 Mot de passe : <code className="bg-green-200 px-1 rounded">{requestData.clientCredentials.password}</code></p>
                <p className="text-green-700">🔗 Lien : <a href={`${window.location.origin}/client-login`} target="_blank" rel="noopener noreferrer" className="underline">{window.location.origin}/client-login</a></p>
              </div>
              <p className="text-xs text-green-600 mt-2">
                ⚠️ En mode développement, l'email est simulé. Le contenu complet est visible dans la console.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column (60%) */}
        <div className="lg:w-3/5">
          {/* Documents demandés */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Documents demandés</h2>
            {requestData.requestedDocuments.length === 0 ? (
              <p className="text-gray-500">Aucun document spécifique demandé.</p>
            ) : (
              <div className="space-y-3">
                {requestData.requestedDocuments.map((doc, index) => {
                  const uploadedDoc = documents.find(d => d.fileName.toLowerCase().includes(doc.name.toLowerCase()));
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {doc.name}
                            {doc.required && <span className="text-red-500 ml-1">*</span>}
                          </p>
                          {doc.description && (
                            <p className="text-sm text-gray-500">{doc.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {uploadedDoc ? (
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(uploadedDoc.status)}
                          <span className={`text-sm ${getStatusColor(uploadedDoc.status)}`}>
                            {getStatusText(uploadedDoc.status)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">En attente</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Documents téléversés */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Documents téléversés ({documents.length})</h2>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun document téléversé pour le moment.</p>
                {requestData.emailSent ? (
                  <p className="text-sm text-gray-400 mt-2">
                    Le client peut se connecter avec ses identifiants pour téléverser ses documents.
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">
                    Envoyez l'email au client pour qu'il puisse téléverser ses documents.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="cursor-pointer group relative border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors duration-200"
                    onClick={() => {
                      setSelectedDocument(doc);
                      setIsPreviewOpen(true);
                    }}
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate mb-1">
                      {doc.fileName}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(doc.status)}
                        <span className={`text-xs ml-1 ${getStatusColor(doc.status)}`}>
                          {getStatusText(doc.status)}
                        </span>
                      </div>
                      {doc.downloadURL && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(doc.downloadURL, '_blank');
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Voir le document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement('a');
                              link.href = doc.downloadURL!;
                              link.download = doc.fileName;
                              link.click();
                            }}
                            className="text-green-600 hover:text-green-800"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {doc.rejectReason && (
                      <p className="text-xs text-red-600 mt-1 truncate" title={doc.rejectReason}>
                        {doc.rejectReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Règles de validation IA */}
          {requestData.aiEnabled && requestData.validationRules && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center mb-4">
                <Bot className="w-5 h-5 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold">Règles de validation IA</h2>
              </div>
              <p className="text-gray-700 bg-purple-50 p-3 rounded-md">
                {requestData.validationRules}
              </p>
            </div>
          )}

          {/* Notes internes */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Notes internes</h2>
            <div className="space-y-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ajouter une note interne..."
                className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200">
                Enregistrer note
              </button>
            </div>
          </div>

          {/* Historique des actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Historique des actions</h2>
            </div>
            <div className="space-y-4">
              {activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {activity.icon}
                  <div>
                    <p className="text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString('fr-FR')} à {new Date(activity.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {activity.actor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (40%) */}
        <div className="lg:w-2/5">
          {/* État d'avancement */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">État d'avancement</h2>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeDasharray={`${calculateProgress()}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {calculateProgress()}%
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-600">
              {requestData.documentsCount - requestData.pendingDocuments} documents reçus sur {requestData.documentsCount} requis
            </p>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors duration-200">
                <Check className="w-4 h-4 mr-2" />
                Valider tout
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors duration-200">
                <X className="w-4 h-4 mr-2" />
                Rejeter des documents
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager ce dossier
              </button>
              {!requestData.emailSent && (
                <button
                  onClick={() => handleSendEmailWithCredentials()}
                  disabled={sendingEmail}
                  className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-500 transition-colors duration-200 disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <MailIcon className="w-4 h-4 mr-2" />
                      Envoyer par email
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Informations client */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Informations client</h2>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">{requestData.clientName}</h3>
                <div className="flex items-center text-gray-500 mt-1">
                  <Mail className="w-4 h-4 mr-1" />
                  <span className="text-sm">{requestData.clientEmail}</span>
                </div>
                {requestData.clientPhone && (
                  <div className="flex items-center text-gray-500 mt-1">
                    <Phone className="w-4 h-4 mr-1" />
                    <span className="text-sm">{requestData.clientPhone}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                Dernière mise à jour : {new Date(requestData.createdAt).toLocaleDateString('fr-FR')}
              </p>
              <button className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors duration-200">
                <Send className="w-4 h-4 mr-2" />
                Envoyer un message
              </button>
            </div>
          </div>

          {/* Configuration email */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              📧 Configuration email
            </h3>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Mode :</strong> Développement (simulé)</p>
              <p><strong>Expéditeur :</strong> noreply@centraldocs.io</p>
              <p><strong>Service :</strong> SendGrid (en production)</p>
              <p><strong>Sécurité :</strong> TLS/SSL + DKIM/SPF</p>
              <p><strong>Format :</strong> HTML + Texte</p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {isPreviewOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{selectedDocument.fileName}</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Aperçu du document : {selectedDocument.fileName}</p>
              {selectedDocument.downloadURL && (
                <div className="space-x-4">
                  <button
                    onClick={() => window.open(selectedDocument.downloadURL, '_blank')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                  >
                    Ouvrir dans un nouvel onglet
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedDocument.downloadURL!;
                      link.download = selectedDocument.fileName;
                      link.click();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
                  >
                    Télécharger
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Request Modal */}
      <ShareRequestModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documents={documents.map(doc => ({ id: doc.id, name: doc.fileName }))}
      />

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={isSendEmailModalOpen}
        onClose={() => setIsSendEmailModalOpen(false)}
        requestData={requestData}
        onEmailSent={() => {
          setIsSendEmailModalOpen(false);
          // Refresh data
          window.location.reload();
        }}
      />
    </div>
  );
};

export default RequestDetails;