import React, { useState, useEffect } from 'react';
import { X, Search, User, Mail, Phone, FileText, Home, CreditCard, Receipt, Wallet, File, Bot, ChevronRight, ChevronLeft, List } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated: () => void;
  preSelectedClient?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface DocumentList {
  id: string;
  name: string;
  description: string;
  documents: Array<{
    name: string;
    description?: string;
    required: boolean;
  }>;
  category: string;
}

const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onRequestCreated,
  preSelectedClient
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New client form state
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Document selection state
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [otherDocument, setOtherDocument] = useState('');
  const [selectedDocumentList, setSelectedDocumentList] = useState<DocumentList | null>(null);
  const [documentLists, setDocumentLists] = useState<DocumentList[]>([]);

  // AI settings state
  const [aiEnabled, setAiEnabled] = useState(true);
  const [validationRules, setValidationRules] = useState('');

  // Load document lists from Firestore
  useEffect(() => {
    const loadDocumentLists = async () => {
      if (!user) return;

      try {
        const listsQuery = query(
          collection(db, 'documentLists'),
          where('createdBy', '==', user.uid)
        );
        
        const snapshot = await getDocs(listsQuery);
        const lists: DocumentList[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          lists.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            documents: data.documents || [],
            category: data.category
          });
        });

        setDocumentLists(lists);
      } catch (error) {
        console.error('Error loading document lists:', error);
      }
    };

    if (isOpen) {
      loadDocumentLists();
    }
  }, [user, isOpen]);

  // Set pre-selected client when modal opens
  useEffect(() => {
    if (preSelectedClient && isOpen) {
      setSelectedClient(preSelectedClient);
      setStep(2); // Skip client selection step
    }
  }, [preSelectedClient, isOpen]);

  const documents = [
    { id: 'id', name: 'Carte d\'identité', icon: <FileText className="w-5 h-5" /> },
    { id: 'proof', name: 'Justificatif de domicile', icon: <Home className="w-5 h-5" /> },
    { id: 'payslip', name: 'Fiche de paie', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'invoice', name: 'Facture', icon: <Receipt className="w-5 h-5" /> },
    { id: 'bank', name: 'Relevé bancaire', icon: <Wallet className="w-5 h-5" /> },
    { id: 'contract', name: 'Contrat', icon: <File className="w-5 h-5" /> }
  ];

  // Example clients data (would come from your backend)
  const clients: Client[] = [
    { id: '1', name: 'Jean Dupont', email: 'jean@example.com', phone: '0612345678' },
    { id: '2', name: 'Marie Martin', email: 'marie@example.com' }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewClientSubmit = () => {
    // In a real app, this would call an API to create the client
    const newClientWithId = {
      id: Math.random().toString(),
      ...newClient
    };
    setSelectedClient(newClientWithId);
    setShowNewClientForm(false);
  };

  const handleDocumentListSelect = (list: DocumentList) => {
    setSelectedDocumentList(list);
    // Auto-select all required documents from the list
    const requiredDocs = list.documents
      .filter(doc => doc.required)
      .map(doc => doc.name);
    setSelectedDocuments(requiredDocs);
  };

  const handleSubmit = async () => {
    if (!user || !selectedClient) return;

    setIsSubmitting(true);
    
    try {
      // Prepare documents list - use selected list or individual documents
      let documentsToRequest = [];
      
      if (selectedDocumentList) {
        documentsToRequest = selectedDocumentList.documents.map(doc => ({
          name: doc.name,
          description: doc.description || '',
          required: doc.required
        }));
      } else {
        // Use individually selected documents
        documentsToRequest = selectedDocuments.map(docId => {
          const doc = documents.find(d => d.id === docId);
          return {
            name: doc?.name || docId,
            description: '',
            required: true
          };
        });
        
        // Add other document if specified
        if (otherDocument) {
          documentsToRequest.push({
            name: otherDocument,
            description: '',
            required: true
          });
        }
      }

      // Create the request document with proper client reference
      const requestData = {
        clientId: selectedClient.id,
        professionalId: user.uid,
        createdBy: user.uid,
        type: 'document_request',
        status: 'pending',
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        clientName: selectedClient.name,
        clientEmail: selectedClient.email,
        clientPhone: selectedClient.phone || '',
        requestedDocuments: documentsToRequest,
        documentListId: selectedDocumentList?.id || null,
        documentListName: selectedDocumentList?.name || null,
        aiEnabled,
        validationRules: validationRules || null,
        documentsCount: documentsToRequest.length,
        pendingDocuments: documentsToRequest.length
      };

      console.log('Creating request with data:', requestData);

      const docRef = await addDoc(collection(db, 'requests'), requestData);
      
      console.log('Request created successfully with ID:', docRef.id);
      
      // Show success message
      alert('Demande créée avec succès !');
      
      // Call the callback to refresh data
      onRequestCreated();
      
      // Close modal and reset form
      onClose();
      resetForm();
      
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Erreur lors de la création de la demande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(preSelectedClient ? 2 : 1);
    if (!preSelectedClient) {
      setSelectedClient(null);
    }
    setSelectedDocuments([]);
    setOtherDocument('');
    setSelectedDocumentList(null);
    setValidationRules('');
    setShowNewClientForm(false);
    setSearchQuery('');
    setNewClient({ name: '', email: '', phone: '' });
    setAiEnabled(true);
  };

  const renderProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {[1, 2, 3].map((stepNumber) => (
          <div
            key={stepNumber}
            className={`flex-1 h-2 rounded-full mx-1 ${
              stepNumber <= step ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="text-center text-sm text-gray-600">
        Étape {step}/3
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      {!showNewClientForm ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Sélectionner un client existant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {searchQuery && (
            <div className="mt-2 border border-gray-200 rounded-md divide-y">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-gray-500">{client.email}</div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowNewClientForm(true)}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            + Créer un nouveau client
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du client
            </label>
            <input
              type="text"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email du client
            </label>
            <input
              type="email"
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone (optionnel)
            </label>
            <input
              type="tel"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleNewClientSubmit}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition-colors duration-200"
            >
              Enregistrer client
            </button>
            <button
              onClick={() => setShowNewClientForm(false)}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Document Lists Section */}
      {documentLists.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Utiliser une liste prédéfinie
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {documentLists.map((list) => (
              <div
                key={list.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedDocumentList?.id === list.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleDocumentListSelect(list)}
              >
                <div className="flex items-start">
                  <List className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">{list.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{list.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {list.documents.length} documents
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <span className="text-gray-500 text-sm">ou</span>
          </div>
        </div>
      )}

      {/* Individual Document Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sélectionner des documents individuels
        </h3>
        <div className="space-y-4">
          {documents.map((doc) => (
            <label
              key={doc.id}
              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedDocuments.includes(doc.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedDocuments([...selectedDocuments, doc.id]);
                    setSelectedDocumentList(null); // Clear list selection
                  } else {
                    setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                  }
                }}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <div className="flex items-center space-x-2">
                {doc.icon}
                <span>{doc.name}</span>
              </div>
            </label>
          ))}
          
          <div className="p-3 border border-gray-200 rounded-md">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={!!otherDocument}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setOtherDocument('');
                    setSelectedDocumentList(null);
                  }
                }}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span>Autre document</span>
            </label>
            {!!otherDocument && (
              <input
                type="text"
                value={otherDocument}
                onChange={(e) => {
                  setOtherDocument(e.target.value);
                  setSelectedDocumentList(null); // Clear list selection
                }}
                placeholder="Précisez le document..."
                className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <span>Activer IA pour ce dossier</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => setAiEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Règles de validation
        </label>
        <textarea
          value={validationRules}
          onChange={(e) => setValidationRules(e.target.value)}
          placeholder="Exemple : Vérifier que la date de justificatif de domicile est < 3 mois."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium mb-2">Récapitulatif</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Client :</strong> {selectedClient?.name}</p>
          <p><strong>Documents demandés :</strong></p>
          
          {selectedDocumentList ? (
            <div className="pl-4">
              <p className="font-medium text-blue-600">Liste : {selectedDocumentList.name}</p>
              <ul className="list-disc list-inside pl-4">
                {selectedDocumentList.documents.map((doc, index) => (
                  <li key={index}>
                    {doc.name} {doc.required && <span className="text-red-500">*</span>}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="list-disc list-inside pl-4">
              {selectedDocuments.map(docId => (
                <li key={docId}>
                  {documents.find(d => d.id === docId)?.name}
                </li>
              ))}
              {otherDocument && <li>{otherDocument}</li>}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            {preSelectedClient ? `Nouvelle demande pour ${preSelectedClient.name}` : 'Créer une nouvelle demande'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar - Fixed */}
        {!preSelectedClient && (
          <div className="px-6 pt-4 flex-shrink-0">
            {renderProgressBar()}
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!preSelectedClient && step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-between p-6 border-t border-gray-200 flex-shrink-0">
          {step > (preSelectedClient ? 2 : 1) && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Précédent
            </button>
          )}
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
              disabled={!selectedClient || isSubmitting}
            >
              Suivant
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200 disabled:opacity-50"
              disabled={!selectedClient || (!selectedDocumentList && selectedDocuments.length === 0 && !otherDocument) || isSubmitting}
            >
              {isSubmitting ? 'Création...' : 'Envoyer la demande'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewRequestModal;