import React, { useState } from 'react';
import { X, Plus, Trash2, FileText, Save, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface NewDocumentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListCreated: (list: any) => void;
}

interface DocumentItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

const NewDocumentListModal: React.FC<NewDocumentListModalProps> = ({
  isOpen,
  onClose,
  onListCreated
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [category, setCategory] = useState<'location' | 'achat' | 'credit' | 'autre'>('location');
  const [isTemplate, setIsTemplate] = useState(true);
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: '1', name: '', description: '', required: true }
  ]);

  const categories = [
    { value: 'location', label: 'Location' },
    { value: 'achat', label: 'Achat' },
    { value: 'credit', label: 'Crédit' },
    { value: 'autre', label: 'Autre' }
  ];

  const predefinedDocuments = {
    location: [
      'Carte d\'identité',
      'Justificatif de domicile',
      'Bulletins de salaire (3 derniers)',
      'Contrat de travail',
      'Relevé d\'identité bancaire',
      'Garant (si nécessaire)'
    ],
    achat: [
      'Pièce d\'identité',
      'Justificatifs de revenus',
      'Relevés bancaires',
      'Compromis de vente',
      'Attestation d\'assurance'
    ],
    credit: [
      'Carte d\'identité',
      'Justificatifs de revenus',
      'Relevés bancaires (3 mois)',
      'Avis d\'imposition',
      'Justificatif de domicile',
      'Compromis de vente'
    ],
    autre: []
  };

  const addDocument = () => {
    const newDoc: DocumentItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      required: true
    };
    setDocuments([...documents, newDoc]);
  };

  const removeDocument = (id: string) => {
    if (documents.length > 1) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  const updateDocument = (id: string, field: keyof DocumentItem, value: string | boolean) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  const loadPredefinedDocuments = () => {
    const predefined = predefinedDocuments[category];
    const newDocuments: DocumentItem[] = predefined.map((name, index) => ({
      id: (index + 1).toString(),
      name,
      description: '',
      required: true
    }));
    setDocuments(newDocuments.length > 0 ? newDocuments : [{ id: '1', name: '', description: '', required: true }]);
  };

  const validateForm = (): boolean => {
    if (!listName.trim()) {
      setError('Veuillez saisir un nom pour la liste');
      return false;
    }

    const validDocuments = documents.filter(doc => doc.name.trim());
    if (validDocuments.length === 0) {
      setError('Veuillez ajouter au moins un document');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vous devez être connecté pour créer une liste');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const validDocuments = documents.filter(doc => doc.name.trim()).map(doc => ({
        name: doc.name.trim(),
        description: doc.description.trim(),
        required: doc.required
      }));

      const listData = {
        name: listName.trim(),
        description: listDescription.trim(),
        category,
        documents: validDocuments,
        isTemplate,
        usageCount: 0,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      console.log('Creating document list:', listData);

      const docRef = await addDoc(collection(db, 'documentLists'), listData);
      
      console.log('Document list created successfully with ID:', docRef.id);

      // Create list object for immediate UI update
      const newList = {
        id: docRef.id,
        ...listData,
        createdAt: new Date().toISOString()
      };

      // Reset form
      setListName('');
      setListDescription('');
      setCategory('location');
      setIsTemplate(true);
      setDocuments([{ id: '1', name: '', description: '', required: true }]);

      onListCreated(newList);

    } catch (error: any) {
      console.error('Error creating document list:', error);
      
      if (error.code === 'permission-denied') {
        setError('Vous n\'avez pas les permissions pour créer une liste');
      } else if (error.code === 'network-request-failed') {
        setError('Erreur de connexion. Vérifiez votre connexion internet.');
      } else {
        setError('Une erreur est survenue lors de la création de la liste. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setListName('');
      setListDescription('');
      setCategory('location');
      setIsTemplate(true);
      setDocuments([{ id: '1', name: '', description: '', required: true }]);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            Créer une nouvelle liste de documents
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la liste *
                  </label>
                  <input
                    type="text"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="Ex: Dossier Location Standard"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  placeholder="Décrivez l'usage de cette liste de documents..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Template Option and Predefined Documents */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isTemplate}
                    onChange={(e) => setIsTemplate(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Utiliser comme modèle réutilisable
                  </span>
                </label>

                <button
                  type="button"
                  onClick={loadPredefinedDocuments}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                  disabled={loading}
                >
                  Charger les documents prédéfinis pour {categories.find(c => c.value === category)?.label}
                </button>
              </div>

              {/* Documents Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Documents requis
                  </h3>
                  <button
                    type="button"
                    onClick={addDocument}
                    className="flex items-center px-3 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter un document
                  </button>
                </div>

                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Document fields in a single row on larger screens */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                          {/* Document name - takes more space */}
                          <div className="lg:col-span-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom du document *
                            </label>
                            <input
                              type="text"
                              value={doc.name}
                              onChange={(e) => updateDocument(doc.id, 'name', e.target.value)}
                              placeholder="Ex: Carte d'identité"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={loading}
                            />
                          </div>

                          {/* Description */}
                          <div className="lg:col-span-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description (optionnelle)
                            </label>
                            <input
                              type="text"
                              value={doc.description}
                              onChange={(e) => updateDocument(doc.id, 'description', e.target.value)}
                              placeholder="Ex: En cours de validité"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={loading}
                            />
                          </div>

                          {/* Controls */}
                          <div className="lg:col-span-3 flex items-end justify-between lg:justify-end gap-3 h-full">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={doc.required}
                                onChange={(e) => updateDocument(doc.id, 'required', e.target.checked)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                disabled={loading}
                              />
                              <span className="ml-1 text-sm text-gray-700">Obligatoire</span>
                            </label>

                            {documents.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeDocument(doc.id)}
                                className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                                disabled={loading}
                                title="Supprimer ce document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Créer la liste
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDocumentListModal;