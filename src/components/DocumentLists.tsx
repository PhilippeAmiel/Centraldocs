import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Edit, Trash2, Copy, Users, Calendar, ChevronRight, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp, updateDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { createSampleDocumentLists } from '../utils/createDocumentLists';
import NewDocumentListModal from './NewDocumentListModal';

interface DocumentItem {
  name: string;
  description?: string;
  required: boolean;
}

interface DocumentList {
  id: string;
  name: string;
  description: string;
  documents: DocumentItem[];
  createdAt: string;
  usageCount: number;
  category: 'location' | 'achat' | 'credit' | 'autre';
  isTemplate: boolean;
  createdBy: string;
}

const DocumentLists: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [documentLists, setDocumentLists] = useState<DocumentList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [fixingPermissions, setFixingPermissions] = useState(false);

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'location', label: 'Location' },
    { value: 'achat', label: 'Achat' },
    { value: 'credit', label: 'Crédit' },
    { value: 'autre', label: 'Autre' }
  ];

  // Helper function to check if error is a permissions error
  const isPermissionError = (error: any) => {
    return error.code === 'permission-denied' || 
           error.message?.includes('Missing or insufficient permissions');
  };

  // Function to fix missing createdBy fields in document lists
  const fixMissingCreatedByFields = async () => {
    if (!user) return;

    setFixingPermissions(true);
    try {
      console.log('🔧 Fixing missing createdBy fields in document lists...');
      
      // Get all document lists without proper filtering (admin query)
      const allListsSnapshot = await getDocs(collection(db, 'documentLists'));
      const batch = writeBatch(db);
      let fixedCount = 0;

      allListsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // If document doesn't have createdBy field, add it
        if (!data.createdBy) {
          const listRef = doc(db, 'documentLists', docSnap.id);
          batch.update(listRef, {
            createdBy: user.uid,
            lastUpdated: serverTimestamp()
          });
          fixedCount++;
          console.log(`📝 Adding createdBy to document list: ${docSnap.id}`);
        }
      });

      if (fixedCount > 0) {
        await batch.commit();
        console.log(`✅ Fixed ${fixedCount} document list documents`);
        alert(`✅ Correction terminée !\n\n${fixedCount} listes de documents ont été mises à jour avec le champ 'createdBy'.\n\nVeuillez actualiser la page.`);
      } else {
        console.log('✅ All document list documents already have createdBy field');
        alert('✅ Toutes les listes de documents ont déjà le champ "createdBy" requis.');
      }
      
    } catch (error: any) {
      console.error('❌ Error fixing createdBy fields:', error);
      alert(`❌ Erreur lors de la correction: ${error.message}\n\nVeuillez contacter le support technique.`);
    } finally {
      setFixingPermissions(false);
    }
  };

  // Function to clean up problematic duplicate lists
  const cleanupProblematicLists = async () => {
    if (!user) return;

    try {
      console.log('Checking for problematic duplicate lists...');
      
      // Get all lists for the current user
      const listsQuery = query(
        collection(db, 'documentLists'),
        where('createdBy', '==', user.uid)
      );
      
      const snapshot = await getDocs(listsQuery);
      const listsToDelete: string[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const name = data.name || '';
        
        // Check if this is a problematic duplicate (contains "Copie" and might have permission issues)
        if (name.includes('(Copie)') && data.createdBy === user.uid) {
          console.log('Found problematic duplicate list:', doc.id, name);
          listsToDelete.push(doc.id);
        }
      });

      // Delete problematic lists
      if (listsToDelete.length > 0) {
        console.log('Deleting problematic lists:', listsToDelete);
        
        for (const listId of listsToDelete) {
          try {
            await deleteDoc(doc(db, 'documentLists', listId));
            console.log('Successfully deleted problematic list:', listId);
          } catch (error) {
            console.error('Error deleting list:', listId, error);
          }
        }
        
        console.log('Cleanup completed');
      }
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  // Load document lists from Firestore
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('Loading document lists for user:', user.uid);
    setError(null);

    // First, clean up any problematic lists
    cleanupProblematicLists();

    try {
      const listsQuery = query(
        collection(db, 'documentLists'),
        where('createdBy', '==', user.uid)
      );

      const unsubscribe = onSnapshot(
        listsQuery,
        (snapshot) => {
          console.log('Document lists snapshot received, size:', snapshot.size);
          
          const listsData: DocumentList[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            if (data.createdBy === user.uid) {
              listsData.push({
                id: doc.id,
                name: data.name || '',
                description: data.description || '',
                documents: data.documents || [],
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                usageCount: data.usageCount || 0,
                category: data.category || 'autre',
                isTemplate: data.isTemplate || false,
                createdBy: data.createdBy
              });
            }
          });

          // Sort by creation date (newest first)
          listsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          console.log('Processed document lists:', listsData);
          setDocumentLists(listsData);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Error in document lists listener:', error);
          
          if (isPermissionError(error)) {
            setError('Erreur de permissions détectée. Cela peut être dû à des listes de documents sans le champ "createdBy" requis.');
          } else if (error.code === 'unavailable') {
            setError('Service temporairement indisponible. Veuillez réessayer.');
          } else {
            setError(`Erreur lors du chargement: ${error.message}`);
          }
          setLoading(false);
        }
      );

      return () => {
        console.log('Cleaning up document lists listener');
        unsubscribe();
      };
    } catch (error: any) {
      console.error('Error setting up document lists listener:', error);
      
      if (isPermissionError(error)) {
        setError('Erreur de permissions. Vérifiez que toutes vos listes de documents ont le champ "createdBy" requis.');
      } else {
        setError('Erreur lors de l\'initialisation du chargement des listes');
      }
      setLoading(false);
    }
  }, [user]);

  const filteredLists = documentLists.filter(list => {
    const matchesSearch = list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         list.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || list.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: DocumentList['category']) => {
    switch (category) {
      case 'location':
        return 'bg-blue-100 text-blue-800';
      case 'achat':
        return 'bg-green-100 text-green-800';
      case 'credit':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: DocumentList['category']) => {
    switch (category) {
      case 'location':
        return 'Location';
      case 'achat':
        return 'Achat';
      case 'credit':
        return 'Crédit';
      default:
        return 'Autre';
    }
  };

  const handleDuplicate = async (list: DocumentList) => {
    if (!user) return;

    setActionLoading(`duplicate-${list.id}`);

    try {
      console.log('Duplicating list:', list.id, 'for user:', user.uid);

      const duplicatedList = {
        name: `${list.name} (Copie)`,
        description: list.description,
        category: list.category,
        documents: [...list.documents], // Create a deep copy of documents array
        isTemplate: list.isTemplate,
        usageCount: 0,
        createdBy: user.uid, // Ensure the current user is the owner
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'documentLists'), duplicatedList);
      console.log('List duplicated successfully with ID:', docRef.id);
      
      // Show success feedback
      alert('Liste dupliquée avec succès !');
      
    } catch (error: any) {
      console.error('Error duplicating list:', error);
      
      if (error.code === 'permission-denied') {
        alert('Permissions insuffisantes pour dupliquer cette liste');
      } else {
        alert('Erreur lors de la duplication de la liste. Veuillez réessayer.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (listId: string) => {
    // For now, we'll show an alert. In a real app, this would open an edit modal
    alert(`Fonctionnalité d'édition en cours de développement pour la liste ${listId}`);
  };

  const handleDelete = async (listId: string, listName: string) => {
    if (!user) return;

    // Double confirmation for delete
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer la liste "${listName}" ?\n\nCette action est irréversible.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setActionLoading(`delete-${listId}`);

    try {
      console.log('Deleting list:', listId, 'for user:', user.uid);
      
      // Verify ownership before deletion
      const listToDelete = documentLists.find(list => list.id === listId);
      if (!listToDelete || listToDelete.createdBy !== user.uid) {
        throw new Error('Vous ne pouvez supprimer que vos propres listes');
      }

      await deleteDoc(doc(db, 'documentLists', listId));
      console.log('List deleted successfully');
      
      // Show success feedback
      alert('Liste supprimée avec succès !');
      
    } catch (error: any) {
      console.error('Error deleting list:', error);
      
      if (error.code === 'permission-denied') {
        alert('Permissions insuffisantes pour supprimer cette liste');
      } else {
        alert(`Erreur lors de la suppression: ${error.message}`);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSampleLists = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await createSampleDocumentLists(user.uid);
      console.log('Sample lists created successfully');
    } catch (error) {
      console.error('Error creating sample lists:', error);
      setError('Erreur lors de la création des listes d\'exemple');
    } finally {
      setLoading(false);
    }
  };

  const handleListCreated = (newList: DocumentList) => {
    console.log('New list created:', newList);
    // The real-time listener will automatically update the list
    setIsNewListModalOpen(false);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Re-trigger the useEffect by updating a dependency
    window.location.reload();
  };

  // Check if user can perform actions on a list
  const canPerformActions = (list: DocumentList) => {
    return user && list.createdBy === user.uid;
  };

  // Manual cleanup function for problematic lists
  const handleManualCleanup = async () => {
    if (!user) return;

    const confirmed = confirm('Voulez-vous supprimer tous les dossiers dupliqués problématiques ?');
    if (!confirmed) return;

    setActionLoading('cleanup');

    try {
      await cleanupProblematicLists();
      alert('Nettoyage terminé avec succès !');
    } catch (error) {
      console.error('Error during manual cleanup:', error);
      alert('Erreur lors du nettoyage');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des listes de documents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isPermissionIssue = error.includes('permissions') || error.includes('createdBy');

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                {isPermissionIssue ? '🔒 Erreur de permissions' : 'Erreur de chargement'}
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              
              {isPermissionIssue && (
                <div className="bg-red-100 rounded-md p-4 mb-4">
                  <h4 className="font-medium text-red-800 mb-2">🔧 Solution recommandée :</h4>
                  <p className="text-red-700 text-sm mb-3">
                    Certaines listes de documents n'ont pas le champ 'createdBy' requis. 
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
          <h1 className="text-2xl font-bold text-gray-900">Listes de documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Créez et gérez vos modèles de documents pour différents types de dossiers ({documentLists.length} liste{documentLists.length !== 1 ? 's' : ''})
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleManualCleanup}
            disabled={actionLoading === 'cleanup'}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors duration-200 disabled:opacity-50"
          >
            {actionLoading === 'cleanup' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Nettoyer
          </button>
          
          <button
            onClick={() => setIsNewListModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle liste
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une liste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lists Grid */}
      {documentLists.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune liste de documents</h3>
          <p className="text-gray-500 mb-6">
            Commencez par créer votre première liste de documents ou utilisez nos modèles prédéfinis.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsNewListModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer une liste
            </button>
            <button
              onClick={handleCreateSampleLists}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
            >
              <FileText className="w-5 h-5 mr-2" />
              Créer des exemples
            </button>
          </div>
        </div>
      ) : filteredLists.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune liste trouvée</h3>
          <p className="text-gray-500 mb-6">
            Aucune liste ne correspond à vos critères de recherche.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
          >
            Effacer les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLists.map((list) => (
            <div
              key={list.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {list.name}
                      </h3>
                      {list.isTemplate && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Modèle
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(list.category)}`}>
                      {getCategoryLabel(list.category)}
                    </span>
                  </div>
                  
                  {/* Action buttons - only show if user can perform actions */}
                  {canPerformActions(list) && (
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => handleDuplicate(list)}
                        disabled={actionLoading === `duplicate-${list.id}`}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Dupliquer"
                      >
                        {actionLoading === `duplicate-${list.id}` ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(list.id)}
                        disabled={actionLoading?.startsWith('delete-') || actionLoading?.startsWith('duplicate-')}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(list.id, list.name)}
                        disabled={actionLoading === `delete-${list.id}`}
                        className="p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Supprimer"
                      >
                        {actionLoading === `delete-${list.id}` ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {list.description}
                </p>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Documents ({list.documents.length})
                    </p>
                    <div className="space-y-1">
                      {list.documents.slice(0, 3).map((doc, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <FileText className="w-3 h-3 mr-2 text-gray-400" />
                          <span className="truncate">{doc.name}</span>
                          {doc.required && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </div>
                      ))}
                      {list.documents.length > 3 && (
                        <p className="text-xs text-gray-500 ml-5">
                          +{list.documents.length - 3} autres documents
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{list.usageCount} utilisations</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(list.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <Link
                    to={`/lists/${list.id}`}
                    className="flex items-center justify-center w-full px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
                  >
                    Voir les détails
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewDocumentListModal
        isOpen={isNewListModalOpen}
        onClose={() => setIsNewListModalOpen(false)}
        onListCreated={handleListCreated}
      />
    </div>
  );
};

export default DocumentLists;