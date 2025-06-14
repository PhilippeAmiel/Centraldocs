import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AuthProvider from '../../src/contexts/AuthContext';
import App from './App.tsx';
import './index.css';

// Simple error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur de l'application</h2>
            <p className="text-gray-600 mb-4">
              Une erreur est survenue. Veuillez actualiser la page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
            >
              Actualiser la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('Starting React application...');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);