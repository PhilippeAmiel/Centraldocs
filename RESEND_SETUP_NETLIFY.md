# 🔑 Ajouter RESEND_API_KEY dans Netlify

## 🚀 Étapes rapides (5 minutes)

### 1. 📝 Créer un compte Resend

1. **Allez sur [resend.com](https://resend.com)**
2. **Cliquez sur "Sign up"**
3. **Créez votre compte** avec votre email
4. **Vérifiez votre email** de confirmation

### 2. 🔑 Obtenir votre clé API

1. **Dans le dashboard Resend**
2. **Cliquez sur "API Keys"** dans le menu
3. **Cliquez sur "Create API Key"**
4. **Nom :** `CentralDocs Production`
5. **Copiez la clé** (commence par `re_...`)

### 3. ⚙️ Ajouter dans Netlify

1. **Dans votre site Netlify**
2. **Allez dans "Site settings"**
3. **Cliquez sur "Environment variables"**
4. **Cliquez sur "Add a variable"**
5. **Remplissez :**
   - **Key :** `RESEND_API_KEY`
   - **Value :** `re_votre_cle_copiee`
   - **Scopes :** Cochez "All scopes"
6. **Cliquez sur "Create variable"**

### 4. 🔄 Redéployer

1. **Dans Netlify > Deploys**
2. **Cliquez sur "Trigger deploy"**
3. **Sélectionnez "Deploy site"**
4. **Attendez le déploiement** (2-3 minutes)

### 5. ✅ Tester les emails

1. **Ouvrez votre application CentralDocs**
2. **Créez une nouvelle demande**
3. **Cliquez sur "Envoyer par email"**
4. **Vérifiez que l'email est envoyé !** 🎉

## 🎯 Résultat attendu

### Sans RESEND_API_KEY :
- ⚠️ **Mode simulation** : Emails simulés dans la console
- ✅ **Application fonctionne** mais pas d'emails réels

### Avec RESEND_API_KEY :
- ✅ **Emails réels** envoyés via Resend
- ✅ **Design professionnel** avec identifiants
- ✅ **Délivrabilité optimale** (99%+ en boîte principale)
- ✅ **Tracking** dans le dashboard Resend

## 💰 Tarification Resend

- **🆓 Gratuit :** 3000 emails/mois
- **💼 Pro :** 10$/mois pour 50k emails

Pour CentralDocs, le plan gratuit est largement suffisant !

## 🚨 Dépannage

### Erreur "API key invalid"
- Vérifiez que la clé commence par `re_`
- Assurez-vous qu'elle est bien copiée dans Netlify
- Redéployez après avoir ajouté la variable

### Emails non reçus
- Vérifiez les dossiers spam/indésirables
- Consultez les logs dans le dashboard Resend
- Vérifiez que le domaine est configuré

### Mode simulation persistant
- Vérifiez que `RESEND_API_KEY` est bien définie
- Redéployez l'application après configuration
- Consultez les logs Netlify pour les erreurs

## 🎉 Une fois configuré

Votre système d'email sera **100% opérationnel** :

✅ **Envoi instantané** d'emails professionnels  
✅ **Identifiants automatiques** pour les clients  
✅ **Design moderne** et responsive  
✅ **Tracking complet** dans Resend  
✅ **Fiabilité maximale** 99.9% uptime  

**Votre CentralDocs sera prêt pour la production !** 🚀