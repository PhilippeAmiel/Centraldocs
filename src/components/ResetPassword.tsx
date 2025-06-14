import React, { useState } from 'react';
import { Mail, AlertCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Aucun compte trouvé avec cette adresse email');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link 
          to="/" 
          className="flex justify-center text-2xl font-bold text-blue-900 hover:text-blue-700 transition-colors duration-200 mb-8"
        >
          CentralDocs
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Réinitialiser votre mot de passe
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nous vous enverrons un lien par email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 rounded-md">
                <p className="text-sm text-green-700">
                  Un email de réinitialisation a été envoyé à {email}
                </p>
              </div>
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;