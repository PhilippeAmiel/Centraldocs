import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle, Share2, XCircle, AlertTriangle } from 'lucide-react';
import UploadDocument from './UploadDocument';
import { doc, setDoc, getDoc, serverTimestamp, collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../contexts/AuthContext';

interface DocumentStatus {
  status: 'pending' | 'validating' | 'validated' | 'rejected';
}

const ClientRequestDetails: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Record<string, DocumentStatus>>({});

  // Calculate progress based on documents status
  const progress = {
    total: 5, // Total required documents
    completed: Object.values(documents).filter(doc => 
      doc.status === 'validated' || doc.status === 'validating'
    ).length
  };

  useEffect(() => {
    const createRequestDocIfNeeded = async () => {
      if (!user || !id) return;

      setError(null);
      setLoading(true);

      const expectedPrefix = `client_${user.uid}`;
      if (!id.startsWith(expectedPrefix)) {
        console.error("Invalid request ID format for current user");
        setError("Vous n'avez pas accès à cette demande.");
        setLoading(false);
        setTimeout(() => navigate('/client'), 2000);
        return;
      }

      try {
        await user.getIdToken(true);
        
        const requestRef = doc(db, "requests", id);
        const docSnap = await getDoc(requestRef);
        
        if (!docSnap.exists()) {
          // For client requests, we need to determine the professionalId
          let professionalId = user.uid; // Default to client's UID for self-service
          
          try {
            // Try to find if this user is a client in the clients collection
            const clientRef = doc(db, "clients", user.uid);
            const clientSnap = await getDoc(clientRef);
            
            if (clientSnap.exists()) {
              // If client document exists, use the createdBy field as professionalId
              professionalId = clientSnap.data().createdBy || user.uid;
            }
          } catch (error) {
            console.log("No client document found, using self-service mode");
          }

          await setDoc(requestRef, {
            clientId: user.uid,
            professionalId: professionalId, // Add professionalId field
            createdBy: user.uid,
            type: 'client_request',
            status: 'pending',
            createdAt: serverTimestamp(),
            email: user.email,
            lastUpdated: serverTimestamp(),
            lastUpdatedBy: user.uid,
            requestId: id
          });
          console.log("Created request document with professionalId:", professionalId);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking/creating request document:", error);
        setError("Une erreur est survenue lors de l'accès à votre demande. Veuillez réessayer.");
        setLoading(false);
      }
    };

    createRequestDocIfNeeded();

    // Set up real-time listener for documents subcollection
    if (id) {
      const unsubscribe = onSnapshot(
        collection(db, "requests", id, "documents"),
        (snapshot) => {
          const docs: Record<string, DocumentStatus> = {};
          snapshot.forEach((doc) => {
            const data = doc.data();
            docs[doc.id] = {
              status: data.status
            };
          });
          setDocuments(docs);
        },
        (error) => {
          console.error("Error listening to documents:", error);
        }
      );

      return () => unsubscribe();
    }
  }, [user, id, navigate]);

  const requestDetails = {
    type: "Dossier location",
    professional: "Agence Immobilière Dupont",
    createdAt: "15/03/2024",
    nextReminder: "22/03/2024",
    allowDisableReminders: true,
    allowDownload: true,
    isComplete: false
  };

  const activities = [
    {
      id: '1',
      date: '15/03/2024 – 14:30',
      action: 'Document \'CNI\' validé par Thomas',
      actor: 'Thomas',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />
    },
    {
      id: '2',
      date: '15/03/2024 – 14:25',
      action: 'Lien de partage généré, expiration le 22/03/2024',
      actor: 'Système',
      icon: <Share2 className="w-5 h-5 text-blue-500" />
    },
    {
      id: '3',
      date: '15/03/2024 – 14:20',
      action: 'Document \'Justificatif de domicile\' rejeté : motif \'Trop ancien\'',
      actor: 'Thomas',
      icon: <XCircle className="w-5 h-5 text-red-500" />
    }
  ];

  const documentsRequis = [
    { 
      id: "identite", 
      label: "Pièce d'identité",
      description: "Carte d'identité, passeport ou titre de séjour en cours de validité"
    },
    { 
      id: "domicile", 
      label: "Justificatif de domicile",
      description: "Facture d'électricité, de gaz ou quittance de loyer de moins de 3 mois"
    },
    { 
      id: "revenus", 
      label: "Justificatifs de revenus",
      description: "3 derniers bulletins de salaire ou bilan comptable pour les indépendants"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Chargement de votre demande...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <p className="text-center text-gray-800 mb-4">{error}</p>
          <p className="text-center text-gray-500 text-sm">
            Redirection vers le tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Veuillez vous connecter pour accéder à vos documents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/client"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux demandes
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {requestDetails.type}
          </h1>
          <p className="text-gray-500 mt-1">
            Demandé par : {requestDetails.professional} – Créé le {requestDetails.createdAt}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-amber-400 mr-3" />
              <p className="text-gray-700">
                Un rappel automatique sera envoyé le {requestDetails.nextReminder} si des pièces manquent.
              </p>
            </div>
            {requestDetails.allowDisableReminders && (
              <button className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200">
                Désactiver les rappels
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents requis</h2>
              <div className="space-y-6">
                {documentsRequis.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{doc.label}</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">{doc.description}</p>
                    <UploadDocument
                      requestId={id}
                      docId={doc.id}
                      onFileSelect={(file) => console.log("File selected:", file.name)}
                      onFileRemove={() => console.log("File removed:", doc.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-center">
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
                      strokeDasharray={`${(progress.completed / progress.total) * 100}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {Math.round((progress.completed / progress.total) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-600 mt-4">
                {progress.completed} / {progress.total} documents fournis
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h2>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">{activity.icon}</div>
                    <div>
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientRequestDetails;