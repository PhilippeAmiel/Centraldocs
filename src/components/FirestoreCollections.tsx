import React from 'react';

const FirestoreCollections: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Collections Firestore
      </h2>

      <div className="space-y-8">
        {/* Main Collections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users Collection */}
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Collection: users
            </h3>
            <p className="text-sm text-blue-800 mb-2">Document ID = UID</p>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• email: string</li>
              <li>• role: admin|collaborator|client</li>
              <li>• quotaRemaining: number</li>
              <li>• createdAt: timestamp</li>
            </ul>
          </div>

          {/* Clients Collection */}
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              Collection: clients
            </h3>
            <p className="text-sm text-green-800 mb-2">Document ID = clientId</p>
            <ul className="space-y-1 text-sm text-green-700">
              <li>• name: string</li>
              <li>• email: string</li>
              <li>• phone: string</li>
              <li>• language: string</li>
              <li>• createdAt: timestamp</li>
            </ul>
          </div>

          {/* Requests Collection */}
          <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              Collection: requests
            </h3>
            <p className="text-sm text-purple-800 mb-2">Document ID = requestId</p>
            <ul className="space-y-1 text-sm text-purple-700">
              <li>• clientId: reference</li>
              <li>• proId: reference</li>
              <li>• type: location|achat</li>
              <li>• createdAt: timestamp</li>
              <li>• status: pending|complete|blocked</li>
              <li>• useIA: boolean</li>
              <li>• rules: array</li>
            </ul>
          </div>
        </div>

        {/* Subcollections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Documents Subcollection */}
          <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">
              Subcollection: requests/{'{requestId}'}/documents
            </h3>
            <p className="text-sm text-amber-800 mb-2">Document ID = docId</p>
            <ul className="space-y-1 text-sm text-amber-700">
              <li>• filePath: string</li>
              <li>• fileName: string</li>
              <li>• uploadAt: timestamp</li>
              <li>• status: pending|processing|valid|rejected</li>
              <li>• iaResult: object</li>
              <li>• confidenceScore: number</li>
              <li>• rejectReason: string</li>
            </ul>
          </div>

          {/* Shares Collection */}
          <div className="bg-rose-50 p-6 rounded-lg border-2 border-rose-200">
            <h3 className="text-lg font-semibold text-rose-900 mb-3">
              Collection: shares
            </h3>
            <p className="text-sm text-rose-800 mb-2">Document ID = token (UUID)</p>
            <ul className="space-y-1 text-sm text-rose-700">
              <li>• requestId: reference</li>
              <li>• docIds: array</li>
              <li>• expiresAt: timestamp</li>
              <li>• passwordHash: string|null</li>
              <li>• createdAt: timestamp</li>
              <li>• revoked: boolean</li>
            </ul>
          </div>

          {/* Logs Subcollection */}
          <div className="bg-teal-50 p-6 rounded-lg border-2 border-teal-200">
            <h3 className="text-lg font-semibold text-teal-900 mb-3">
              Subcollection: shares/{'{token}'}/logs
            </h3>
            <p className="text-sm text-teal-800 mb-2">Document ID = logId (auto)</p>
            <ul className="space-y-1 text-sm text-teal-700">
              <li>• action: generated|viewed|expired|revoked</li>
              <li>• timestamp: timestamp</li>
              <li>• ip: string</li>
              <li>• userAgent: string</li>
            </ul>
          </div>
        </div>

        {/* Collection Relationships */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Relations entre collections
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• requests.clientId → clients.clientId</li>
            <li>• requests.proId → users.uid</li>
            <li>• shares.requestId → requests.requestId</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FirestoreCollections;