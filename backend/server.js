const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting pour les emails
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limite de 10 emails par 15 minutes par IP
  message: {
    error: 'Trop d\'emails envoyés, veuillez réessayer plus tard.',
    retryAfter: 15 * 60 // en secondes
  }
});

// Configuration du transporteur email Hostinger
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true pour 465, false pour autres ports
    auth: {
      user: process.env.SMTP_USER || 'contact@centraldocs.ai',
      pass: process.env.HOSTINGER_EMAIL_PASSWORD
    },
    // Options supplémentaires pour la fiabilité
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5
  });
};

// Vérification de la configuration au démarrage
const transporter = createTransporter();
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erreur de configuration SMTP:', error);
  } else {
    console.log('✅ Serveur SMTP prêt - contact@centraldocs.ai');
  }
});

// Middleware d'authentification simple
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }
  
  const token = authHeader.substring(7);
  
  // Validation basique du token (à améliorer avec Firebase Auth)
  if (!token || token.length < 10) {
    return res.status(401).json({ error: 'Token invalide' });
  }
  
  next();
};

// Endpoint principal pour envoyer un email
app.post('/api/send-email', emailLimiter, authenticateRequest, async (req, res) => {
  try {
    const { 
      to, 
      subject, 
      html, 
      text, 
      credentials, 
      requestData 
    } = req.body;
    
    // Validation des données
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
      headers: {
        'X-Mailer': 'CentralDocs v1.0',
        'X-Priority': '3',
        'Reply-To': 'contact@centraldocs.ai'
      }
    };
    
    console.log(`📧 Envoi email à ${to.email} depuis contact@centraldocs.ai`);
    
    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email envoyé - ID: ${info.messageId}`);
    
    // Hash du mot de passe pour la sécurité
    const hashedPassword = await bcrypt.hash(credentials.password, 10);
    
    res.json({ 
      success: true, 
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
      credentials: {
        ...credentials,
        password: hashedPassword // Retourner le hash pour stockage
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    
    let errorMessage = 'Erreur lors de l\'envoi de l\'email';
    let statusCode = 500;
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Erreur d\'authentification SMTP';
      statusCode = 401;
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Impossible de se connecter au serveur SMTP';
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de test
app.get('/api/test-email', authenticateRequest, async (req, res) => {
  try {
    await transporter.verify();
    
    res.json({ 
      success: true, 
      message: 'Configuration SMTP valide',
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Configuration SMTP invalide',
      details: error.message 
    });
  }
});

// Endpoint de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'CentralDocs Email Service'
  });
});

// Gestion des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    timestamp: new Date().toISOString()
  });
});

// Routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Serveur CentralDocs démarré sur le port ${PORT}`);
  console.log(`📧 SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  console.log(`📤 Expéditeur: contact@centraldocs.ai`);
});

module.exports = app;