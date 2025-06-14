// Script de test pour vérifier la configuration email Hostinger - contact@centraldocs.ai
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'contact@centraldocs.ai',
    pass: process.env.HOSTINGER_EMAIL_PASSWORD || 'c0ckPvm0y@P'
  },
  debug: true,
  logger: true
});

async function testEmailConfiguration() {
  console.log('🧪 Test de la configuration email Hostinger - contact@centraldocs.ai...\n');
  
  // Test 1: Vérification de la connexion
  console.log('1️⃣ Test de connexion SMTP...');
  try {
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie avec contact@centraldocs.ai\n');
  } catch (error) {
    console.error('❌ Erreur de connexion SMTP:', error.message);
    return;
  }
  
  // Test 2: Envoi d'un email de test
  console.log('2️⃣ Envoi d\'un email de test...');
  
  const testEmail = {
    from: `"CentralDocs Test" <${process.env.SMTP_FROM_EMAIL || 'contact@centraldocs.ai'}>`,
    to: 'votre-email-test@example.com', // Remplacez par votre email
    subject: '🧪 Test CentralDocs - Configuration contact@centraldocs.ai',
    text: `
Test de configuration email CentralDocs

Ce message confirme que la configuration SMTP avec Hostinger fonctionne correctement.

Configuration utilisée :
- Serveur : ${process.env.SMTP_HOST}
- Port : ${process.env.SMTP_PORT}
- Utilisateur : contact@centraldocs.ai
- Expéditeur : contact@centraldocs.ai
- Mot de passe : c0ckPvm0y@P

Date du test : ${new Date().toLocaleString('fr-FR')}

✅ AVANTAGES DE contact@centraldocs.ai :
• Adresse professionnelle et crédible
• Les clients peuvent répondre directement
• Meilleure délivrabilité que noreply@
• Conforme aux bonnes pratiques email

Si vous recevez ce message, la configuration est opérationnelle !
    `,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test CentralDocs</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .success { background: #10b981; color: white; padding: 15px; border-radius: 6px; text-align: center; }
          .config { background: #e5e7eb; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .advantages { background: #dbeafe; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2563eb; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
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
            <p>La configuration SMTP avec Hostinger fonctionne correctement.</p>
          </div>
          
          <div class="config">
            <h3>📋 Configuration utilisée :</h3>
            <ul>
              <li><strong>Serveur :</strong> ${process.env.SMTP_HOST}</li>
              <li><strong>Port :</strong> ${process.env.SMTP_PORT}</li>
              <li><strong>Utilisateur :</strong> contact@centraldocs.ai</li>
              <li><strong>Expéditeur :</strong> contact@centraldocs.ai</li>
              <li><strong>Mot de passe :</strong> c0ckPvm0y@P</li>
            </ul>
          </div>
          
          <div class="advantages">
            <h3>✅ Avantages de contact@centraldocs.ai :</h3>
            <ul>
              <li><strong>Professionnel :</strong> Plus crédible que noreply@</li>
              <li><strong>Interactif :</strong> Les clients peuvent répondre</li>
              <li><strong>Délivrabilité :</strong> Meilleure réputation email</li>
              <li><strong>Support :</strong> Facilite le service client</li>
              <li><strong>Conformité :</strong> Bonnes pratiques respectées</li>
            </ul>
          </div>
          
          <p><strong>Date du test :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          
          <p>Si vous recevez ce message, votre configuration email est opérationnelle et prête pour la production !</p>
        </div>
        
        <div class="footer">
          <p>CentralDocs - Gestion documentaire sécurisée</p>
          <p><a href="mailto:contact@centraldocs.ai">contact@centraldocs.ai</a> | <a href="https://centraldocs.ai">centraldocs.ai</a></p>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    const info = await transporter.sendMail(testEmail);
    console.log('✅ Email de test envoyé avec succès depuis contact@centraldocs.ai !');
    console.log('📧 Message ID:', info.messageId);
    console.log('📤 Destinataire:', testEmail.to);
    console.log('📨 Expéditeur:', 'contact@centraldocs.ai');
    console.log('\n🎉 Configuration contact@centraldocs.ai validée !');
    console.log('\n✅ Avantages de cette configuration :');
    console.log('   • Adresse professionnelle et crédible');
    console.log('   • Les clients peuvent répondre directement');
    console.log('   • Meilleure délivrabilité que noreply@');
    console.log('   • Conforme aux bonnes pratiques email');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de test:', error.message);
  }
}

// Exécuter le test
testEmailConfiguration().catch(console.error);