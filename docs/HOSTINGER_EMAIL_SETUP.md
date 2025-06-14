# Configuration Email avec Hostinger pour CentralDocs.ai

## ✅ Configuration actuelle : contact@centraldocs.ai

### Informations de connexion :
- **Adresse email :** contact@centraldocs.ai
- **Mot de passe :** c0ckPvm0y@P
- **Statut :** Créée et configurée dans Hostinger

## 1. Vérification de l'adresse email

### Dans le panneau Hostinger :
1. ✅ Connectez-vous à votre compte Hostinger
2. ✅ Allez dans **"Emails"** > **"Comptes email"**
3. ✅ Vérifiez que `contact@centraldocs.ai` est créée
4. ✅ Mot de passe configuré : `c0ckPvm0y@P`

## 2. Configuration SMTP

### Paramètres SMTP Hostinger :
```
Serveur SMTP : smtp.hostinger.com
Port : 587 (STARTTLS recommandé) ou 465 (SSL)
Sécurité : STARTTLS ou SSL/TLS
Authentification : Oui
Nom d'utilisateur : contact@centraldocs.ai
Mot de passe : c0ckPvm0y@P
```

## 3. Configuration DNS (SPF/DKIM/DMARC)

### Enregistrements DNS à ajouter :

#### SPF (Sender Policy Framework) :
```
Type : TXT
Nom : @
Valeur : v=spf1 include:_spf.hostinger.com ~all
```

#### DKIM (DomainKeys Identified Mail) :
- Généralement configuré automatiquement par Hostinger
- Vérifiez dans votre panneau email si DKIM est activé

#### DMARC (Domain-based Message Authentication) :
```
Type : TXT
Nom : _dmarc
Valeur : v=DMARC1; p=quarantine; rua=mailto:contact@centraldocs.ai
```

## 4. Variables d'environnement

### Créez un fichier `.env` avec :
```env
# Configuration Email Hostinger - contact@centraldocs.ai
HOSTINGER_EMAIL_PASSWORD=c0ckPvm0y@P
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@centraldocs.ai
SMTP_FROM_EMAIL=contact@centraldocs.ai
SMTP_FROM_NAME=CentralDocs
```

## 5. Backend API requis

### Vous devez créer une API backend pour envoyer les emails :

#### Installation des dépendances :
```bash
npm install nodemailer express cors helmet
```

#### Exemple de serveur Express :
```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Configuration du transporteur email
const transporter = nodemailer.createTransporter({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false, // true pour 465, false pour autres ports
  auth: {
    user: 'contact@centraldocs.ai',
    pass: 'c0ckPvm0y@P'
  }
});

// Endpoint pour envoyer un email
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    
    // Validation des données
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Données manquantes : to, subject, html requis' 
      });
    }
    
    // Configuration de l'email
    const mailOptions = {
      from: '"CentralDocs" <contact@centraldocs.ai>',
      to: to,
      subject: subject,
      html: html,
      text: text || 'Version texte non disponible'
    };
    
    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email envoyé:', info.messageId);
    res.json({ 
      success: true, 
      messageId: info.messageId 
    });
    
  } catch (error) {
    console.error('Erreur envoi email:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'envoi de l\'email',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur email démarré sur le port ${PORT}`);
});
```

## 6. Test de la configuration

### Test simple avec nodemailer :
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false,
  auth: {
    user: 'contact@centraldocs.ai',
    pass: 'c0ckPvm0y@P'
  }
});

// Test de connexion
transporter.verify((error, success) => {
  if (error) {
    console.log('Erreur de configuration:', error);
  } else {
    console.log('Serveur prêt à envoyer des emails');
  }
});

// Test d'envoi
const testEmail = {
  from: '"CentralDocs" <contact@centraldocs.ai>',
  to: 'votre-email-test@example.com',
  subject: 'Test CentralDocs',
  text: 'Email de test depuis Hostinger',
  html: '<h1>Test réussi !</h1><p>Email envoyé depuis contact@centraldocs.ai.</p>'
};

transporter.sendMail(testEmail, (error, info) => {
  if (error) {
    console.log('Erreur:', error);
  } else {
    console.log('Email envoyé:', info.messageId);
  }
});
```

## 7. Avantages de contact@centraldocs.ai

### ✅ Pourquoi contact@ est meilleur que noreply@ :
- **Professionnel :** Plus crédible et professionnel
- **Interactif :** Les clients peuvent répondre directement
- **Délivrabilité :** Meilleure réputation auprès des fournisseurs email
- **Support :** Facilite le support client
- **Conformité :** Respecte les bonnes pratiques email marketing

## 8. Sécurité et bonnes pratiques

### Recommandations :
- ✅ Mot de passe fort configuré
- ✅ Activez l'authentification à deux facteurs sur Hostinger
- ✅ Configurez SPF, DKIM et DMARC
- ✅ Utilisez HTTPS pour votre API
- ✅ Implémentez un rate limiting
- ✅ Loggez les envois d'emails
- ✅ Validez toutes les entrées utilisateur
- ✅ Utilisez des variables d'environnement pour les secrets

### Monitoring :
- Surveillez les bounces et les plaintes
- Vérifiez régulièrement la réputation de votre domaine
- Utilisez des outils comme MXToolbox pour tester votre configuration

## 9. Déploiement

### Variables d'environnement en production :
```env
NODE_ENV=production
HOSTINGER_EMAIL_PASSWORD=c0ckPvm0y@P
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@centraldocs.ai
SMTP_FROM_EMAIL=contact@centraldocs.ai
SMTP_FROM_NAME=CentralDocs
```

## 10. Support et contact

### Configuration du support :
- **Email principal :** contact@centraldocs.ai
- **Réponses automatiques :** Configurées
- **Signature :** CentralDocs - Gestion documentaire sécurisée

### Messages types :
```
Merci pour votre message. Nous vous répondrons dans les plus brefs délais.

Pour une assistance immédiate :
• Site web : https://centraldocs.ai
• Documentation : https://docs.centraldocs.ai

Cordialement,
L'équipe CentralDocs
```

## Support

Si vous rencontrez des problèmes :
1. Vérifiez la documentation Hostinger
2. Contactez le support Hostinger
3. Testez avec un client email comme Thunderbird
4. Utilisez des outils de test SMTP en ligne
5. Vérifiez les logs du serveur SMTP