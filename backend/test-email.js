const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🧪 Test de configuration email Hostinger - contact@centraldocs.ai\n');

// Configuration du transporteur
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'contact@centraldocs.ai',
    pass: process.env.HOSTINGER_EMAIL_PASSWORD
  },
  debug: true,
  logger: true
});

async function testEmailConfiguration() {
  try {
    // Test 1: Vérification de la connexion
    console.log('1️⃣ Test de connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie avec contact@centraldocs.ai\n');
    
    // Test 2: Envoi d'un email de test
    console.log('2️⃣ Envoi d\'un email de test...');
    
    const testEmail = {
      from: '"CentralDocs Test" <contact@centraldocs.ai>',
      to: 'philippe.canon@outlook.com', // Votre email de test
      subject: '🧪 Test CentralDocs - Configuration contact@centraldocs.ai',
      text: `
Test de configuration email CentralDocs

✅ Configuration SMTP Hostinger validée !

Serveur : ${process.env.SMTP_HOST}
Port : ${process.env.SMTP_PORT}
Utilisateur : contact@centraldocs.ai
Expéditeur : contact@centraldocs.ai

Date du test : ${new Date().toLocaleString('fr-FR')}

Si vous recevez ce message, la configuration est opérationnelle !
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test CentralDocs</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
            .success { background: #10b981; color: white; padding: 15px; border-radius: 6px; text-align: center; }
            .config { background: #e5e7eb; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🧪 Test CentralDocs</h1>
            <p>Configuration contact@centraldocs.ai</p>
          </div>
          
          <div class="content">
            <div class="success">
              <h2>✅ Test réussi !</h2>
              <p>La configuration SMTP avec Hostinger fonctionne parfaitement.</p>
            </div>
            
            <div class="config">
              <h3>📋 Configuration utilisée :</h3>
              <ul>
                <li><strong>Serveur :</strong> ${process.env.SMTP_HOST}</li>
                <li><strong>Port :</strong> ${process.env.SMTP_PORT}</li>
                <li><strong>Utilisateur :</strong> contact@centraldocs.ai</li>
                <li><strong>Expéditeur :</strong> contact@centraldocs.ai</li>
              </ul>
            </div>
            
            <p><strong>Date du test :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            
            <p>Si vous recevez ce message, votre configuration email est opérationnelle !</p>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(testEmail);
    
    console.log('✅ Email de test envoyé avec succès !');
    console.log('📧 Message ID:', info.messageId);
    console.log('📤 Destinataire:', testEmail.to);
    console.log('📨 Expéditeur:', 'contact@centraldocs.ai');
    console.log('\n🎉 Configuration contact@centraldocs.ai validée !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('💡 Vérifiez le mot de passe: c0ckPvm0y@P');
    } else if (error.code === 'ECONNECTION') {
      console.error('💡 Vérifiez la connexion internet et le serveur SMTP');
    }
  }
}

// Exécuter le test
testEmailConfiguration();