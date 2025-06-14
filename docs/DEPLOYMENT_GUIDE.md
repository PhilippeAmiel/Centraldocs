# Guide de déploiement Backend CentralDocs

## 🎯 Options de déploiement

### 1. 🚀 Vercel (Recommandé - Gratuit)

#### Avantages :
- ✅ **Gratuit** pour les projets personnels
- ✅ **Déploiement automatique** depuis GitHub
- ✅ **Serverless** - pas de gestion de serveur
- ✅ **SSL automatique** et CDN global
- ✅ **Variables d'environnement** sécurisées

#### Étapes de déploiement :

1. **Préparer le repository :**
   ```bash
   git add .
   git commit -m "Add backend for email service"
   git push origin main
   ```

2. **Déployer sur Vercel :**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez votre compte GitHub
   - Importez votre repository
   - Vercel détectera automatiquement le `vercel.json`

3. **Configurer les variables d'environnement :**
   Dans le dashboard Vercel > Settings > Environment Variables :
   ```
   HOSTINGER_EMAIL_PASSWORD = c0ckPvm0y@P
   SMTP_HOST = smtp.hostinger.com
   SMTP_PORT = 587
   SMTP_USER = contact@centraldocs.ai
   SMTP_FROM_EMAIL = contact@centraldocs.ai
   SMTP_FROM_NAME = CentralDocs
   NODE_ENV = production
   ```

4. **Redéployer :**
   - Cliquez sur "Redeploy" dans Vercel
   - Votre API sera disponible sur `https://votre-app.vercel.app`

### 2. 🚂 Railway (Alternative - Payant)

#### Avantages :
- ✅ **Serveur persistant** (non serverless)
- ✅ **Base de données** intégrée si besoin
- ✅ **Logs en temps réel**
- ✅ **Scaling automatique**

#### Étapes de déploiement :

1. **Créer un compte Railway :**
   - Allez sur [railway.app](https://railway.app)
   - Connectez votre GitHub

2. **Déployer :**
   - Cliquez sur "New Project"
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez votre repository
   - Railway détectera automatiquement Node.js

3. **Variables d'environnement :**
   Dans Railway > Variables :
   ```
   HOSTINGER_EMAIL_PASSWORD=c0ckPvm0y@P
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=587
   SMTP_USER=contact@centraldocs.ai
   SMTP_FROM_EMAIL=contact@centraldocs.ai
   SMTP_FROM_NAME=CentralDocs
   NODE_ENV=production
   PORT=3001
   ```

### 3. 🌊 DigitalOcean App Platform

#### Avantages :
- ✅ **Contrôle total** sur l'infrastructure
- ✅ **Scaling manuel** et automatique
- ✅ **Monitoring** avancé
- ✅ **Intégration** avec d'autres services DO

#### Étapes de déploiement :

1. **Créer une App :**
   - Connectez-vous à DigitalOcean
   - Allez dans "Apps" > "Create App"
   - Connectez votre repository GitHub

2. **Configuration :**
   - Source : GitHub repository
   - Branch : main
   - Autodeploy : Activé
   - Build command : `cd backend && npm install`
   - Run command : `cd backend && npm start`

3. **Variables d'environnement :**
   ```
   HOSTINGER_EMAIL_PASSWORD=c0ckPvm0y@P
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=587
   SMTP_USER=contact@centraldocs.ai
   SMTP_FROM_EMAIL=contact@centraldocs.ai
   SMTP_FROM_NAME=CentralDocs
   NODE_ENV=production
   ```

### 4. 🐳 Docker + VPS (Avancé)

#### Pour un contrôle total :

1. **Build l'image Docker :**
   ```bash
   cd backend
   docker build -t centraldocs-email .
   ```

2. **Déployer sur un VPS :**
   ```bash
   # Sur votre VPS
   docker run -d \
     --name centraldocs-email \
     -p 3001:3001 \
     -e HOSTINGER_EMAIL_PASSWORD=c0ckPvm0y@P \
     -e SMTP_HOST=smtp.hostinger.com \
     -e SMTP_PORT=587 \
     -e SMTP_USER=contact@centraldocs.ai \
     -e SMTP_FROM_EMAIL=contact@centraldocs.ai \
     -e SMTP_FROM_NAME=CentralDocs \
     -e NODE_ENV=production \
     centraldocs-email
   ```

## 🔧 Configuration du frontend

### Mettre à jour EmailService.ts :

```typescript
// Dans src/services/emailService.ts
private static readonly BACKEND_URL = import.meta.env.PROD 
  ? 'https://votre-app.vercel.app' // URL de votre backend déployé
  : 'http://localhost:3001';
```

### Variables d'environnement frontend (.env) :

```env
# URL du backend en production
VITE_BACKEND_URL=https://votre-app.vercel.app
```

## 🧪 Test de l'API déployée

### 1. Test de santé :
```bash
curl https://votre-app.vercel.app/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "CentralDocs Email Service"
}
```

### 2. Test d'envoi d'email :
```bash
curl -X POST https://votre-app.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer votre-token-firebase" \
  -d '{
    "to": {
      "email": "test@example.com",
      "name": "Test User"
    },
    "subject": "Test depuis production",
    "html": "<h1>Test réussi !</h1>",
    "credentials": {
      "email": "test@example.com",
      "password": "testpass123"
    }
  }'
```

## 📊 Monitoring et logs

### Vercel :
- Dashboard > Functions > Logs
- Monitoring automatique des erreurs
- Métriques de performance

### Railway :
- Dashboard > Deployments > Logs
- Métriques en temps réel
- Alertes automatiques

### DigitalOcean :
- App Platform > Runtime Logs
- Insights et métriques
- Alertes personnalisées

## 🔒 Sécurité en production

### Variables d'environnement sécurisées :
- ✅ **Jamais** de secrets dans le code
- ✅ **Rotation** régulière des mots de passe
- ✅ **Accès limité** aux variables d'environnement
- ✅ **Chiffrement** des données sensibles

### Rate limiting :
- ✅ **10 emails/15min** par IP
- ✅ **Protection** contre le spam
- ✅ **Logs** des tentatives suspectes

### Authentification :
- ✅ **Tokens Firebase** requis
- ✅ **Validation** des permissions
- ✅ **Audit trail** des envois

## 🎯 Recommandation finale

**Pour CentralDocs, je recommande Vercel :**

### Pourquoi Vercel ?
- 🆓 **Gratuit** pour votre usage
- ⚡ **Déploiement instantané** depuis GitHub
- 🔒 **Sécurité** intégrée (HTTPS, DDoS protection)
- 📈 **Scaling automatique** selon la demande
- 🌍 **CDN global** pour de meilleures performances
- 🔧 **Intégration parfaite** avec votre frontend

### Étapes rapides :
1. Push votre code sur GitHub
2. Connectez Vercel à votre repo
3. Ajoutez les variables d'environnement
4. Déployez en 1 clic !

Votre API sera disponible sur une URL comme :
`https://centraldocs-email.vercel.app`

## 🆘 Support

En cas de problème :
1. **Vérifiez les logs** de la plateforme choisie
2. **Testez localement** d'abord avec `npm run dev`
3. **Vérifiez les variables** d'environnement
4. **Contactez le support** de la plateforme si nécessaire

Votre backend sera opérationnel et prêt à envoyer de vrais emails via Hostinger ! 🚀