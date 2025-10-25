/**
 * Mock Data for Demo Deployment
 * Use this data when environment variables are not available
 * This allows full deployment without backend services
 */

export const MOCK_REPORTS = [
  {
    id: 1,
    title: "Flash Flood Alert",
    description: "Heavy rainfall causing flash floods in low-lying areas",
    location: "Mumbai, Maharashtra",
    latitude: 19.0760,
    longitude: 72.8777,
    status: "active",
    severity: "high",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reporter_name: "Disaster Management Team",
    affected_people: 500,
    category: "flood"
  },
  {
    id: 2,
    title: "Cyclone Warning",
    description: "Severe cyclonic storm approaching coastal areas",
    location: "Chennai, Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    status: "active",
    severity: "critical",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    reporter_name: "IMD (Indian Meteorological Department)",
    affected_people: 2000,
    category: "cyclone"
  },
  {
    id: 3,
    title: "Landslide Risk Zone",
    description: "Heavy rainfall has made slopes unstable in hilly areas",
    location: "Shimla, Himachal Pradesh",
    latitude: 31.7724,
    longitude: 77.1025,
    status: "active",
    severity: "medium",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    reporter_name: "State Disaster Management Authority",
    affected_people: 150,
    category: "landslide"
  },
  {
    id: 4,
    title: "Earthquake Aftershock",
    description: "Strong aftershock following morning earthquake",
    location: "Delhi, National Capital Region",
    latitude: 28.7041,
    longitude: 77.1025,
    status: "active",
    severity: "high",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    reporter_name: "USGS Alert System",
    affected_people: 1000,
    category: "earthquake"
  },
  {
    id: 5,
    title: "Wildfire Outbreak",
    description: "Large forest fire spreading rapidly in dry conditions",
    location: "Bangalore, Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    status: "active",
    severity: "high",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    reporter_name: "Forest Department",
    affected_people: 300,
    category: "wildfire"
  },
  {
    id: 6,
    title: "Heavy Rainfall",
    description: "Unexpected heavy rainfall in urban areas",
    location: "Pune, Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
    status: "resolved",
    severity: "medium",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    reporter_name: "Weather Department",
    affected_people: 200,
    category: "flood"
  }
];

export const MOCK_NGOS = [
  {
    id: 1,
    name: "Doctors Without Borders",
    location: "Mumbai, Maharashtra",
    latitude: 19.0760,
    longitude: 72.8777,
    expertise: ["Medical", "Disaster Relief"],
    contact: "+91-98765-43210",
    active_operations: 3
  },
  {
    id: 2,
    name: "National Disaster Response Force",
    location: "Delhi, National Capital Region",
    latitude: 28.7041,
    longitude: 77.1025,
    expertise: ["Search & Rescue", "Disaster Management"],
    contact: "+91-11-2671-4320",
    active_operations: 5
  },
  {
    id: 3,
    name: "Indian Red Cross Society",
    location: "Chennai, Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    expertise: ["First Aid", "Emergency Response"],
    contact: "+91-44-2811-0000",
    active_operations: 2
  },
  {
    id: 4,
    name: "Médecins Sans Frontières",
    location: "Bangalore, Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    expertise: ["Medical", "Humanitarian Aid"],
    contact: "+91-80-4016-5000",
    active_operations: 1
  },
  {
    id: 5,
    name: "OXFAM India",
    location: "Kolkata, West Bengal",
    latitude: 22.5726,
    longitude: 88.3639,
    expertise: ["Food Distribution", "Shelter"],
    contact: "+91-33-4400-5555",
    active_operations: 2
  }
];

export const MOCK_STATS = {
  total_active_alerts: 5,
  total_affected_people: 4150,
  total_ngos_deployed: 13,
  response_teams_active: 12,
  resources_distributed: 847,
  communities_helped: 156,
  critical_zones: 2,
  high_priority_zones: 2
};

