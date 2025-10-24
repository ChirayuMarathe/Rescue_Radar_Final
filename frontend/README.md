# 🚨 Rescue Radar - Frontend

A Next.js-based web application for disaster management and rescue coordination with real-time alerts and emergency response coordination.

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Environment Setup

Create `.env.local` in this directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── src/                    # React components and styles
│   ├── components/        # Reusable React components
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── index.css
├── pages/                 # Next.js pages and API routes
│   ├── api/              # Backend API integration
│   ├── _app.js
│   ├── index.js          # Homepage
│   ├── report.js         # Report submission page
│   └── reports-map.js    # Map view
├── services/              # API service modules
│   └── api.js            # API client
├── utils/                 # Utility functions
│   ├── helpers.js
│   └── supabaseClient.js
├── tests/                 # Test files
├── docs/                  # Documentation
├── public/                # Static assets
├── package.json           # Dependencies
├── next.config.js        # Next.js configuration
├── netlify.toml          # Netlify deployment config
├── tailwind.config.js    # Tailwind CSS config
├── postcss.config.js     # PostCSS config
└── index.html            # HTML template
```

## 🛠️ Technologies

- **Next.js 15.3** - React framework
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Google Maps API** - Geolocation
- **Supabase** - Backend database
- **QR Code** - QR code generation
- **Axios** - HTTP client

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:check` - Check ESLint without fixing
- `npm run type-check` - Type checking
- `npm run analyze` - Bundle analysis

## 🌐 Deployment

### Deploy to Netlify

1. Connect this repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy!

For more details, see `netlify.toml`

## 📦 Key Components

- **Hero Section** - Landing page showcase
- **Report Form** - Emergency report submission
- **NGO Map** - Map view of rescue organizations
- **Animated Cards** - Interactive UI elements
- **Stats Dashboard** - Real-time statistics
- **Knowledge Center** - Emergency guides
- **Testimonials** - User stories

## 🔗 API Integration

The frontend connects to the Flask backend at:

- Development: `http://localhost:5000`
- Production: Backend URL from environment

## 📝 Notes

- All API calls are handled through `services/api.js`
- Supabase is used for real-time database
- Google Maps API for geolocation
- Responsive design for mobile and desktop
