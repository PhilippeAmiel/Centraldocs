import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import UploadDocument from "../components/UploadDocument";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function ClientMesDemandes() {
  const { user } = useAuth();

  useEffect(() => {
    const createRequestDocIfNeeded = async () => {
      if (!user) return;

      const requestId = `client_${user.uid}`;
      const requestRef = doc(db, "requests", requestId);
      
      try {
        const docSnap = await getDoc(requestRef);
        
        if (!docSnap.exists()) {
          // For client self-service requests, we need to get the professional ID
          // from the client document if it exists, otherwise set it to the client's UID
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
            type: 'client_self_service',
            status: 'pending',
            createdAt: serverTimestamp(),
            email: user.email,
            lastUpdated: serverTimestamp()
          });
          console.log("Created parent request document with professionalId:", professionalId);
        }
      } catch (error) {
        console.error("Error checking/creating request document:", error);
      }
    };

    createRequestDocIfNeeded();
  }, [user]);

  console.log("ClientMesDemandes - Current user:", user?.email);

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

  if (!user) {
    console.log("ClientMesDemandes - No user found");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Veuillez vous connecter pour accéder à vos documents.</p>
        </div>
      </div>
    );
  }

  console.log("ClientMesDemandes - Rendering upload zones");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Documents requis</h1>
          <p className="text-gray-600 mt-2">
            Veuillez fournir les documents suivants pour compléter votre dossier.
          </p>
        </div>
        
        <div className="space-y-6">
          {documentsRequis.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{doc.label}</h3>
                <p className="text-gray-600 text-sm mt-1">{doc.description}</p>
                
                <div className="mt-4">
                  <UploadDocument
                    requestId={`client_${user.uid}`}
                    docId={doc.id}
                    onFileSelect={(file) => console.log("File selected:", file.name)}
                    onFileRemove={() => console.log("File removed:", doc.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}