# 🚀 Guide de configuration Resend pour CentralDocs

## ✅ Pourquoi Resend ?

- **Ultra-simple** : 3 lignes de code vs 50+ avec SMTP
- **Gratuit** : 3000 emails/mois (largement suffisant)
- **Fiable** : 99.9% de délivrabilité
- **Rapide** : Configuration en 5 minutes
- **Moderne** : API REST, pas de SMTP

## 🔧 Configuration en 5 étapes

### 1. 📝 Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Cliquez sur "Sign up"
3. Créez votre compte avec votre email
4. Vérifiez votre email

### 2. 🔑 Obtenir votre clé API

1. Dans le dashboard Resend
2. Allez dans **"API Keys"**
3. Cliquez sur **"Create API Key"**
4. Donnez un nom : "CentralDocs Production"
5. Copiez la clé (commence par `re_...`)

### 3. 🌐 Configurer Vercel

1. Dans votre projet Vercel
2. Allez dans **Settings > Environment Variables**
3. Ajoutez une nouvelle variable :
   - **Name** : `RESEND_API_KEY`
   - **Value** : `re_votre_cle_copiee`
   - **Environment** : Production, Preview, Development
4. Cliquez sur **"Save"**
5. **Redéployez** votre application

### 4. ✅ Vérifier votre domaine (Optionnel mais recommandé)

1. Dans Resend > **"Domains"**
2. Cliquez sur **"Add Domain"**
3. Entrez : `centraldocs.ai`
4. Configurez les enregistrements DNS :
   ```
   Type: TXT
   Name: @
   Value: [fourni par Resend]
   
   Type: CNAME
   Name: resend._domainkey
   Value: [fourni par Resend]
   ```
5. Attendez la vérification (quelques minutes)

### 5. 🧪 Tester la configuration

1. Dans votre application CentralDocs
2. Créez une nouvelle demande
3. Cliquez sur **"Envoyer par email"**
4. Vérifiez que l'email est bien envoyé !

## 📊 Tableau de bord Resend

Une fois configuré, vous aurez accès à :

- **📈 Analytics** : Taux d'ouverture, clics, bounces
- **📧 Logs** : Historique de tous les emails envoyés
- **🔍 Debugging** : Détails des erreurs d'envoi
- **📊 Quotas** : Suivi de votre utilisation

## 🚨 Dépannage

### Erreur "API key invalid"
- Vérifiez que la clé commence par `re_`
- Assurez-vous qu'elle est bien copiée dans Vercel
- Redéployez après avoir ajouté la variable

### Emails non reçus
- Vérifiez les dossiers spam/indésirables
- Vérifiez que le domaine est vérifié dans Resend
- Consultez les logs dans le dashboard Resend

### Mode simulation persistant
- Vérifiez que `RESEND_API_KEY` est bien définie
- Redéployez l'application après configuration
- Consultez les logs Vercel pour les erreurs

## 💰 Tarification Resend

- **Gratuit** : 3000 emails/mois
- **Pro** : 10$/mois pour 50k emails
- **Business** : 20$/mois pour 100k emails

Pour CentralDocs, le plan gratuit est largement suffisant !

## 🎯 Résultat final

Une fois configuré, vos emails :

✅ **Sont envoyés instantanément** via Resend  
✅ **Arrivent en boîte principale** (pas en spam)  
✅ **Ont un design professionnel** avec votre branding  
✅ **Incluent les identifiants** de connexion client  
✅ **Sont trackés** dans le dashboard Resend  

**Votre système d'email sera opérationnel en 5 minutes !** 🚀