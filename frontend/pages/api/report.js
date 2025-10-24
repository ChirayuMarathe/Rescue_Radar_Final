// Complete Report Workflow API Route
import { validateReportData } from '../../utils/helpers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      description, 
      location, 
      contact_name, 
      contact_email, 
      contact_phone,
      image_url,
      urgency_level = 'normal',
      animal_type,
      situation_type
    } = req.body;
    
    // Validate input data
    const validation = validateReportData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input data',
        errors: validation.errors 
      });
    }
    
    let workflow_results = {
      report_id: null,
      ai_analysis: null,
      saved: false,
      notifications_sent: {
        email: false,
        whatsapp: false
      },
      qr_generated: false,
      errors: []
    };
    
    try {
      // Step 1: AI Analysis
      console.log('Starting AI analysis...');
      const analysisResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ai-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description, 
          location,
          animal_type,
          situation_type
        })
      });
      
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        workflow_results.ai_analysis = analysisData.analysis;
        console.log('AI analysis completed successfully');
      } else {
        workflow_results.errors.push('AI analysis failed');
      }
      
      // Step 2: Save Report to Database
      console.log('Saving report to database...');
      const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/save-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description, 
          location, 
          contact_name, 
          contact_email, 
          contact_phone,
          image_url,
          urgency_level,
          animal_type,
          situation_type,
          ai_analysis: workflow_results.ai_analysis
        })
      });
      
      if (saveResponse.ok) {
        const saveData = await saveResponse.json();
        workflow_results.report_id = saveData.report_id;
        workflow_results.saved = true;
        console.log(`Report saved with ID: ${workflow_results.report_id}`);
      } else {
        workflow_results.errors.push('Failed to save report to database');
        throw new Error('Could not save report');
      }
      
      // Step 3: Send Email Notification (if contact email provided)
      if (contact_email && workflow_results.report_id) {
        console.log('Sending email notification...');
        try {
          const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email-notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              report_id: workflow_results.report_id,
              email: contact_email,
              subject: `RescueRadar Report Received - ${workflow_results.report_id}`,
              content: `Dear ${contact_name || 'Reporter'},\n\nYour animal rescue report has been received and assigned ID: ${workflow_results.report_id}\n\nDescription: ${description}\nLocation: ${location}\nUrgency: ${urgency_level}\n\nOur team will review this report and take appropriate action.\n\nThank you for helping animals in need.\n\nBest regards,\nRescueRadar Team`,
              urgency_level
            })
          });
          
          if (emailResponse.ok) {
            workflow_results.notifications_sent.email = true;
            console.log('Email notification sent successfully');
          } else {
            workflow_results.errors.push('Email notification failed');
          }
        } catch (emailError) {
          console.error('Email notification error:', emailError);
          workflow_results.errors.push('Email notification error');
        }
      }
      
      // Step 4: Send WhatsApp Notification (if contact phone provided)
      if (contact_phone && workflow_results.report_id) {
        console.log('Sending WhatsApp notification...');
        try {
          const whatsappResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp-notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone_number: contact_phone,
              message: `Thank you for your animal rescue report! Your report ID: ${workflow_results.report_id}. We will investigate and take action soon.`,
              report_id: workflow_results.report_id,
              urgency_level,
              rescue_team_phone: process.env.DEFAULT_RESCUE_PHONE
            })
          });
          
          if (whatsappResponse.ok) {
            workflow_results.notifications_sent.whatsapp = true;
            console.log('WhatsApp notification sent successfully');
          } else {
            workflow_results.errors.push('WhatsApp notification failed');
          }
        } catch (whatsappError) {
          console.error('WhatsApp notification error:', whatsappError);
          workflow_results.errors.push('WhatsApp notification error');
        }
      }
      
      // Step 5: Generate QR Code for Report
      if (workflow_results.report_id) {
        console.log('Generating QR code...');
        try {
          const qrResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-qr?report_id=${workflow_results.report_id}&format=png&size=200`);
          
          if (qrResponse.ok) {
            workflow_results.qr_generated = true;
            console.log('QR code generated successfully');
          } else {
            workflow_results.errors.push('QR code generation failed');
          }
        } catch (qrError) {
          console.error('QR generation error:', qrError);
          workflow_results.errors.push('QR generation error');
        }
      }
      
    } catch (workflowError) {
      console.error('Workflow Step Error:', workflowError);
      workflow_results.errors.push(`Workflow error: ${workflowError.message}`);
    }

    // Determine response status based on success of critical steps
    const isSuccess = workflow_results.saved && workflow_results.report_id;
    const statusCode = isSuccess ? 200 : 500;

    res.status(statusCode).json({
      success: isSuccess,
      message: isSuccess 
        ? 'Report submitted successfully' 
        : 'Report submission failed or incomplete',
      report_id: workflow_results.report_id,
      workflow: workflow_results,
      qr_code_url: workflow_results.qr_generated 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-qr?report_id=${workflow_results.report_id}&format=png&size=200`
        : null
    });
    
  } catch (error) {
    console.error('Complete Report Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process complete report',
      error: error.message 
    });
  }
}
