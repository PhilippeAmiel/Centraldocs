# 🚀 Guide de déploiement Vercel - CentralDocs

## ✅ Étapes de déploiement (5 minutes)

### 1. 🔗 Connecter Vercel à GitHub

1. **Allez sur [vercel.com](https://vercel.com)**
2. **Cliquez sur "Sign up" ou "Log in"**
3. **Connectez-vous avec GitHub**
4. **Autorisez Vercel à accéder à vos repositories**

### 2. 📦 Importer votre projet

1. **Dans le dashboard Vercel, cliquez sur "New Project"**
2. **Trouvez votre repository CentralDocs**
3. **Cliquez sur "Import"**
4. **Vercel détectera automatiquement :**
   - ✅ Configuration `vercel.json`
   - ✅ Backend Node.js dans `/backend`
   - ✅ Frontend React/Vite

### 3. 🔧 Configurer les variables d'environnement

**Dans Vercel > Settings > Environment Variables, ajoutez :**

```
HOSTINGER_EMAIL_PASSWORD = c0ckPvm0y@P
SMTP_HOST = smtp.hostinger.com
SMTP_PORT = 587
SMTP_USER = contact@centraldocs.ai
SMTP_FROM_EMAIL = contact@centraldocs.ai
SMTP_FROM_NAME = CentralDocs
NODE_ENV = production
```

**Important :** 
- ✅ Cochez "Production" pour chaque variable
- ✅ Ne mettez pas de guillemets autour des valeurs
- ✅ Respectez exactement les noms des variables

### 4. 🚀 Déployer

1. **Cliquez sur "Deploy"**
2. **Attendez le déploiement (2-3 minutes)**
3. **Vercel vous donnera une URL comme :**
   ```
   https://centraldocs-email-abc123.vercel.app
   ```

### 5. 🔗 Mettre à jour l'URL du backend

**Dans votre fichier `.env` local :**
```env
VITE_BACKEND_URL=https://votre-url-vercel.vercel.app
```

**Puis redéployez le frontend :**
```bash
git add .env
git commit -m "Update backend URL for production"
git push origin main
```

## 🧪 Test de votre API déployée

### 1. Test de santé
Ouvrez dans votre navigateur :
```
https://votre-url-vercel.vercel.app/health
```

**Réponse attendue :**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "CentralDocs Email Service"
}
```

### 2. Test depuis votre application
1. **Créez une demande** pour un client
2. **Cliquez sur "Envoyer par email"**
3. **Vérifiez les logs** dans Vercel Dashboard > Functions > Logs

## 📊 Monitoring Vercel

### Dashboard Vercel :
- **Functions** : Voir les logs de votre API
- **Analytics** : Métriques de performance
- **Deployments** : Historique des déploiements
- **Settings** : Variables d'environnement

### Logs en temps réel :
```bash
# Installer Vercel CLI (optionnel)
npm i -g vercel

# Voir les logs en temps réel
vercel logs
```

## 🔧 Configuration avancée

### Domaine personnalisé (optionnel) :
1. **Vercel > Settings > Domains**
2. **Ajoutez votre domaine** (ex: api.centraldocs.ai)
3. **Configurez les DNS** selon les instructions Vercel

### Variables d'environnement par environnement :
- **Production** : Variables pour l'URL live
- **Preview** : Variables pour les branches de test
- **Development** : Variables pour le développement local

## ⚠️ Points importants

### Limitations Vercel (plan gratuit) :
- ✅ **10 GB de bande passante/mois** (largement suffisant)
- ✅ **100 GB-heures de calcul/mois** (très généreux)
- ✅ **Fonctions serverless** avec timeout de 10s
- ✅ **Domaines personnalisés** illimités

### Sécurité :
- ✅ **HTTPS automatique** sur toutes les URLs
- ✅ **Variables d'environnement chiffrées**
- ✅ **DDoS protection** intégrée
- ✅ **Rate limiting** configuré dans votre code

## 🎯 Résultat final

Après déploiement, vous aurez :

### ✅ API Backend opérationnelle :
- **URL** : `https://votre-app.vercel.app`
- **Endpoints** :
  - `GET /health` - Santé de l'API
  - `POST /api/send-email` - Envoi d'emails

### ✅ Envoi d'emails réels :
- **Expéditeur** : contact@centraldocs.ai
- **SMTP** : Hostinger configuré
- **Templates** : HTML + texte professionnels
- **Sécurité** : Authentification et rate limiting

### ✅ Monitoring complet :
- **Logs** : Vercel Dashboard
- **Métriques** : Performance et usage
- **Alertes** : Erreurs automatiques

## 🆘 Dépannage

### Problème : Variables d'environnement
**Solution :** Vérifiez dans Vercel > Settings > Environment Variables

### Problème : Timeout des fonctions
**Solution :** Les emails peuvent prendre du temps, c'est normal

### Problème : CORS
**Solution :** Votre backend est configuré pour accepter votre frontend

### Problème : Authentification
**Solution :** Vérifiez que Firebase Auth fonctionne

## 🎉 Félicitations !

Votre backend est maintenant **déployé en production** sur Vercel !

**Avantages de cette configuration :**
- 🚀 **Déploiement automatique** depuis GitHub
- 📧 **Emails réels** via Hostinger SMTP
- 🔒 **Sécurité** enterprise-grade
- 📊 **Monitoring** intégré
- 💰 **Gratuit** pour votre usage
- ⚡ **Performance** optimale avec CDN global

Votre système d'envoi d'emails est maintenant **prêt pour la production** ! 🎯