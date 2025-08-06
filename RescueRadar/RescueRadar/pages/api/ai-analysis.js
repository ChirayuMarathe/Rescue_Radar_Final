// AI Analysis API Route - Groq Integration
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { description, location, image_url } = req.body;
    
    if (!description || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Description and location are required' 
      });
    }

    // Create AI analysis prompt
    const prompt = `
You are an expert animal welfare analyst. Analyze the following animal cruelty report and provide a structured assessment:

Report Description: "${description}"
Location: "${location}"
${image_url ? `Image Available: Yes` : 'Image Available: No'}

Please analyze this report and provide a JSON response with the following structure:
{
  "severity": "low|medium|high|critical",
  "category": "physical_abuse|neglect|abandonment|hoarding|fighting|other",
  "urgency_level": 1-10,
  "recommended_actions": ["action1", "action2", "action3"],
  "confidence_score": 0.0-1.0,
  "requires_immediate_intervention": true/false,
  "estimated_animal_count": number,
  "risk_factors": ["factor1", "factor2"],
  "next_steps": ["step1", "step2", "step3"]
}

Be thorough in your analysis and prioritize animal safety.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert animal welfare analyst who provides structured, actionable assessments of animal cruelty reports. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 1024,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    // Parse AI response
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback analysis
      analysisResult = {
        severity: 'medium',
        category: 'other',
        urgency_level: 5,
        recommended_actions: ['Contact local authorities', 'Document evidence', 'Send to animal rescue'],
        confidence_score: 0.5,
        requires_immediate_intervention: false,
        estimated_animal_count: 1,
        risk_factors: ['Unknown situation'],
        next_steps: ['Investigate further', 'Contact authorities']
      };
    }

    // Log for monitoring
    console.log('AI Analysis completed:', {
      location,
      severity: analysisResult.severity,
      urgency: analysisResult.urgency_level,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      analysis: analysisResult,
      ai_model: 'llama-3.1-70b-versatile',
      processed_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
