import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { 
  Loader2, MapPin, Clock, AlertTriangle, Phone, Mail, 
  Filter, Layers, RefreshCw, Send, Building2, ExternalLink,
  Search, X, CheckCircle, MapIcon, Users
} from 'lucide-react';
import { apiService } from '../services/api';

// Map styling
const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'simplified' }]
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e9e9e9' }]
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#dadada' }]
  },
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#444444' }]
  }
];

function ReportsMapPage() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [map, setMap] = useState(null);
  const [reportMarkers, setReportMarkers] = useState([]);
  const [orgMarkers, setOrgMarkers] = useState([]);
  const [placesService, setPlacesService] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    urgencyLevels: ['emergency', 'high', 'normal', 'low'],
    timeRange: 'all',
    showReports: true,
    showOrgs: true
  });
  const [nearbyOrgs, setNearbyOrgs] = useState([]);
  const [emailModal, setEmailModal] = useState({
    open: false,
    org: null,
    report: null
  });

  const fetchReports = useCallback(async () => {
    if (!isMapLoading) setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getActiveReports();
      if (response.success) {
        setReports(response.reports || []);
      } else {
        throw new Error(response.message || 'Failed to load reports');
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      
      // Use fallback demo data when API fails
      const fallbackReports = [
        {
          id: 'demo-001',
          description: 'Injured stray dog found near Mumbai Central Station. The dog appears to have a leg injury and is limping. Local residents have been feeding it but professional medical attention is needed.',
          location: 'Mumbai Central Railway Station, Mumbai, Maharashtra',
          coordinates: { lat: 19.0707, lng: 72.8203 },
          urgency_level: 'high',
          animal_type: 'dog',
          situation_type: 'injury',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          contact_info: {
            name: 'Concerned Citizen',
            phone: '+91-9876543210'
          }
        },
        {
          id: 'demo-002',
          description: 'Cat stuck on high-rise building terrace for over 24 hours. Building residents report the cat appears weak and hasn\'t eaten. Fire department assistance may be required.',
          location: 'Worli Sea Face, Mumbai, Maharashtra',
          coordinates: { lat: 19.0176, lng: 72.8151 },
          urgency_level: 'emergency',
          animal_type: 'cat',
          situation_type: 'rescue',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          contact_info: {
            name: 'Building Society',
            email: 'society@example.com'
          }
        },
        {
          id: 'demo-003',
          description: 'Multiple street dogs showing signs of poisoning in residential area. Three dogs found unconscious, immediate veterinary attention required.',
          location: 'Bandra West, Mumbai, Maharashtra',
          coordinates: { lat: 19.0596, lng: 72.8295 },
          urgency_level: 'emergency',
          animal_type: 'dog',
          situation_type: 'abuse',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          contact_info: {
            name: 'Animal Welfare Volunteer',
            phone: '+91-9876543211',
            email: 'volunteer@animalcare.org'
          }
        },
        {
          id: 'demo-004',
          description: 'Abandoned kitten found in cardboard box near market area. Kitten appears very young and needs immediate care and feeding.',
          location: 'Crawford Market, Mumbai, Maharashtra',
          coordinates: { lat: 18.9467, lng: 72.8342 },
          urgency_level: 'normal',
          animal_type: 'cat',
          situation_type: 'abandonment',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          contact_info: {
            name: 'Market Vendor',
            phone: '+91-9876543212'
          }
        }
      ];
      
      setReports(fallbackReports);
      setError({
        message: 'Using demo data - API connection failed. The map shows sample reports for demonstration.',
        retry: fetchReports
      });
    } finally {
      setIsLoading(false);
    }
  }, [isMapLoading, retryCount]);

  useEffect(() => {
    loadGoogleMaps();
    fetchReports();
    
    // Set up auto-refresh for real-time updates
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchReports, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    }
    
    // Cleanup function to clear interval when component unmounts
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchReports]);

  // Function to get a more visible marker icon based on urgency level

  const addReportMarkersToMap = useCallback(() => {
    if (!map) return;
    
    // Clear existing report markers
    reportMarkers.forEach(marker => marker.setMap(null));

    // Mumbai boundary coordinates (approximate polygon around Mumbai)
    const mumbaiBoundary = [
      { lat: 19.2870, lng: 72.8686 }, // North-West
      { lat: 19.0790, lng: 72.9980 }, // North-East
      { lat: 18.9060, lng: 72.8230 }, // South-East
      { lat: 19.0200, lng: 72.7920 }, // South-West
      { lat: 19.2870, lng: 72.8686 }  // Close the polygon
    ];

    // Check if coordinates are within Mumbai boundary
    const isInMumbai = (coords) => {
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return false;
      
      // Create a temporary polygon for boundary checking (not added to map)
      const mumbaiPolygon = new window.google.maps.Polygon({
        paths: mumbaiBoundary
      });
      
      return window.google.maps.geometry.poly.containsLocation(
        new window.google.maps.LatLng(coords.lat, coords.lng),
        mumbaiPolygon
      );
    };

    const filteredReports = reports.filter(report => {
      const urgencyMatch = activeFilters.urgencyLevels.includes(report.urgency_level);
      const timeMatch = filterByTimeRange(report, activeFilters.timeRange);
      const searchMatch = searchQuery === '' || 
        (report.description && report.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (report.location && report.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (report.animal_type && report.animal_type.toLowerCase().includes(searchQuery.toLowerCase()));
      const mumbaiMatch = isInMumbai(report.coordinates);
      return urgencyMatch && timeMatch && searchMatch && activeFilters.showReports && mumbaiMatch;
    });

    const newMarkers = filteredReports.map(report => {
      if (!report.coordinates || typeof report.coordinates.lat !== 'number' || typeof report.coordinates.lng !== 'number') return null;
      
      // Create a more prominent marker for injury reports
      const isInjury = report.situation_type?.toLowerCase().includes('injury') || 
                      report.description?.toLowerCase().includes('injur') ||
                      report.urgency_level === 'emergency' || 
                      report.urgency_level === 'high';
      
      const marker = new window.google.maps.Marker({
        position: report.coordinates,
        map: map,
        title: `Report #${report.id}: ${report.situation_type || 'Report'}`,
        icon: isInjury ? 
          {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#FF0000',
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
            scale: 10,
            labelOrigin: new window.google.maps.Point(0, 0)
          } : getReportMarkerIcon(report.urgency_level),
        zIndex: isInjury ? 2000 : 1000,
        animation: isInjury ? window.google.maps.Animation.DROP : null
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: createReportInfoWindowContent(report)
      });

      marker.addListener('click', () => {
        setSelectedReport(report);
        infoWindow.open(map, marker);
        // Find nearby organizations when a report is selected
        if (placesService && activeFilters.showOrgs) {
          findNearbyOrganizations(report.coordinates);
        }
      });

      return marker;
    }).filter(Boolean);

    setReportMarkers(newMarkers);

    // Adjust map bounds to show all visible markers, or center on Mumbai if none
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      filteredReports.forEach(report => {
        if (report.coordinates && typeof report.coordinates.lat === 'number' && typeof report.coordinates.lng === 'number') {
          bounds.extend(report.coordinates);
        }
      });
      map.fitBounds(bounds);
    } else {
      // No reports: center on Mumbai
      map.setCenter({ lat: 19.0760, lng: 72.8777 });
      map.setZoom(12);
    }
  }, [map, reports, activeFilters, searchQuery, placesService, reportMarkers]);

  useEffect(() => {
    if (map && reports.length > 0) {
      addReportMarkersToMap();
      if (selectedReport) {
        findNearbyOrganizations(selectedReport.coordinates);
      }
    }
  }, [map, reports, activeFilters, selectedReport, addReportMarkersToMap]);


  const loadGoogleMaps = () => {
    if (window.google) {
      initializeMap();
      setIsMapLoading(false);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not found');
      setError({
        message: 'Google Maps API key is missing. Please configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.',
        retry: null
      });
      setIsMapLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.onload = () => {
      try {
        initializeMap();
        setIsMapLoading(false);
      } catch (error) {
        console.error('Error initializing map after script load:', error);
        setError({
          message: 'Failed to initialize Google Maps. Please check your API key and try again.',
          retry: loadGoogleMaps
        });
        setIsMapLoading(false);
      }
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      setError({
        message: 'Failed to load Google Maps. Please check your internet connection and API key.',
        retry: loadGoogleMaps
      });
      setIsMapLoading(false);
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    // Center on Mumbai, India with optimized view
    const mapOptions = {
      center: { lat: 19.0760, lng: 72.8777 },
      zoom: 11,
      styles: mapStyles,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_RIGHT
      },
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER
      },
      fullscreenControl: true,
      streetViewControl: false,
      scaleControl: true
    };

    try {
      const mapInstance = new window.google.maps.Map(mapContainer, mapOptions);
      setMap(mapInstance);
      
      // Initialize Places service for finding nearby organizations
      const places = new window.google.maps.places.PlacesService(mapInstance);
      setPlacesService(places);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };



  const addOrgMarkersToMap = useCallback((organizations) => {
    if (!map) return;
    
    const newOrgMarkers = organizations.map(org => {
      const marker = new window.google.maps.Marker({
        position: org.location,
        map: map,
        title: org.name,
        icon: getOrgMarkerIcon(),
        zIndex: 500
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: createOrgInfoWindowContent(org)
      });

      marker.addListener('click', () => {
        setSelectedOrg(org);
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setOrgMarkers(newOrgMarkers);
  }, [map]);

  const findNearbyOrganizations = useCallback((location) => {
    if (!placesService || !activeFilters.showOrgs) return;

    // Clear existing org markers
    orgMarkers.forEach(marker => marker.setMap(null));
    setOrgMarkers([]);
    setNearbyOrgs([]);

    const request = {
      location: location,
      radius: 10000, // 10km radius
      keyword: 'animal welfare veterinary shelter rescue',
      type: ['veterinary_care', 'establishment']
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesService.OK) {
        const organizations = results.slice(0, 10).map(place => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          },
          rating: place.rating,
          types: place.types,
          photos: place.photos,
          place_id: place.place_id
        }));

        setNearbyOrgs(organizations);
        
        // Create markers for organizations
        const newOrgMarkers = organizations.map(org => {
          const marker = new window.google.maps.Marker({
            position: org.location,
            map: map,
            title: org.name,
            icon: getOrgMarkerIcon(),
            zIndex: 500
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: createOrgInfoWindowContent(org)
          });

          marker.addListener('click', () => {
            setSelectedOrg(org);
            infoWindow.open(map, marker);
          });

          return marker;
        });

        setOrgMarkers(newOrgMarkers);
        
        // Get detailed info for each organization
        organizations.forEach(org => {
          getOrganizationDetails(org.place_id);
        });
      }
    });
  }, [placesService, activeFilters.showOrgs, map]);

  const getOrganizationDetails = (placeId) => {
    if (!placesService) return;

    const request = {
      placeId: placeId,
      fields: ['name', 'formatted_phone_number', 'website', 'email', 'opening_hours', 'reviews']
    };

    placesService.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesService.OK) {
        setNearbyOrgs(prev => prev.map(org => 
          org.place_id === placeId 
            ? { 
                ...org, 
                phone: place.formatted_phone_number,
                website: place.website,
                email: place.email,
                hours: place.opening_hours?.weekday_text,
                reviews: place.reviews
              }
            : org
        ));
      }
    });
  };



  const filterByTimeRange = (report, timeRange) => {
    if (timeRange === 'all') return true;
    
    const now = new Date();
    const reportTime = new Date(report.created_at);
    const diffInHours = (now - reportTime) / (1000 * 60 * 60);
    
    switch (timeRange) {
      case '24h': 
        return diffInHours <= 24;
      case '7d': 
        return diffInHours <= 168; // 7 * 24
      case '30d': 
        return diffInHours <= 720; // 30 * 24
      default: 
        return true;
    }
  };

  const getReportMarkerIcon = (urgencyLevel) => {
    const colors = {
      'emergency': '#dc2626',
      'high': '#ea580c',
      'normal': '#eab308',
      'low': '#16a34a'
    };
    
    const color = colors[urgencyLevel] || colors.normal;
    
    return {
      url: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 32)
    };
  };

  const getOrgMarkerIcon = () => {
    return {
      url: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#2563eb" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(28, 28),
      anchor: new window.google.maps.Point(14, 28)
    };
  };

  const createReportInfoWindowContent = (report) => {
    return `
      <div style="max-width: 300px; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
          Report #${report.id}
        </h3>
        <p style="margin: 0 0 8px 0; color: #374151; font-size: 12px; line-height: 1.4;">
          ${report.description.substring(0, 100)}...
        </p>
        <div style="font-size: 11px; color: #6b7280;">
          <div><strong>Animal:</strong> ${report.animal_type || 'Not specified'}</div>
          <div><strong>Urgency:</strong> ${report.urgency_level.toUpperCase()}</div>
          <div><strong>Time:</strong> ${formatTimeAgo(report.created_at)}</div>
    `;
  };

  const createOrgInfoWindowContent = (org) => {
    return `
      <div style="max-width: 300px; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
          ${org.name}
        </h3>
        <p style="margin: 0 0 8px 0; color: #374151; font-size: 12px;">
          ${org.address}
        </p>
        ${org.phone ? `<div style="font-size: 11px; color: #6b7280;"><strong>Phone:</strong> ${org.phone}</div>` : ''}
        ${org.rating ? `<div style="font-size: 11px; color: #6b7280;"><strong>Rating:</strong> ${org.rating}/5</div>` : ''}
        <button onclick="window.parent.openEmailModal('${org.id}')" 
                style="margin-top: 8px; background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">
          Send Email
        </button>
      </div>
    `;
  };

  const handleEmailOrganization = async (org, report) => {
    if (!org.email && !org.phone) {
      alert('No contact information available for this organization');
      return;
    }

    try {
      const emailData = {
        to_email: org.email || 'contact@example.com', // Fallback if no email
        subject: `Urgent Animal Rescue Alert - Report #${report?.id || 'N/A'}`,
        report_id: report?.id,
        organization_name: org.name,
        report_details: report ? {
          description: report.description,
          location: report.location,
          animal_type: report.animal_type,
          urgency_level: report.urgency_level,
          contact_info: report.contact_info
        } : null
      };

      const result = await apiService.sendEmailNotification(emailData);
      
      if (result.success) {
        alert(`Email sent successfully to ${org.name}!`);
        setEmailModal({ open: false, org: null, report: null });
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email send error:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const toggleFilter = (filterType, value) => {
    setActiveFilters(prev => {
      if (filterType === 'urgencyLevels') {
        const newLevels = prev.urgencyLevels.includes(value)
          ? prev.urgencyLevels.filter(level => level !== value)
          : [...prev.urgencyLevels, value];
        return { ...prev, urgencyLevels: newLevels };
      } else {
        return { ...prev, [filterType]: value };
      }
    });
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const reportTime = new Date(timestamp);
    const diffInHours = Math.floor((now - reportTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getUrgencyColor = (level) => {
    const colors = {
      'emergency': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'normal': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[level] || colors.normal;
  };

  // Global function for info window buttons
  useEffect(() => {
    window.openEmailModal = (orgId) => {
      const org = nearbyOrgs.find(o => o.id === orgId);
      if (org) {
        setEmailModal({ open: true, org, report: selectedReport });
      }
    };
  }, [nearbyOrgs, selectedReport]);

  // Define map styles
  const mapStyles = [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'road',
      elementType: 'labels',
      stylers: [{ visibility: 'simplified' }]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>Live Reports Map - RescueRadar</title>
        <meta name="description" content="Real-time animal rescue reports and nearby organizations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">RescueRadar</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Real-time animal rescue reports and nearby organizations
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Stats */}
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <span className="font-medium text-gray-900">{reports.length}</span>
                  <span>Reports</span>
                  <span className="text-gray-300">|</span>
                  <span className="font-medium text-blue-600">{nearbyOrgs.length}</span>
                  <span>Orgs</span>
                </div>

                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    autoRefresh 
                      ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  title={autoRefresh ? 'Auto-refresh is on' : 'Auto-refresh is off'}
                >
                  <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{autoRefresh ? 'Live' : 'Paused'}</span>
                </button>

                <button
                  onClick={() => window.location.href = '/report'}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Report Incident</span>
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="mt-4 flex items-center gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              {/* Layer toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFilter('showReports', !activeFilters.showReports)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                    activeFilters.showReports
                      ? 'bg-orange-100 text-orange-800 border-orange-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  <MapIcon className="h-3 w-3" />
                  Reports
                </button>
                <button
                  onClick={() => toggleFilter('showOrgs', !activeFilters.showOrgs)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                    activeFilters.showOrgs
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  <Building2 className="h-3 w-3" />
                  Organizations
                </button>
              </div>

              {/* Urgency filters */}
              <div className="flex items-center gap-1">
                {['emergency', 'high', 'normal', 'low'].map(level => (
                  <button
                    key={level}
                    onClick={() => toggleFilter('urgencyLevels', level)}
                    className={`px-2 py-1 rounded text-xs font-medium border ${
                      activeFilters.urgencyLevels.includes(level)
                        ? getUrgencyColor(level)
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              {/* Time range filter */}
              <select
                value={activeFilters.timeRange}
                onChange={(e) => toggleFilter('timeRange', e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
              >
                <option value="all">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Filters Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Layer toggles */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFilter('showReports', !activeFilters.showReports)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      activeFilters.showReports
                        ? 'bg-orange-100 text-orange-800 border-orange-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    <MapIcon className="h-3 w-3" />
                    <span>Reports</span>
                    <span className="ml-1 text-xs font-normal">({reports.length})</span>
                  </button>
                  <button
                    onClick={() => toggleFilter('showOrgs', !activeFilters.showOrgs)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      activeFilters.showOrgs
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    <Building2 className="h-3 w-3" />
                    <span>Organizations</span>
                    <span className="ml-1 text-xs font-normal">({nearbyOrgs.length})</span>
                  </button>
                </div>

                {/* Urgency filters */}
                <div className="flex items-center gap-1 flex-wrap">
                  {['emergency', 'high', 'normal', 'low'].map(level => (
                    <button
                      key={level}
                      onClick={() => toggleFilter('urgencyLevels', level)}
                      className={`px-2 py-1 rounded text-xs font-medium border ${
                        activeFilters.urgencyLevels.includes(level)
                          ? getUrgencyColor(level)
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Time range filter */}
                <select
                  value={activeFilters.timeRange}
                  onChange={(e) => toggleFilter('timeRange', e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1 bg-white h-7"
                >
                  <option value="all">All Time</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>

                {/* Auto-refresh toggle */}
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  <RefreshCw className={`h-3 w-3 ${autoRefresh ? 'animate-spin' : ''}`} />
                  <span>Auto-refresh {autoRefresh ? 'On' : 'Off'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Map and Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Map Container */}
          <div className="flex-1 relative min-h-[60vh] md:min-h-0">
            {isMapLoading ? (
              <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                  <Loader2 className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Map</h2>
                  <p className="text-gray-600">Please wait while we load the map...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
                  <p className="text-gray-600 mb-6">{error.message}</p>
                  {error.retry && (
                    <button
                      onClick={() => {
                        setError(null);
                        setRetryCount(0);
                        error.retry();
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center mx-auto"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        'Try Again'
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div 
                id="map" 
                className="w-full h-full"
                style={{
                  minHeight: '600px',
                  height: '100%',
                  backgroundColor: '#f3f4f6'
                }}
              />
            )}

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 border">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Map Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Emergency Reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Normal Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Rescue Organizations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            {selectedReport ? (
              /* Selected Report Details with Nearby Organizations */
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Report #{selectedReport.id}
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedReport(null);
                      setNearbyOrgs([]);
                      orgMarkers.forEach(marker => marker.setMap(null));
                      setOrgMarkers([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Report Details */}
                <div className="space-y-4 mb-6">
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(selectedReport.urgency_level)}`}>
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {selectedReport.urgency_level.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {selectedReport.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Location</h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                      <p className="text-gray-600 text-sm">
                        {selectedReport.location}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Animal Type:</span>
                        <span className="font-medium">{selectedReport.animal_type || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Situation:</span>
                        <span className="font-medium">{selectedReport.situation_type || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reported:</span>
                        <span className="font-medium">{formatTimeAgo(selectedReport.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedReport.contact_info && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                      <div className="space-y-2 text-sm">
                        {selectedReport.contact_info.name && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Name:</span>
                            <span>{selectedReport.contact_info.name}</span>
                          </div>
                        )}
                        {selectedReport.contact_info.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <a href={`tel:${selectedReport.contact_info.phone}`} className="text-blue-600 hover:underline">
                              {selectedReport.contact_info.phone}
                            </a>
                          </div>
                        )}
                        {selectedReport.contact_info.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <a href={`mailto:${selectedReport.contact_info.email}`} className="text-blue-600 hover:underline">
                              {selectedReport.contact_info.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Nearby Organizations */}
                {nearbyOrgs.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Nearby Organizations</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {nearbyOrgs.length}
                      </span>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {nearbyOrgs.map((org) => (
                        <div
                          key={org.id}
                          className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedOrg(org)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                              {org.name}
                            </h4>
                            {org.rating && (
                              <span className="text-xs text-yellow-600 bg-yellow-100 px-1 rounded">
                                ★ {org.rating}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {org.address}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            {org.phone && (
                              <a
                                href={`tel:${org.phone}`}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone className="h-3 w-3" />
                                Call
                              </a>
                            )}
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEmailModal({ open: true, org, report: selectedReport });
                              }}
                              className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                            >
                              <Send className="h-3 w-3" />
                              Email Alert
                            </button>
                            
                            {org.website && (
                              <a
                                href={org.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3" />
                                Website
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {reports.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reports found. Be the first to report an incident.</p>
                  </div>
                )}
                {isLoading && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              /* Reports List View */
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Live Reports</h2>
                  <button
                    onClick={fetchReports}
                    className="text-orange-600 hover:text-orange-700 p-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {reports
                    .filter(report => {
                      const urgencyMatch = activeFilters.urgencyLevels.includes(report.urgency_level);
                      const timeMatch = filterByTimeRange(report, activeFilters.timeRange);
                      const searchMatch = searchQuery === '' || 
                        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        report.animal_type?.toLowerCase().includes(searchQuery.toLowerCase());
                      return urgencyMatch && timeMatch && searchMatch;
                    })
                    .map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Report #{report.id}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(report.urgency_level)}`}>
                          {report.urgency_level}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {report.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-32">{report.location.substring(0, 30)}...</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(report.created_at)}</span>
                        </div>
                      </div>
                      
                      {report.animal_type && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                            {report.animal_type}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {reports.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No reports available</p>
                    <button
                      onClick={() => window.location.href = '/report'}
                      className="mt-2 text-orange-600 hover:text-orange-700 text-sm"
                    >
                      Submit the first report
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Email Modal */}
        {emailModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Send Email Alert
                  </h3>
                  <button
                    onClick={() => setEmailModal({ open: false, org: null, report: null })}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {emailModal.org && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-1">
                        {emailModal.org.name}
                      </h4>
                      <p className="text-sm text-blue-700">
                        {emailModal.org.address}
                      </p>
                      {emailModal.org.phone && (
                        <p className="text-sm text-blue-700 mt-1">
                          📞 {emailModal.org.phone}
                        </p>
                      )}
                    </div>

                    {emailModal.report && (
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 mb-4">
                        <h4 className="font-medium text-orange-900 mb-1">
                          Report #{emailModal.report.id}
                        </h4>
                        <p className="text-sm text-orange-700 mb-2">
                          {emailModal.report.description ? `${emailModal.report.description.substring(0, 100)}...` : 'No description available'}
                        </p>
                        <div className="text-xs text-orange-600">
                          <span className="font-medium">Location:</span> {emailModal.report.location || 'Location not specified'}
                        </div>
                        <div className="text-xs text-orange-600">
                          <span className="font-medium">Urgency:</span> {emailModal.report.urgency_level ? emailModal.report.urgency_level.toUpperCase() : 'UNKNOWN'}
                        </div>
                      </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Email Preview:</strong> This will send an urgent rescue alert with the report details to {emailModal.org?.name || 'the organization'}.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setEmailModal({ open: false, org: null, report: null })}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEmailOrganization(emailModal.org, emailModal.report)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Send Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsMapPage;
