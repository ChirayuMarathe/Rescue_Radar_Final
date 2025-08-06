// API Health Check Endpoint
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const healthChecks = {
    server: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.APP_ENV || 'development',
    services: {
      ai_analysis: checkService('GROQ_API_KEY'),
      email_notification: checkService('BREVO_API_KEY'),
      whatsapp: checkService('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'),
      google_maps: checkService('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'),
      supabase: checkService('SUPABASE_URL', 'SUPABASE_API_KEY'),
      file_upload: checkFileUpload(),
    },
    endpoints: [
      '/api/ai-analysis',
      '/api/email-notify', 
      '/api/generate-qr',
      '/api/upload-image',
      '/api/save-report',
      '/api/reports/active',
      '/api/whatsapp-notify'
    ]
  };

  // Calculate overall health
  const serviceStatuses = Object.values(healthChecks.services);
  const healthyServices = serviceStatuses.filter(status => status === 'healthy').length;
  const totalServices = serviceStatuses.length;
  
  healthChecks.overall_health = healthyServices === totalServices ? 'healthy' : 'degraded';
  healthChecks.healthy_services = healthyServices;
  healthChecks.total_services = totalServices;

  const statusCode = healthChecks.overall_health === 'healthy' ? 200 : 206;
  
  res.status(statusCode).json(healthChecks);
}

function checkService(...envVars) {
  for (const envVar of envVars) {
    if (!process.env[envVar] || process.env[envVar].includes('your_') || process.env[envVar].includes('_here')) {
      return 'misconfigured';
    }
  }
  return 'healthy';
}

function checkFileUpload() {
  const fs = require('fs');
  const uploadDir = './public/uploads';
  
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    return 'healthy';
  } catch (error) {
    return 'unhealthy';
  }
}
