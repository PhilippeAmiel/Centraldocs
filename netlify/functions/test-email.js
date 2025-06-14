const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('🧪 Test de configuration Resend...');
    console.log('🔑 RESEND_API_KEY présente:', !!process.env.RESEND_API_KEY);

    // Test de configuration Resend
    const testEmail = await resend.emails.send({
      from: 'CentralDocs <contact@centraldocs.ai>',
      to: ['test@resend.dev'], // Email de test Resend
      subject: '🧪 Test CentralDocs - Configuration Resend',
      html: `
        <h1>✅ Test réussi !</h1>
        <p>La configuration Resend fonctionne parfaitement.</p>
        <p><strong>Configuration :</strong></p>
        <ul>
          <li>Service : Resend API</li>
          <li>Expéditeur : contact@centraldocs.ai</li>
          <li>Date : ${new Date().toLocaleString('fr-FR')}</li>
        </ul>
        <p>CentralDocs est prêt à envoyer des emails !</p>
      `,
      text: `
Test CentralDocs - Configuration Resend

✅ Test réussi !
La configuration Resend fonctionne parfaitement.

Configuration :
- Service : Resend API
- Expéditeur : contact@centraldocs.ai
- Date : ${new Date().toLocaleString('fr-FR')}

CentralDocs est prêt à envoyer des emails !
      `
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Configuration Resend valide',
        testEmailId: testEmail.data?.id,
        config: {
          service: 'Resend API',
          from: 'contact@centraldocs.ai',
          timestamp: new Date().toISOString()
        }
      })
    };

  } catch (error) {
    console.error('❌ Test de configuration échoué:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Configuration Resend invalide',
        details: error.message,
        help: 'Vérifiez votre clé API Resend dans les variables d\'environnement'
      })
    };
  }
};