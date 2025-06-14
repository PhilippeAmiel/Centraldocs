import React, { useState } from 'react';
import { X, Mail, User, FileText, Key, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestData: {
    id: string;
    clientName: string;
    clientEmail: string;
    documentListName?: string;
    requestedDocuments: Array<{
      name: string;
      description?: string;
      required: boolean;
    }>;
  };
  onEmailSent: () => void;
}

const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  requestData,
  onEmailSent
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const [generatedCredentials] = useState({
    email: requestData.clientEmail,
    password: generatePassword()
  });

  const handleSendEmail = async () => {
    setSending(true);
    
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would call an API to send the email
      console.log('Sending email to:', requestData.clientEmail);
      console.log('Generated credentials:', generatedCredentials);
      console.log('Custom message:', customMessage);
      
      onEmailSent();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clientLoginUrl = `${window.location.origin}/client-login`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            Envoyer la demande par email
          </h2>
          <button
            onClick={onClose}
            disabled={sending}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Destinataire
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{requestData.clientName}</p>
                  <p className="text-gray-600">{requestData.clientEmail}</p>
                </div>
              </div>
            </div>

            {/* Generated Credentials */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Key className="w-5 h-5 mr-2 text-blue-600" />
                Identifiants générés automatiquement
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email de connexion
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={generatedCredentials.email}
                      readOnly
                      className="flex-1 p-2 bg-white border border-gray-300 rounded-md text-gray-900"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedCredentials.email)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="Copier l'email"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe temporaire
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={generatedCredentials.password}
                      readOnly
                      className="flex-1 p-2 bg-white border border-gray-300 rounded-md text-gray-900 font-mono"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                      title={showPassword ? 'Masquer' : 'Afficher'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(generatedCredentials.password)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="Copier le mot de passe"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien de connexion
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={clientLoginUrl}
                      readOnly
                      className="flex-1 p-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(clientLoginUrl)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="Copier le lien"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.open(clientLoginUrl, '_blank')}
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="Ouvrir le lien"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Documents demandés ({requestData.requestedDocuments.length})
              </h3>
              
              <div className="space-y-2">
                {requestData.requestedDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded border">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {doc.name}
                        {doc.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      {doc.description && (
                        <p className="text-sm text-gray-500">{doc.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message personnalisé (optionnel)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Ajoutez un message personnalisé qui sera inclus dans l'email..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={sending}
              />
            </div>

            {/* Email Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Aperçu de l'email
              </h3>
              
              <div className="bg-white border border-gray-200 rounded-md p-4 text-sm">
                <div className="border-b border-gray-200 pb-3 mb-3">
                  <p><strong>À :</strong> {requestData.clientEmail}</p>
                  <p><strong>Objet :</strong> Demande de documents - {requestData.documentListName || 'Documents requis'}</p>
                </div>
                
                <div className="space-y-3 text-gray-700">
                  <p>Bonjour {requestData.clientName},</p>
                  
                  <p>
                    Nous avons besoin de certains documents de votre part pour traiter votre dossier 
                    "{requestData.documentListName || 'Documents requis'}".
                  </p>
                  
                  {customMessage && (
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                      <p className="italic">{customMessage}</p>
                    </div>
                  )}
                  
                  <p><strong>Vos identifiants de connexion :</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Email : {generatedCredentials.email}</li>
                    <li>Mot de passe : {generatedCredentials.password}</li>
                    <li>Lien de connexion : {clientLoginUrl}</li>
                  </ul>
                  
                  <p><strong>Documents requis :</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {requestData.requestedDocuments.map((doc, index) => (
                      <li key={index}>
                        {doc.name}
                        {doc.required && <span className="text-red-500"> (obligatoire)</span>}
                        {doc.description && <span className="text-gray-500"> - {doc.description}</span>}
                      </li>
                    ))}
                  </ul>
                  
                  <p>
                    Connectez-vous avec vos identifiants pour téléverser vos documents de manière sécurisée.
                  </p>
                  
                  <p>
                    Cordialement,<br />
                    L'équipe CentralDocs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSendEmail}
            disabled={sending}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Envoyer l'email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendEmailModal;