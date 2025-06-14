import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Save, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (client: any) => void;
}

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
}

const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onClientCreated
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    notes: ''
  });

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('Le prénom est obligatoire');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Le nom est obligatoire');
      return false;
    }
    if (!formData.email.trim()) {
      setError('L\'email est obligatoire');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez saisir un email valide');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vous devez être connecté pour ajouter un client');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare client data for Firestore
      const clientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: {
          street: formData.address.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country
        },
        notes: formData.notes.trim(),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        status: 'active',
        documentsCount: 0,
        pendingDocuments: 0
      };

      console.log('Creating client with data:', clientData);

      // Add client to Firestore
      const docRef = await addDoc(collection(db, 'clients'), clientData);
      
      console.log('Client created successfully with ID:', docRef.id);

      // Create client object with ID for immediate UI update
      const newClient = {
        id: docRef.id,
        ...clientData,
        createdAt: new Date().toISOString()
      };

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'France',
        notes: ''
      });

      // Notify parent component
      onClientCreated(newClient);
      onClose();

    } catch (error: any) {
      console.error('Error creating client:', error);
      
      if (error.code === 'permission-denied') {
        setError('Vous n\'avez pas les permissions pour ajouter un client');
      } else if (error.code === 'network-request-failed') {
        setError('Erreur de connexion. Vérifiez votre connexion internet.');
      } else {
        setError('Une erreur est survenue lors de la création du client. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'France',
        notes: ''
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <User className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              Nouveau client
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Jean"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Dupont"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="jean.dupont@email.com"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <MapPin className="w-5 h-5 inline mr-2" />
                  Adresse
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 rue de la Paix"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Paris"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="75001"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pays
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                      >
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Suisse">Suisse</option>
                        <option value="Luxembourg">Luxembourg</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Informations complémentaires sur le client..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                  disabled={loading}
                />
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
                    Créer le client
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewClientModal;