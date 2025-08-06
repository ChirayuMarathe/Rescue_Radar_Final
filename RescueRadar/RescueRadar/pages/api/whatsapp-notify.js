// WhatsApp Notification API Route - Twilio Integration
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      phone_number, 
      message, 
      report_id,
      urgency_level,
      rescue_team_phone
    } = req.body;

    // Validate required fields
    if (!phone_number || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }

    // Format phone number (ensure it starts with +)
    const formattedPhone = phone_number.startsWith('+') 
      ? phone_number 
      : `+${phone_number}`;

    // Create WhatsApp message with urgency indicator
    const urgencyPrefix = urgency_level === 'high' ? '🚨 URGENT: ' : '📢 ';
    const fullMessage = `${urgencyPrefix}${message}${report_id ? `\n\nReport ID: ${report_id}` : ''}`;

    // Send WhatsApp message via Twilio
    const whatsappMessage = await client.messages.create({
      body: fullMessage,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${formattedPhone}`
    });

    // If rescue team phone is provided, notify them too
    let rescueNotification = null;
    if (rescue_team_phone) {
      const rescuePhone = rescue_team_phone.startsWith('+') 
        ? rescue_team_phone 
        : `+${rescue_team_phone}`;
        
      rescueNotification = await client.messages.create({
        body: `🆘 New Animal Rescue Report!\n\n${message}\n\nReport ID: ${report_id || 'N/A'}\nUrgency: ${urgency_level || 'normal'}\n\nPlease respond ASAP.`,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${rescuePhone}`
      });
    }

    res.status(200).json({
      success: true,
      whatsapp_sent: true,
      details: {
        message_sid: whatsappMessage.sid,
        status: whatsappMessage.status,
        to: formattedPhone,
        sent_at: new Date().toISOString(),
        rescue_notification: rescueNotification ? {
          message_sid: rescueNotification.sid,
          status: rescueNotification.status,
          to: rescue_team_phone
        } : null
      }
    });
    
  } catch (error) {
    console.error('WhatsApp Notification Error:', error);
    
    // Handle specific Twilio errors
    if (error.code) {
      return res.status(400).json({ 
        success: false, 
        message: `Twilio Error: ${error.message}`,
        error_code: error.code
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send WhatsApp notification' 
    });
  }
}
