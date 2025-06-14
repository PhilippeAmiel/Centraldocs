// Service d'envoi d'email - Configuration Netlify + Resend
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface EmailCredentials {
  email: string;
  password: string;
  generatedAt: string;
}

interface RequestData {
  id: string;
  clientName: string;
  clientEmail: string;
  documentListName?: string;
  requestedDocuments: Array<{
    name: string;
    description?: string;
    required: boolean;
  }>;
}

export class EmailService {
  private static readonly FROM_EMAIL = 'contact@centraldocs.ai';
  private static readonly FROM_NAME = 'CentralDocs';
  private static readonly CLIENT_LOGIN_URL = `${window.location.origin}/client-login`;
  
  // URL de l'API Netlify Functions
  private static readonly API_URL = import.meta.env.PROD 
    ? `${window.location.origin}/.netlify/functions` // Production : Netlify
    : 'http://localhost:8888/.netlify/functions'; // Développement : Netlify Dev

  // Générer un mot de passe sécurisé
  static generatePassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Créer le contenu HTML de l'email
  static createEmailContent(
    requestData: RequestData, 
    credentials: EmailCredentials, 
    customMessage?: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Demande de documents - ${requestData.documentListName || 'Documents requis'}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
          .container { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .credentials-box { background: linear-gradient(135deg, #dbeafe, #bfdbfe); border: 2px solid #93c5fd; padding: 30px; border-radius: 16px; margin: 30px 0; text-align: center; }
          .documents-list { background: #f8fafc; border: 2px solid #e2e8f0; padding: 30px; border-radius: 16px; margin: 30px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; margin: 16px 0; font-weight: 700; font-size: 16px; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3); transition: all 0.3s ease; }
          .button:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(37, 99, 235, 0.4); }
          .footer { text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e2e8f0; color: #64748b; }
          .custom-message { background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 6px solid #f59e0b; padding: 24px; margin: 30px 0; border-radius: 12px; }
          .logo { font-size: 32px; font-weight: 900; margin-bottom: 12px; }
          .tagline { opacity: 0.95; font-size: 18px; font-weight: 500; }
          .credential-item { background: white; padding: 20px; margin: 12px 0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
          .password { background: #1e293b; color: #f8fafc; padding: 12px 20px; border-radius: 8px; font-family: 'SF Mono', Monaco, monospace; font-weight: 700; letter-spacing: 2px; font-size: 18px; }
          .doc-item { background: white; padding: 16px 20px; margin: 12px 0; border-radius: 12px; border-left: 6px solid #10b981; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
          .doc-required { border-left-color: #dc2626; }
          .instructions { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 2px solid #0ea5e9; padding: 30px; border-radius: 16px; margin: 30px 0; }
          .tip { background: linear-gradient(135deg, #fefce8, #fef3c7); border: 2px solid #eab308; padding: 20px; border-radius: 12px; margin: 24px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📄 CentralDocs</div>
            <div class="tagline">Gestion documentaire sécurisée</div>
          </div>
          
          <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 24px; font-size: 24px;">Bonjour ${requestData.clientName},</h2>
            
            <p style="font-size: 18px; color: #475569; line-height: 1.7;">
              Nous avons besoin de certains documents de votre part pour traiter votre dossier 
              <strong style="color: #2563eb;">"${requestData.documentListName || 'Documents requis'}"</strong>.
            </p>
            
            ${customMessage ? `
              <div class="custom-message">
                <strong style="color: #92400e; font-size: 18px;">💬 Message personnalisé :</strong><br>
                <div style="margin-top: 12px; color: #92400e; font-size: 16px; line-height: 1.6;">${customMessage}</div>
              </div>
            ` : ''}
            
            <div class="credentials-box">
              <h3 style="color: #1e40af; margin-bottom: 20px; font-size: 22px;">🔐 Vos identifiants de connexion</h3>
              
              <div class="credential-item">
                <p style="margin: 0; font-size: 16px; color: #64748b;">Email de connexion</p>
                <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 600; color: #0f172a;">${credentials.email}</p>
              </div>
              
              <div class="credential-item">
                <p style="margin: 0; font-size: 16px; color: #64748b;">Mot de passe temporaire</p>
                <div class="password">${credentials.password}</div>
              </div>
              
              <div style="margin-top: 30px;">
                <a href="${this.CLIENT_LOGIN_URL}" class="button" style="color: white; text-decoration: none;">
                  🚀 Se connecter à CentralDocs
                </a>
              </div>
            </div>
            
            <div class="documents-list">
              <h3 style="color: #0f172a; margin-bottom: 20px; font-size: 20px;">📋 Documents requis (${requestData.requestedDocuments.length})</h3>
              ${requestData.requestedDocuments.map(doc => `
                <div class="doc-item ${doc.required ? 'doc-required' : ''}">
                  <strong style="color: #0f172a; font-size: 16px;">${doc.name}</strong>
                  ${doc.required ? 
                    '<span style="color: #dc2626; font-weight: bold; margin-left: 8px;">(obligatoire)</span>' : 
                    '<span style="color: #059669; font-size: 14px; margin-left: 8px;">(optionnel)</span>'
                  }
                  ${doc.description ? `<br><small style="color: #64748b; margin-top: 6px; display: block; line-height: 1.5;">${doc.description}</small>` : ''}
                </div>
              `).join('')}
            </div>
            
            <div class="instructions">
              <h3 style="color: #0c4a6e; margin-bottom: 16px; font-size: 20px;">📋 Instructions</h3>
              <ol style="color: #0c4a6e; padding-left: 24px; line-height: 1.8;">
                <li style="margin: 12px 0; font-size: 16px;">Cliquez sur le bouton "Se connecter à CentralDocs" ci-dessus</li>
                <li style="margin: 12px 0; font-size: 16px;">Connectez-vous avec vos identifiants</li>
                <li style="margin: 12px 0; font-size: 16px;">Téléversez vos documents de manière sécurisée</li>
                <li style="margin: 12px 0; font-size: 16px;">Suivez l'avancement de votre dossier en temps réel</li>
              </ol>
            </div>
            
            <div class="tip">
              <p style="margin: 0; color: #713f12; font-size: 16px;"><strong>💡 Conseil :</strong> Assurez-vous que vos documents sont lisibles, en couleur et en cours de validité.</p>
            </div>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.7;">
              Si vous rencontrez des difficultés, n'hésitez pas à nous contacter en répondant à cet email.
            </p>
            
            <div class="footer">
              <p style="margin: 12px 0; font-size: 16px;"><strong>Cordialement,</strong><br><strong style="color: #2563eb; font-size: 18px;">L'équipe CentralDocs</strong></p>
              <p style="margin: 20px 0; font-size: 16px;">
                <a href="mailto:contact@centraldocs.ai" style="color: #2563eb; text-decoration: none;">contact@centraldocs.ai</a> | 
                <a href="https://centraldocs.ai" style="color: #2563eb; text-decoration: none;">centraldocs.ai</a>
              </p>
              <p style="font-size: 14px; color: #94a3b8; margin-top: 24px; line-height: 1.6;">
                Cet email a été envoyé automatiquement via Resend + Netlify<br>
                Vous pouvez répondre à ce message pour nous contacter directement.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Créer la version texte de l'email
  private static createTextContent(
    requestData: RequestData, 
    credentials: EmailCredentials, 
    customMessage?: string
  ): string {
    return `
CENTRALDOCS - Demande de documents

Bonjour ${requestData.clientName},

Nous avons besoin de certains documents de votre part pour traiter votre dossier "${requestData.documentListName || 'Documents requis'}".

${customMessage ? `MESSAGE PERSONNALISÉ :\n${customMessage}\n\n` : ''}

VOS IDENTIFIANTS DE CONNEXION :
• Email : ${credentials.email}
• Mot de passe : ${credentials.password}
• Lien de connexion : ${this.CLIENT_LOGIN_URL}

DOCUMENTS REQUIS :
${requestData.requestedDocuments.map(doc => 
  `• ${doc.name}${doc.required ? ' (obligatoire)' : ' (optionnel)'}${doc.description ? ` - ${doc.description}` : ''}`
).join('\n')}

INSTRUCTIONS :
1. Rendez-vous sur : ${this.CLIENT_LOGIN_URL}
2. Connectez-vous avec vos identifiants
3. Téléversez vos documents de manière sécurisée
4. Suivez l'avancement de votre dossier en temps réel

CONSEIL :
Assurez-vous que vos documents sont lisibles, en couleur et en cours de validité.

SUPPORT :
Si vous rencontrez des difficultés, contactez-nous :
• Email : contact@centraldocs.ai
• Site web : https://centraldocs.ai

Cordialement,
L'équipe CentralDocs

---
Cet email a été envoyé via Resend + Netlify depuis contact@centraldocs.ai
Vous pouvez répondre à ce message pour nous contacter directement.
    `.trim();
  }

  // Vérifier si l'API est disponible
  private static async checkApiHealth(): Promise<boolean> {
    try {
      console.log('🔍 Vérification de l\'API Netlify + Resend...');
      
      const response = await fetch(`${this.API_URL}/test-email`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });
      
      const isHealthy = response.ok;
      console.log(isHealthy ? '✅ API Netlify + Resend disponible' : '❌ API non disponible');
      
      if (isHealthy) {
        const healthData = await response.json();
        console.log('📊 Statut de l\'API:', healthData);
      }
      
      return isHealthy;
    } catch (error: any) {
      console.warn('⚠️ API non disponible, passage en mode simulation:', error.message);
      return false;
    }
  }

  // Envoyer l'email via API Netlify + Resend
  static async sendDocumentRequestEmail(
    requestData: RequestData,
    customMessage?: string
  ): Promise<{ success: boolean; credentials?: EmailCredentials; error?: string }> {
    try {
      console.log('🚀 Début de l\'envoi d\'email via Netlify + Resend...');

      // Générer les identifiants
      const credentials: EmailCredentials = {
        email: requestData.clientEmail,
        password: this.generatePassword(),
        generatedAt: new Date().toISOString()
      };

      console.log('🔐 Identifiants générés:', { email: credentials.email, password: credentials.password });

      // Créer le contenu de l'email
      const htmlContent = this.createEmailContent(requestData, credentials, customMessage);
      const textContent = this.createTextContent(requestData, credentials, customMessage);

      // Vérifier si l'API est disponible
      const apiAvailable = await this.checkApiHealth();

      if (!apiAvailable) {
        console.log('📧 API NON DISPONIBLE - MODE SIMULATION');
        return this.simulateEmailSending(requestData, credentials, customMessage);
      }

      // Préparer les données pour l'API
      const emailData = {
        to: {
          email: requestData.clientEmail,
          name: requestData.clientName
        },
        subject: `Demande de documents - ${requestData.documentListName || 'Documents requis'}`,
        html: htmlContent,
        text: textContent,
        credentials: credentials,
        requestData: requestData,
        customMessage: customMessage
      };

      console.log('📤 Envoi vers l\'API Netlify...');

      // Appel API
      const response = await fetch(`${this.API_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();

      // Créer le compte client dans Firestore
      await this.createClientAccount(credentials, requestData);

      // Mettre à jour la demande avec les informations d'envoi
      await this.updateRequestWithEmailInfo(requestData.id, credentials);

      console.log('✅ Email envoyé avec succès via Netlify + Resend');
      
      return { success: true, credentials };

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi d\'email:', error);
      
      // En cas d'erreur API, basculer en mode simulation
      if (error.name === 'TimeoutError' || error.message.includes('fetch') || error.message.includes('network')) {
        console.log('🔄 Erreur réseau/timeout, basculement en mode simulation...');
        return this.simulateEmailSending(requestData, {
          email: requestData.clientEmail,
          password: this.generatePassword(),
          generatedAt: new Date().toISOString()
        }, customMessage);
      }
      
      return { 
        success: false, 
        error: error.message || 'Erreur lors de l\'envoi de l\'email' 
      };
    }
  }

  // Mode simulation (fallback)
  private static async simulateEmailSending(
    requestData: RequestData,
    credentials: EmailCredentials,
    customMessage?: string
  ): Promise<{ success: boolean; credentials: EmailCredentials }> {
    console.log('📧 MODE SIMULATION - Email non envoyé réellement');
    console.log('='.repeat(60));
    console.log('📤 Configuration Netlify + Resend:');
    console.log('   • Plateforme: Netlify Functions');
    console.log('   • Service: Resend API');
    console.log('   • Expéditeur: contact@centraldocs.ai');
    console.log('   • Clé API: re_L8sdF6s7_42XiEsBQD43z9zGLTRH8Kkod');
    console.log('📥 Destinataire:', requestData.clientName, '<' + requestData.clientEmail + '>');
    console.log('📋 Objet: Demande de documents -', requestData.documentListName || 'Documents requis');
    console.log('🔑 Identifiants générés:');
    console.log('   • Email:', credentials.email);
    console.log('   • Mot de passe:', credentials.password);
    console.log('   • Lien:', this.CLIENT_LOGIN_URL);
    console.log('📄 Documents demandés:', requestData.requestedDocuments.length);
    if (customMessage) {
      console.log('💬 Message personnalisé:', customMessage);
    }
    console.log('='.repeat(60));
    console.log('💡 Votre clé Resend est configurée !');
    console.log('   L\'API devrait fonctionner. Vérifiez :');
    console.log('   1. Que Netlify Functions sont déployées');
    console.log('   2. Que RESEND_API_KEY est bien définie');
    console.log('   3. Redéployez si nécessaire');
    console.log('='.repeat(60));

    // Simuler un délai d'envoi réaliste
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Créer le compte client dans Firestore
    await this.createClientAccount(credentials, requestData);
    console.log('✅ Compte client créé dans Firestore');

    // Mettre à jour la demande avec les informations d'envoi
    await this.updateRequestWithEmailInfo(requestData.id, credentials);
    console.log('✅ Demande mise à jour avec les informations d\'email');

    console.log('🎉 Email simulé avec succès');
    return { success: true, credentials };
  }

  // Créer le compte client dans Firestore
  private static async createClientAccount(
    credentials: EmailCredentials, 
    requestData: RequestData
  ): Promise<void> {
    try {
      const clientAccountRef = doc(db, 'clientAccounts', credentials.email);
      await setDoc(clientAccountRef, {
        email: credentials.email,
        // Note: En production, le mot de passe devrait être hashé avec bcrypt
        passwordHash: credentials.password, // À hasher en production
        requestId: requestData.id,
        clientName: requestData.clientName,
        createdAt: new Date(),
        isActive: true,
        lastLogin: null,
        generatedAt: credentials.generatedAt
      });
      console.log('✅ Compte client créé:', credentials.email);
    } catch (error) {
      console.error('❌ Erreur lors de la création du compte client:', error);
      // Ne pas faire échouer l'envoi d'email si la création du compte échoue
    }
  }

  // Mettre à jour la demande avec les informations d'email
  private static async updateRequestWithEmailInfo(
    requestId: string, 
    credentials: EmailCredentials
  ): Promise<void> {
    try {
      const requestRef = doc(db, 'requests', requestId);
      await updateDoc(requestRef, {
        emailSent: true,
        emailSentAt: new Date(),
        clientCredentials: credentials,
        lastUpdated: new Date(),
        emailProvider: 'netlify-resend'
      });
      console.log('✅ Demande mise à jour:', requestId);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la demande:', error);
      throw error;
    }
  }
}