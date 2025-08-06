// API route to get all active reports
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select(`
        id,
        description,
        location,
        coordinates,
        urgency_level,
        animal_type,
        situation_type,
        contact_name,
        contact_email,
        contact_phone,
        image_url,
        created_at,
        ai_analysis
      `)
      .order('created_at', { ascending: false })
      .limit(100); // Limit to last 100 reports

    if (error) {
      console.error('Supabase Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch reports from Supabase',
        error: error.message
      });
    }

    // Transform data for the frontend
    const formattedReports = reports.map(report => ({
      id: report.id,
      description: report.description,
      location: report.location,
      coordinates: report.coordinates || { 
        lat: 28.6139 + (Math.random() - 0.5) * 0.1, 
        lng: 77.2090 + (Math.random() - 0.5) * 0.1 
      }, // Default coordinates if not available
      urgency_level: report.urgency_level || 'normal',
      animal_type: report.animal_type,
      situation_type: report.situation_type,
      created_at: report.created_at,
      image_url: report.image_url,
      contact_info: {
        name: report.contact_name,
        email: report.contact_email,
        phone: report.contact_phone
      },
      ai_analysis: report.ai_analysis
    }));

    res.status(200).json({
      success: true,
      reports: formattedReports,
      total: formattedReports.length
    });

  } catch (error) {
    console.error('Get Reports Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reports',
      error: error.message 
    });
  }
}
