import React, { useState } from 'react';
import { X, Copy, Mail, Calendar, Lock } from 'lucide-react';

interface ShareRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: { id: string; name: string }[];
}

const ShareRequestModal: React.FC<ShareRequestModalProps> = ({
  isOpen,
  onClose,
  documents,
}) => {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [expiryDays, setExpiryDays] = useState('7');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

  if (!isOpen) return null;

  const handleGenerateLink = () => {
    // In a real app, this would call an API to generate the link
    const dummyLink = `https://centraldocs.io/share/${Math.random().toString(36).substring(7)}`;
    setGeneratedLink(dummyLink);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to send the email
    setShowEmailForm(false);
    setRecipientEmail('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Partager ce dossier en toute sécurité
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Sélectionnez les documents à inclure, définissez une date d'expiration et protégez-le par mot de passe si vous le souhaitez.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Documents à partager
            </h3>
            <div className="space-y-2">
              {documents.map((doc) => (
                <label
                  key={doc.id}
                  className="flex items-center space-x-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDocs([...selectedDocs, doc.id]);
                      } else {
                        setSelectedDocs(selectedDocs.filter(id => id !== doc.id));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-gray-700">{doc.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-900 mb-3">
              Durée de validité
            </label>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="2">2 jours</option>
                <option value="7">7 jours</option>
                <option value="30">30 jours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isPasswordProtected}
                onChange={(e) => setIsPasswordProtected(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="text-lg font-medium text-gray-900">
                Protéger par mot de passe
              </span>
            </label>
            {isPasswordProtected && (
              <div className="mt-3 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8-12 caractères"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  minLength={8}
                  maxLength={12}
                />
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerateLink}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
            >
              Générer le lien sécurisé
            </button>
          </div>

          {generatedLink && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="block w-full bg-gray-50 rounded-md border-gray-300"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              {!showEmailForm ? (
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="flex items-center justify-center w-full px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Envoyer par email
                </button>
              ) : (
                <form onSubmit={handleSendEmail} className="space-y-3">
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Adresse email du professionnel"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
                  >
                    Envoyer
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareRequestModal;