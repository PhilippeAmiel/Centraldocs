# Firebase Security Rules

## Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }

    // Clients collection - SIMPLIFIED RULES
    match /clients/{clientId} {
      // Allow read/write if user created the client
      allow read, write: if isAuthenticated() && 
        resource.data.createdBy == request.auth.uid;
      // Allow create if user is setting themselves as creator
      allow create: if isAuthenticated() && 
        request.resource.data.createdBy == request.auth.uid;
    }

    // Requests collection - SIMPLIFIED RULES
    match /requests/{requestId} {
      // Allow access if user is the professional (createdBy or professionalId) or the client
      allow read, write: if isAuthenticated() && 
        (
          resource.data.createdBy == request.auth.uid ||
          resource.data.professionalId == request.auth.uid ||
          resource.data.clientId == request.auth.uid ||
          requestId.matches('client_' + request.auth.uid + '.*')
        );
      
      // Allow create with proper ownership
      allow create: if isAuthenticated() && 
        (
          request.resource.data.createdBy == request.auth.uid ||
          request.resource.data.professionalId == request.auth.uid ||
          request.resource.data.clientId == request.auth.uid ||
          requestId.matches('client_' + request.auth.uid + '.*')
        );

      // Documents subcollection - SIMPLIFIED RULES
      match /documents/{documentId} {
        // Allow access if user has access to parent request
        allow read, write: if isAuthenticated() && 
          (
            get(/databases/$(database)/documents/requests/$(requestId)).data.createdBy == request.auth.uid ||
            get(/databases/$(database)/documents/requests/$(requestId)).data.professionalId == request.auth.uid ||
            get(/databases/$(database)/documents/requests/$(requestId)).data.clientId == request.auth.uid
          );
      }
    }

    // Document Lists collection
    match /documentLists/{listId} {
      allow read, write: if isAuthenticated() && 
        resource.data.createdBy == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.createdBy == request.auth.uid;
    }

    // Shares collection
    match /shares/{shareId} {
      allow read, write: if isAuthenticated() && 
        resource.data.createdBy == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.createdBy == request.auth.uid;
    }
  }
}
```

## Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /requests/{requestId}/docs/{docId}/{fileName} {
      allow read, write: if request.auth != null &&
        (
          requestId.matches('client_' + request.auth.uid + '.*') ||
          (
            exists(/databases/$(database)/documents/requests/$(requestId)) &&
            (
              get(/databases/$(database)/documents/requests/$(requestId)).data.createdBy == request.auth.uid ||
              get(/databases/$(database)/documents/requests/$(requestId)).data.professionalId == request.auth.uid ||
              get(/databases/$(database)/documents/requests/$(requestId)).data.clientId == request.auth.uid
            )
          )
        );
    }
  }
}
```

## Collections Structure

### clients
```javascript
{
  firstName: string,
  lastName: string,
  fullName: string,
  email: string,
  phone?: string,
  address?: {
    street: string,
    city: string,
    postalCode: string,
    country: string
  },
  notes?: string,
  createdBy: string, // user UID
  createdAt: timestamp,
  lastUpdated: timestamp,
  status: 'active' | 'inactive',
  documentsCount: number,
  pendingDocuments: number
}
```

### requests
```javascript
{
  clientId: string, // client UID or client document ID
  professionalId: string, // professional user UID
  createdBy: string, // user UID who created the request
  type: string,
  status: 'pending' | 'completed' | 'cancelled',
  createdAt: timestamp,
  lastUpdated: timestamp,
  email?: string
}
```

### documentLists
```javascript
{
  name: string,
  description: string,
  category: 'location' | 'achat' | 'credit' | 'autre',
  documents: [
    {
      name: string,
      description?: string,
      required: boolean
    }
  ],
  isTemplate: boolean,
  usageCount: number,
  createdBy: string, // user UID
  createdAt: timestamp,
  lastUpdated: timestamp
}
```

## Instructions pour appliquer les règles

1. **Copiez les règles Firestore** dans la console Firebase :
   - Allez dans Firebase Console > Firestore Database > Rules
   - Remplacez le contenu par les règles ci-dessus
   - Cliquez sur "Publier"

2. **Copiez les règles Storage** dans la console Firebase :
   - Allez dans Firebase Console > Storage > Rules
   - Remplacez le contenu par les règles ci-dessus
   - Cliquez sur "Publier"

3. **Vérifiez que tous vos documents ont les champs requis** :
   - `createdBy` : UID de l'utilisateur qui a créé le document
   - `professionalId` : UID du professionnel (pour les requests)
   - `clientId` : UID ou ID du client (pour les requests)

## Dépannage

Si vous continuez à avoir des erreurs de permissions :

1. **Vérifiez les données** : Assurez-vous que tous vos documents ont les champs `createdBy`, `professionalId`, et `clientId` appropriés
2. **Testez les règles** : Utilisez le simulateur de règles dans la console Firebase
3. **Vérifiez l'authentification** : Assurez-vous que l'utilisateur est bien connecté
4. **Consultez les logs** : Regardez les logs Firestore pour des détails sur les erreurs de permissions