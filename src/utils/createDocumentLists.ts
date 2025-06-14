import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Fonction pour créer des listes de documents d'exemple
export const createSampleDocumentLists = async (userId: string) => {
  try {
    console.log('Creating sample document lists for user:', userId);

    const sampleLists = [
      {
        name: 'Dossier Location Standard',
        description: 'Documents requis pour une demande de location immobilière',
        category: 'location',
        documents: [
          {
            name: 'Carte d\'identité',
            description: 'En cours de validité',
            required: true
          },
          {
            name: 'Justificatif de domicile',
            description: 'Facture de moins de 3 mois',
            required: true
          },
          {
            name: '3 derniers bulletins de salaire',
            description: 'Bulletins récents',
            required: true
          },
          {
            name: 'Contrat de travail',
            description: 'CDI ou CDD',
            required: true
          },
          {
            name: 'Relevé d\'identité bancaire',
            description: 'RIB récent',
            required: true
          }
        ],
        isTemplate: true,
        usageCount: 0,
        createdBy: userId,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      },
      {
        name: 'Dossier Crédit Immobilier',
        description: 'Documents pour une demande de prêt immobilier',
        category: 'credit',
        documents: [
          {
            name: 'Pièce d\'identité',
            description: 'Carte d\'identité ou passeport',
            required: true
          },
          {
            name: 'Justificatifs de revenus',
            description: '3 derniers bulletins de salaire',
            required: true
          },
          {
            name: 'Relevés bancaires',
            description: '3 derniers mois',
            required: true
          },
          {
            name: 'Avis d\'imposition',
            description: 'Dernier avis d\'imposition',
            required: true
          },
          {
            name: 'Compromis de vente',
            description: 'Signé par les parties',
            required: true
          }
        ],
        isTemplate: true,
        usageCount: 0,
        createdBy: userId,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      },
      {
        name: 'Dossier Achat Particulier',
        description: 'Documents pour un achat immobilier entre particuliers',
        category: 'achat',
        documents: [
          {
            name: 'Carte d\'identité',
            description: 'En cours de validité',
            required: true
          },
          {
            name: 'Justificatif de revenus',
            description: 'Bulletins de salaire ou bilan',
            required: true
          },
          {
            name: 'Attestation de financement',
            description: 'Banque ou organisme de crédit',
            required: true
          },
          {
            name: 'Assurance habitation',
            description: 'Attestation d\'assurance',
            required: false
          }
        ],
        isTemplate: true,
        usageCount: 0,
        createdBy: userId,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      }
    ];

    // Créer chaque liste dans Firestore
    const promises = sampleLists.map(list => 
      addDoc(collection(db, 'documentLists'), list)
    );

    const results = await Promise.all(promises);
    
    console.log('Sample document lists created successfully:', results.map(r => r.id));
    return results;

  } catch (error) {
    console.error('Error creating sample document lists:', error);
    throw error;
  }
};