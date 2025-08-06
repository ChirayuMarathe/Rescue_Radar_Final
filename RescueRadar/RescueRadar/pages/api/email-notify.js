// Email Notification API Route - Brevo Integration
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      report_id, 
      email, 
      subject, 
      content,
      report_details,
      notification_type = 'confirmation'
    } = req.body;
    
    if (!email || !report_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and report_id are required' 
      });
    }

    // Prepare email content based on type
    let emailSubject, emailContent;
    
    if (notification_type === 'confirmation') {
      emailSubject = `RescueRadar - Report Confirmation #${report_id}`;
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #fb7185 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">🐾 RescueRadar</h1>
            <p style="color: white; text-align: center; margin: 10px 0 0 0;">Animal Cruelty Report Confirmed</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #f97316; margin-top: 0;">Thank You for Your Report</h2>
            
            <p>Your animal cruelty report has been successfully submitted and assigned ID: <strong>${report_id}</strong></p>
            
            ${report_details ? `
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Report Details:</h3>
              <p><strong>Location:</strong> ${report_details.location || 'Not specified'}</p>
              <p><strong>Severity:</strong> ${report_details.ai_analysis?.severity || 'Under analysis'}</p>
              <p><strong>Urgency Level:</strong> ${report_details.ai_analysis?.urgency_level || 'Being assessed'}/10</p>
              <p><strong>Status:</strong> Pending Investigation</p>
            </div>
            ` : ''}
            
            <h3 style="color: #374151;">What Happens Next?</h3>
            <ul style="color: #6b7280;">
              <li>Our AI system has analyzed your report for urgency and severity</li>
              <li>Appropriate authorities and rescue organizations have been notified</li>
              <li>You will receive updates as the case progresses</li>
              <li>If immediate intervention is required, emergency services have been contacted</li>
            </ul>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;"><strong>Emergency:</strong> If this is an immediate life-threatening situation, please also call your local emergency services.</p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Thank you for helping protect animals. Your report makes a difference.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Visit RescueRadar</a>
            </div>
          </div>
        </div>
      `;
    } else if (notification_type === 'authority') {
      emailSubject = `🚨 RescueRadar Alert - New Animal Cruelty Report #${report_id}`;
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">🚨 URGENT ALERT</h1>
            <p style="color: white; text-align: center; margin: 10px 0 0 0;">New Animal Cruelty Report</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #dc2626; margin-top: 0;">Report ID: ${report_id}</h2>
            
            ${report_details ? `
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Report Details:</h3>
              <p><strong>Location:</strong> ${report_details.location}</p>
              <p><strong>Description:</strong> ${report_details.description}</p>
              <p><strong>AI Severity:</strong> ${report_details.ai_analysis?.severity || 'Unknown'}</p>
              <p><strong>Urgency Level:</strong> ${report_details.ai_analysis?.urgency_level || 'Unknown'}/10</p>
              <p><strong>Requires Immediate Intervention:</strong> ${report_details.ai_analysis?.requires_immediate_intervention ? 'YES' : 'No'}</p>
              ${report_details.contact_email ? `<p><strong>Reporter Contact:</strong> ${report_details.contact_email}</p>` : ''}
              ${report_details.image_url ? `<p><strong>Evidence:</strong> Image attached</p>` : ''}
            </div>
            ` : ''}
            
            <div style="background: #dcfce7; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #166534;"><strong>Action Required:</strong> Please investigate this report and take appropriate action based on the severity level.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/reports/${report_id}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Report</a>
            </div>
          </div>
        </div>
      `;
    } else {
      emailSubject = subject || `RescueRadar Notification - ${report_id}`;
      emailContent = content || 'Notification from RescueRadar';
    }

    // Send email via Brevo
    const brevoResponse = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'RescueRadar',
          email: process.env.BREVO_FROM_EMAIL
        },
        to: [
          {
            email: email,
            name: report_details?.contact_name || 'Reporter'
          }
        ],
        subject: emailSubject,
        htmlContent: emailContent,
        tags: [`report_${report_id}`, notification_type]
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        }
      }
    );

    console.log('Email sent successfully:', {
      report_id,
      email,
      message_id: brevoResponse.data.messageId,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      email_sent: true,
      details: {
        message_id: brevoResponse.data.messageId,
        recipient: email,
        subject: emailSubject,
        sent_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Email Notification Error:', error);
    
    // Handle specific Brevo errors
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        success: false, 
        message: 'Email service authentication failed' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
