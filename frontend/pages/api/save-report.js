// Save Report API Route - Supabase Integration
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
      ai_analysis 
    } = req.body;
    
    if (!description || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Description and location are required' 
      });
    }

    // Generate unique report ID
    const reportId = `RR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare report data for database
    const reportData = {
      id: reportId,
      description: description.trim(),
      location: location.trim(),
      contact_name: contact_name?.trim() || null,
      contact_email: contact_email?.trim() || null,
      contact_phone: contact_phone?.trim() || null,
      image_url: image_url || null,
      ai_analysis: ai_analysis || null,
      status: 'pending',
      severity: ai_analysis?.severity || 'unknown',
      urgency_level: ai_analysis?.urgency_level || 5,
      category: ai_analysis?.category || 'other',
      requires_immediate_intervention: ai_analysis?.requires_immediate_intervention || false,
      estimated_animal_count: ai_analysis?.estimated_animal_count || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();

    if (error) {
      console.error('Supabase Save Error:', error);
      throw new Error(`Failed to save report: ${error.message}`);
    }

    // Log successful save
    console.log('Report saved successfully:', {
      report_id: reportId,
      location: location,
      severity: reportData.severity,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      report_id: reportId,
      data: data,
      message: 'Report saved successfully'
    });
    
  } catch (error) {
    console.error('Save Report Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