export const MOCK_STORIES = [
  {
    id: 1,
    title: "Community Comes Together During Flood",
    description: "Local residents helped rescue 50+ families during the unexpected flooding",
    location: "Mumbai",
    date: "2025-10-23",
    image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500",
    story_type: "success"
  },
  {
    id: 2,
    title: "NGO Provides Emergency Medical Aid",
    description: "Doctors Without Borders set up emergency medical camps in 3 locations",
    location: "Delhi",
    date: "2025-10-24",
    image_url: "https://images.unsplash.com/photo-1576091160679-112d8973e9d8?w=500",
    story_type: "help"
  },
  {
    id: 3,
    title: "Volunteers Feed Thousands",
    description: "Over 500 volunteers distributed 2000+ meals to affected families",
    location: "Pune",
    date: "2025-10-22",
    image_url: "https://images.unsplash.com/photo-1567982846556-331cbb5019fa?w=500",
    story_type: "help"
  }
];

export const MOCK_TESTIMONIALS = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Survivor",
    testimonial: "RescueRadar helped us find immediate assistance during the flood. The app connected us with local NGOs within minutes.",
    rating: 5
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "NGO Coordinator",
    testimonial: "As an NGO coordinator, RescueRadar makes it incredibly easy to coordinate our disaster response efforts across multiple cities.",
    rating: 5
  },
  {
    id: 3,
    name: "Amit Patel",
    role: "Volunteer",
    testimonial: "The real-time alerts and location-based recommendations help me reach those in need faster than ever before.",
    rating: 4
  },
  {
    id: 4,
    name: "Dr. Sneha Desai",
    role: "Disaster Management Expert",
    testimonial: "RescueRadar's AI analysis provides actionable insights that help us make better disaster response decisions.",
    rating: 5
  }
];

export const MOCK_KNOWLEDGE_BASE = [
  {
    id: 1,
    title: "Earthquake Safety Guide",
    description: "Essential steps to stay safe during an earthquake",
    category: "earthquake",
    tips: [
      "Drop, Cover, and Hold On immediately",
      "Stay away from windows and heavy objects",
      "If outdoors, move away from buildings",
      "If in a vehicle, pull over safely"
    ]
  },
  {
    id: 2,
    title: "Flood Preparedness",
    description: "How to prepare for and survive flooding",
    category: "flood",
    tips: [
      "Know your local evacuation routes",
      "Keep emergency supplies ready",
      "Never drive through flooded areas",
      "Move to higher ground immediately if ordered"
    ]
  },
  {
    id: 3,
    title: "Cyclone/Hurricane Safety",
    description: "Steps to stay safe during severe storms",
    category: "cyclone",
    tips: [
      "Board up windows and doors",
      "Stock up on water and food",
      "Secure outdoor items",
      "Stay indoors away from windows during the storm"
    ]
  },
  {
    id: 4,
    title: "Wildfire Evacuation",
    description: "Emergency evacuation procedures for wildfires",
    category: "wildfire",
    tips: [
      "Listen to local emergency alerts",
      "Pack important documents",
      "Have transportation ready",
      "Never look back once evacuation is ordered"
    ]
  },
  {
    id: 5,
    title: "First Aid Basics",
    description: "Essential first aid skills for emergencies",
    category: "medical",
    tips: [
      "Learn CPR and AED usage",
      "Know how to stop severe bleeding",
      "Understand basic wound care",
      "Recognize signs of shock"
    ]
  }
];

export const useOfflineMode = () => {
  /**
   * Hook to use mock data when services are offline
   * Returns true if in offline/demo mode
   */
  return {
    isOffline: !process.env.NEXT_PUBLIC_SUPABASE_URL,
    reports: MOCK_REPORTS,
    ngos: MOCK_NGOS,
    stats: MOCK_STATS,
    stories: MOCK_STORIES,
    testimonials: MOCK_TESTIMONIALS,
    knowledgeBase: MOCK_KNOWLEDGE_BASE
  };
};
