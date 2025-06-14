import React, { useState } from 'react';
import { Settings, RefreshCw, CheckCircle } from 'lucide-react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const PermissionsFixer: React.FC = () => {
  const { user } = useAuth();
  const [fixing, setFixing] = useState(false);
  const [results, setResults] = useState<{ clients: number; lists: number } | null>(null);

  const fixAllPermissions = async () => {
    if (!user) {
      alert('Vous devez être connecté pour corriger les permissions');
      return;
    }

    setFixing(true);
    setResults(null);

    try {
      console.log('🔧 Début de la correction globale des permissions...');
      
      let clientsFixed = 0;
      let listsFixed = 0;

      // Corriger les clients
      console.log('📋 Correction des clients...');
      const clientsSnapshot = await getDocs(collection(db, 'clients'));
      const clientsBatch = writeBatch(db);
      
      clientsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.createdBy) {
          const clientRef = doc(db, 'clients', docSnap.id);
          clientsBatch.update(clientRef, {
            createdBy: user.uid,
            lastUpdated: new Date()
          });
          clientsFixed++;
          console.log(`📝 Client corrigé: ${docSnap.id}`);
        }
      });
      
      if (clientsFixed > 0) {
        await clientsBatch.commit();
        console.log(`✅ ${clientsFixed} clients corrigés`);
      }

      // Corriger les listes de documents
      console.log('📋 Correction des listes de documents...');
      const listsSnapshot = await getDocs(collection(db, 'documentLists'));
      const listsBatch = writeBatch(db);
      
      listsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.createdBy) {
          const listRef = doc(db, 'documentLists', docSnap.id);
          listsBatch.update(listRef, {
            createdBy: user.uid,
            lastUpdated: new Date()
          });
          listsFixed++;
          console.log(`📝 Liste corrigée: ${docSnap.id}`);
        }
      });
      
      if (listsFixed > 0) {
        await listsBatch.commit();
        console.log(`✅ ${listsFixed} listes corrigées`);
      }

      setResults({ clients: clientsFixed, lists: listsFixed });
      
      if (clientsFixed > 0 || listsFixed > 0) {
        alert(`✅ Correction terminée !\n\n${clientsFixed} clients et ${listsFixed} listes de documents ont été corrigés.\n\nVeuillez actualiser la page.`);
      } else {
        alert('✅ Tous les documents ont déjà les permissions correctes !');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la correction:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        🔧 Correcteur de permissions
      </h2>
      
      <p className="text-gray-600 mb-6">
        Cet outil corrige automatiquement les problèmes de permissions en ajoutant 
        le champ 'createdBy' manquant dans vos documents clients et listes de documents.
      </p>

      {results && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <h3 className="font-medium text-green-800">Correction terminée !</h3>
              <p className="text-green-700 text-sm">
                {results.clients} clients et {results.lists} listes de documents corrigés
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={fixAllPermissions}
        disabled={fixing || !user}
        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {fixing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Correction en cours...
          </>
        ) : (
          <>
            <Settings className="w-5 h-5 mr-2" />
            Corriger toutes les permissions
          </>
        )}
      </button>

      <div className="mt-4 text-sm text-gray-500">
        <p><strong>Note :</strong> Cette opération est sûre et ne supprime aucune donnée.</p>
        <p>Elle ajoute simplement le champ 'createdBy' manquant à vos documents.</p>
      </div>
    </div>
  );
};

export default PermissionsFixer;