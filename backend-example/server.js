// Exemple de serveur backend pour l'envoi d'emails via Hostinger
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limite de 10 emails par 15 minutes par IP
  message: 'Trop d\'emails envoyés, veuillez réessayer plus tard.'
});

// Configuration du transporteur email Hostinger - contact@centraldocs.ai
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true pour 465, false pour autres ports
  auth: {
    user: process.env.SMTP_USER || 'contact@centraldocs.ai',
    pass: process.env.HOSTINGER_EMAIL_PASSWORD || 'c0ckPvm0y@P'
  },
  // Options supplémentaires pour la fiabilité
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5
});

// Vérification de la configuration au démarrage
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erreur de configuration SMTP:', error);
  } else {
    console.log('✅ Serveur SMTP prêt à envoyer des emails depuis contact@centraldocs.ai');
  }
});

// Middleware d'authentification simple (à améliorer en production)
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }
  
  // En production, vérifiez le token Firebase ou JWT
  const token = authHeader.substring(7);
  
  // Validation basique (à remplacer par une vraie validation)
  if (!token || token.length < 10) {
    return res.status(401).json({ error: 'Token invalide' });
  }
  
  next();
};

// Endpoint pour envoyer un email de demande de documents
app.post('/api/send-email', emailLimiter, authenticateRequest, async (req, res) => {
  try {
    const { 
      from, 
      to, 
      subject, 
      html, 
      text, 
      credentials, 
      requestData, 
      customMessage 
    } = req.body;
    
    // Validation des données requises
    if (!to || !to.email || !to.name) {
      return res.status(400).json({ 
        error: 'Destinataire manquant (email et nom requis)' 
      });
    }
    
    if (!subject || !html) {
      return res.status(400).json({ 
        error: 'Sujet et contenu HTML requis' 
      });
    }
    
    if (!credentials || !credentials.email || !credentials.password) {
      return res.status(400).json({ 
        error: 'Identifiants client manquants' 
      });
    }
    
    // Configuration de l'email
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'CentralDocs'}" <${process.env.SMTP_FROM_EMAIL || 'contact@centraldocs.ai'}>`,
      to: `"${to.name}" <${to.email}>`,
      subject: subject,
      html: html,
      text: text || 'Version texte non disponible',
      // Headers personnalisés
      headers: {
        'X-Mailer': 'CentralDocs v1.0',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Reply-To': 'contact@centraldocs.ai'
      }
    };
    
    // Log de l'envoi (sans les données sensibles)
    console.log(`📧 Envoi d'email à ${to.email} depuis contact@centraldocs.ai - Sujet: ${subject}`);
    
    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    
    // Log de succès
    console.log(`✅ Email envoyé avec succès depuis contact@centraldocs.ai - ID: ${info.messageId}`);
    
    // Réponse de succès
    res.json({ 
      success: true, 
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
      from: 'contact@centraldocs.ai'
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi d\'email:', error);
    
    // Gestion des erreurs spécifiques
    let errorMessage = 'Erreur lors de l\'envoi de l\'email';
    let statusCode = 500;
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Erreur d\'authentification SMTP - Vérifiez le mot de passe contact@centraldocs.ai';
      statusCode = 401;
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Impossible de se connecter au serveur SMTP Hostinger';
      statusCode = 503;
    } else if (error.code === 'EMESSAGE') {
      errorMessage = 'Format d\'email invalide';
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de test de la configuration
app.get('/api/test-email', authenticateRequest, async (req, res) => {
  try {
    // Test de connexion SMTP
    await transporter.verify();
    
    res.json({ 
      success: true, 
      message: 'Configuration SMTP valide pour contact@centraldocs.ai',
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM_EMAIL
      }
    });
  } catch (error) {
    console.error('❌ Test de configuration échoué:', error);
    res.status(500).json({ 
      error: 'Configuration SMTP invalide pour contact@centraldocs.ai',
      details: error.message 
    });
  }
});

// Endpoint de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'CentralDocs Email Service',
    email: 'contact@centraldocs.ai'
  });
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    timestamp: new Date().toISOString()
  });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Serveur email CentralDocs démarré sur le port ${PORT}`);
  console.log(`📧 Configuration SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  console.log(`📤 Expéditeur: contact@centraldocs.ai`);
  console.log(`🔑 Mot de passe configuré: ${process.env.HOSTINGER_EMAIL_PASSWORD ? '✅' : '❌'}`);
});

module.exports = app;