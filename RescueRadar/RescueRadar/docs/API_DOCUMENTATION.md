# RescueRadar API Documentation

## Base URL
`http://localhost:3002`

## API Endpoints

### 1. AI Analysis
**Endpoint:** `POST /api/ai-analysis`
**Purpose:** Analyze animal rescue reports using AI
**Body:**
```json
{
  "description": "string (required)",
  "location": "string (required)",
  "image_url": "string (optional)"
}
```
**Response:**
```json
{
  "success": true,
  "analysis": {
    "severity": "high|medium|low",
    "category": "string",
    "recommended_action": "string",
    "urgency_level": "emergency|high|medium|normal"
  }
}
```

### 2. Email Notification
**Endpoint:** `POST /api/email-notify`
**Purpose:** Send email notifications for reports
**Body:**
```json
{
  "report_id": "string (required)",
  "email": "string (required)",
  "description": "string (required)",
  "location": "string (required)"
}
```

### 3. QR Code Generation
**Endpoint:** `GET /api/generate-qr?report_id={id}`
**Purpose:** Generate QR codes for report tracking
**Response:**
```json
{
  "success": true,
  "qr_code": {
    "qr_code_data": "base64_string",
    "report_url": "string"
  }
}
```

### 4. Image Upload
**Endpoint:** `POST /api/upload-image`
**Purpose:** Upload images for reports
**Content-Type:** `multipart/form-data`
**Body:** Form data with `image` field
**Response:**
```json
{
  "success": true,
  "image_url": "string",
  "filename": "string"
}
```

### 5. Save Report
**Endpoint:** `POST /api/save-report`
**Purpose:** Save report to database
**Body:**
```json
{
  "description": "string (required)",
  "location": "string (required)",
  "contact_email": "string (optional)",
  "contact_name": "string (optional)",
  "contact_phone": "string (optional)",
  "urgency_level": "emergency|high|medium|normal",
  "animal_type": "string",
  "situation_type": "string"
}
```

### 6. Get Active Reports
**Endpoint:** `GET /api/reports/active`
**Purpose:** Retrieve all active reports for map display
**Response:**
```json
{
  "success": true,
  "reports": [
    {
      "id": "string",
      "description": "string",
      "location": "string",
      "coordinates": {"lat": number, "lng": number},
      "urgency_level": "string",
      "animal_type": "string",
      "situation_type": "string",
      "created_at": "ISO_string",
      "contact_info": {
        "name": "string",
        "email": "string",
        "phone": "string"
      }
    }
  ],
  "total": number
}
```

### 7. WhatsApp Notification
**Endpoint:** `POST /api/whatsapp-notify`
**Purpose:** Send WhatsApp notifications
**Body:**
```json
{
  "phone_number": "string (required)",
  "message": "string (required)",
  "report_id": "string (required)"
}
```

### 8. Health Check
**Endpoint:** `GET /api/health`
**Purpose:** Check API and service health
**Response:**
```json
{
  "server": "healthy",
  "overall_health": "healthy|degraded",
  "services": {
    "ai_analysis": "healthy|misconfigured|unhealthy",
    "email_notification": "healthy|misconfigured|unhealthy",
    "whatsapp": "healthy|misconfigured|unhealthy",
    "google_maps": "healthy|misconfigured|unhealthy",
    "supabase": "healthy|misconfigured|unhealthy",
    "file_upload": "healthy|unhealthy"
  },
  "healthy_services": number,
  "total_services": number
}
```

## Environment Variables Required

### Core Services
- `GROQ_API_KEY` - AI analysis service
- `BREVO_API_KEY` - Email notifications
- `TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN` - WhatsApp
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps
- `SUPABASE_URL` & `SUPABASE_API_KEY` - Database

### Optional Services
- `SENDGRID_API_KEY` - Backup email service
- `NEWS_API_KEY` - News integration

## Error Handling
All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Rate Limiting
- Window: 15 minutes (900,000ms)
- Max requests: 100 per window
- Applies to all POST endpoints

## File Upload Limits
- Max file size: 10MB
- Supported formats: JPEG, PNG, WebP
- Upload directory: `./public/uploads`
