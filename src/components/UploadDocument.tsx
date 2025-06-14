import React, { useState, useRef, useEffect } from 'react';
import { Upload, Eye, X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

interface UploadDocumentProps {
  requestId: string;
  docId: string;
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
}

interface StoredDocument {
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadURL: string;
  status: 'pending' | 'validating' | 'validated' | 'rejected';
  rejectReason?: string;
}

const UploadDocument: React.FC<UploadDocumentProps> = ({
  requestId,
  docId,
  onFileSelect,
  onFileRemove,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedDocument, setStoredDocument] = useState<StoredDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkExistingDocument = async () => {
      if (!user || !requestId || !docId) return;

      try {
        const docRef = doc(db, "requests", requestId, "documents", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as StoredDocument;
          setStoredDocument(data);
          console.log("Found existing document:", data);
        }
      } catch (error) {
        console.error("Error checking existing document:", error);
      }
    };

    checkExistingDocument();
  }, [user, requestId, docId]);

  const getStatusIcon = (status: StoredDocument['status']) => {
    switch (status) {
      case 'validating':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'validated':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: StoredDocument['status']) => {
    switch (status) {
      case 'validating':
        return 'En cours de validation';
      case 'validated':
        return 'Document validé';
      case 'rejected':
        return 'Document rejeté';
      default:
        return 'En attente de validation';
    }
  };

  const getStatusColor = (status: StoredDocument['status']) => {
    switch (status) {
      case 'validating':
        return 'text-yellow-600';
      case 'validated':
        return 'text-emerald-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!user) {
        setError("Vous devez être connecté pour téléverser des fichiers.");
        return;
      }

      setError(null);
      const selected = e.target.files?.[0];
      if (!selected) return;

      console.log("File selected:", selected.name);

      // Verify file type
      const allowed = ["application/pdf", "image/png", "image/jpeg"];
      if (!allowed.includes(selected.type)) {
        setError("Type de fichier non accepté. Utilisez PDF, PNG ou JPG.");
        return;
      }

      // Verify file size (max 20MB)
      if (selected.size > 20 * 1024 * 1024) {
        setError("Fichier trop volumineux. Maximum 20MB.");
        return;
      }

      setFile(selected);
      setUploading(true);

      // Create preview for images
      if (selected.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selected);
      }

      // Ensure requestId matches the pattern in storage rules
      if (!requestId.startsWith('client_') || !requestId.includes(user.uid)) {
        setError("Format d'identifiant de requête invalide.");
        setUploading(false);
        return;
      }

      // Create unique filename with timestamp to avoid collisions
      const timestamp = Date.now();
      const sanitizedFilename = selected.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFilename = `${timestamp}-${sanitizedFilename}`;
      const storagePath = `requests/${requestId}/docs/${docId}/${uniqueFilename}`;
      
      console.log("Uploading to path:", storagePath);

      // Force refresh the ID token before upload
      await user.getIdToken(true);

      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, selected);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          console.log("Upload progress:", progress);
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setError("Erreur lors du téléversement. Veuillez réessayer.");
          setUploading(false);
          setFile(null);
          setPreview(null);
          setUploadProgress(0);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("File uploaded, URL:", downloadURL);

            const newDocument = {
              fileName: selected.name,
              fileType: selected.type,
              fileSize: selected.size,
              storagePath,
              downloadURL,
              uploadedBy: user.uid,
              uploadedAt: serverTimestamp(),
              status: 'validating' as const
            };

            // Create document reference in the correct subcollection
            const docRef = doc(db, "requests", requestId, "documents", docId);
            await setDoc(docRef, newDocument);

            console.log("Firestore document created successfully");
            setStoredDocument(newDocument);
            setUploading(false);
            onFileSelect(selected);
          } catch (error) {
            console.error("Firestore error:", error);
            setError("Erreur lors de l'enregistrement. Veuillez réessayer.");
            setUploading(false);
            setFile(null);
            setPreview(null);
            setUploadProgress(0);
          }
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
      setUploading(false);
      setFile(null);
      setPreview(null);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fakeEvent = {
        target: {
          files: [droppedFile]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleSelect(fakeEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // If we have a stored document, show it instead of the upload zone
  if (storedDocument) {
    return (
      <div className="mt-4 relative">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{storedDocument.fileName}</p>
                <p className="text-sm text-gray-500">
                  {(storedDocument.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex items-center mt-1">
                  {getStatusIcon(storedDocument.status)}
                  <span className={`text-sm ml-2 ${getStatusColor(storedDocument.status)}`}>
                    {getStatusText(storedDocument.status)}
                  </span>
                </div>
                {storedDocument.status === 'rejected' && storedDocument.rejectReason && (
                  <p className="text-sm text-red-600 mt-1">
                    Motif : {storedDocument.rejectReason}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.open(storedDocument.downloadURL, '_blank')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Voir
              </button>
              <button
                onClick={() => setStoredDocument(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* File Drop Zone */}
      {!file && !uploading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`
            relative cursor-pointer
            border-2 border-dashed rounded-lg p-6
            flex flex-col items-center justify-center
            transition-colors duration-200
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-500 bg-gray-50'}
          `}
        >
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <div className="text-sm text-center">
            <span className="text-blue-600 hover:text-blue-500">
              Cliquez pour sélectionner
            </span>
            <span className="text-gray-500"> ou déposez votre fichier ici</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            PDF, JPG ou PNG jusqu'à 20 MB
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleSelect}
        accept=".pdf,.jpg,.jpeg,.png"
      />

      {/* Upload Progress */}
      {uploading && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Téléversement en cours...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* File Preview */}
      {file && !uploading && (
        <div className="mt-4 relative">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {preview ? (
                  <img
                    src={preview}
                    alt="Aperçu"
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <Eye className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setUploadProgress(0);
                  setError(null);
                  onFileRemove?.();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDocument;