"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCreateUser = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
/**
 * Crée la fiche Firestore /users/{uid} + ajoute le claim "role"
 * dès qu'un compte est créé dans Authentication.
 */
exports.onCreateUser = functions.auth.user().onCreate(async (user) => {
    // 1) Définit le rôle par défaut
    const role = 'client'; // mets 'admin' si tu crées des pros manuellement
    // 2) Écrit le document /users/{uid}
    await admin
        .firestore()
        .doc(`users/${user.uid}`)
        .set({
        email: user.email,
        role,
        quotaRemaining: role === 'client' ? 0 : 100,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // 3) Ajoute le claim personnalisé
    await admin.auth().setCustomUserClaims(user.uid, { role });
    console.log(`➡️ Utilisateur ${user.email} enregistré avec le rôle ${role}`);
});
//# sourceMappingURL=index.js.map