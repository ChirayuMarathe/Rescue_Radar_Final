# 🚨 Rescue Radar

A comprehensive disaster management and rescue coordination platform built with Next.js and Flask.

## 📁 Project Structure

```
Rescue-Radar/
├── frontend/          # Next.js React application
│   ├── pages/        # Next.js pages and API routes
│   ├── src/          # React components
│   ├── public/       # Static assets
│   ├── utils/        # Utility functions
│   └── package.json  # Frontend dependencies
│
├── backend/          # Flask REST API
│   ├── routes/       # API endpoints
│   ├── app.py        # Flask application
│   ├── requirements.txt
│   └── database_schema.sql
│
├── docs/             # Documentation and guides
└── .gitignore        # Git ignore rules
```

## 🚀 Quick Start

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3002
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
# API runs on http://localhost:5000
```

## 🛠️ Technologies

**Frontend:**
- Next.js 15.3
- React 19
- Tailwind CSS
- Framer Motion (animations)
- Google Maps API
- Supabase (database)

**Backend:**
- Flask 2.3
- Python 3.x
- Twilio (SMS/WhatsApp)
- GROQ API (AI analysis)
- Supabase (database)

## 📝 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
GROQ_API_KEY=your_groq_key
```

## 📦 Deployment

- **Frontend:** Netlify
- **Backend:** Vercel or Railway

## 📚 Documentation

See `docs/` folder for detailed guides:
- `DEPLOYMENT_OPTIMIZATION_COMPLETE.md` - Deployment guide
- `MOBILE_RESPONSIVENESS_IMPLEMENTATION.md` - Responsive design details

## 👥 Contributors

- Gaurav Patil
- Chirayu Marathe

## 📄 License

MIT License

