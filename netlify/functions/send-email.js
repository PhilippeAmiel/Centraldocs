const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📧 Netlify Function - send-email démarrée');
    console.log('🔑 RESEND_API_KEY présente:', !!process.env.RESEND_API_KEY);

    const {
      to,
      subject,
      html,
      text,
      credentials,
      requestData,
      customMessage
    } = JSON.parse(event.body);

    // Validation
    if (!to?.email || !to?.name || !subject || !html) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Données manquantes : to.email, to.name, subject, html requis'
        })
      };
    }

    if (!credentials?.email || !credentials?.password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Identifiants client manquants'
        })
      };
    }

    console.log('📧 Envoi d\'email via Resend...');
    console.log('Destinataire:', to.email);
    console.log('Sujet:', subject);

    // Envoi de l'email via Resend
    const emailResponse = await resend.emails.send({
      from: 'CentralDocs <contact@centraldocs.ai>',
      to: [to.email],
      subject: subject,
      html: html,
      text: text || 'Version texte non disponible',
      headers: {
        'X-Mailer': 'CentralDocs v1.0',
        'Reply-To': 'contact@centraldocs.ai'
      }
    });

    console.log('✅ Email envoyé avec succès via Resend');
    console.log('ID:', emailResponse.data?.id);

    // Réponse de succès
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messageId: emailResponse.data?.id,
        timestamp: new Date().toISOString(),
        credentials: {
          email: credentials.email,
          password: credentials.password,
          generatedAt: new Date().toISOString()
        },
        provider: 'resend'
      })
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi d\'email:', error);

    let errorMessage = 'Erreur lors de l\'envoi de l\'email';
    let statusCode = 500;

    if (error.message?.includes('API key')) {
      errorMessage = 'Clé API Resend invalide ou manquante';
      statusCode = 401;
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Limite de taux atteinte, veuillez réessayer plus tard';
      statusCode = 429;
    } else if (error.message?.includes('invalid email')) {
      errorMessage = 'Adresse email invalide';
      statusCode = 400;
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      })
    };
  }
};