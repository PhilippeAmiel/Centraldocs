// Script de correction manuelle des permissions
// À exécuter dans la console du navigateur sur votre application

async function fixAllPermissions() {
  console.log('🔧 Début de la correction des permissions...');
  
  try {
    // Importer Firebase depuis votre application
    const { db, auth } = window;
    const { collection, getDocs, writeBatch, doc, serverTimestamp } = window.firebase.firestore;
    
    if (!auth.currentUser) {
      console.error('❌ Vous devez être connecté pour exécuter ce script');
      return;
    }
    
    const userId = auth.currentUser.uid;
    console.log('👤 Utilisateur connecté:', userId);
    
    // Corriger les clients
    console.log('📋 Correction des clients...');
    const clientsSnapshot = await getDocs(collection(db, 'clients'));
    const clientsBatch = writeBatch(db);
    let clientsFixed = 0;
    
    clientsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.createdBy) {
        const clientRef = doc(db, 'clients', docSnap.id);
        clientsBatch.update(clientRef, {
          createdBy: userId,
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
    let listsFixed = 0;
    
    listsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.createdBy) {
        const listRef = doc(db, 'documentLists', docSnap.id);
        listsBatch.update(listRef, {
          createdBy: userId,
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
    
    console.log('🎉 Correction terminée !');
    console.log(`📊 Résumé: ${clientsFixed} clients + ${listsFixed} listes corrigés`);
    
    alert(`✅ Correction terminée !\n\n${clientsFixed} clients et ${listsFixed} listes de documents ont été corrigés.\n\nVeuillez actualiser la page.`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    alert(`❌ Erreur: ${error.message}`);
  }
}

// Exécuter la fonction
fixAllPermissions();