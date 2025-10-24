import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { 
  Loader2, MapPin, Clock, AlertTriangle, Phone, Mail, 
  Filter, Layers, RefreshCw, Send, Building2, ExternalLink,
  Search, X, CheckCircle, MapIcon, Users
} from 'lucide-react';
import { apiService } from '../services/api';

export default function ReportsMapPage() {
  const [reports, setReports] = useState([]);
  const [nearbyOrgs, setNearbyOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [map, setMap] = useState(null);
  const [reportMarkers, setReportMarkers] = useState([]);
  const [orgMarkers, setOrgMarkers] = useState([]);
  const [placesService, setPlacesService] = useState(null);
  
  // Filter and view states
  const [activeFilters, setActiveFilters] = useState({
    showReports: true,
    showOrgs: true,
    urgencyLevels: ['emergency', 'high', 'normal', 'low'],
    timeRange: 'all' // all, 24h, 7d, 30d
  });
  
  // UI states
  const [emailModal, setEmailModal] = useState({ open: false, org: null, report: null });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGoogleMaps();
    fetchReports();
    
    // Set up auto-refresh for real-time updates
    if (autoRefresh) {
      const interval = setInterval(fetchReports, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  useEffect(() => {
    if (map && reports.length > 0) {
      addReportMarkersToMap();
      if (selectedReport) {
        findNearbyOrganizations(selectedReport.coordinates);
      }
    }
  }, [map, reports, activeFilters]);

  const loadGoogleMaps = () => {
    if (window.google) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    const mapOptions = {
      center: { lat: 40.7128, lng: -74.0060 },
      zoom: 12,
      styles: mapStyles
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

  const fetchReports = async () => {
    try {
      const data = await apiService.getActiveReports();
      if (data.success) {
        setReports(data.reports || []);
        console.log(`Loaded ${data.reports?.length || 0} reports from ${data.source || 'database'}`);
      } else {
        console.error('API returned error:', data.message);
        setReports(mockReports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports(mockReports);
    } finally {
      setLoading(false);
    }
  };

  const addReportMarkersToMap = () => {
    // Clear existing report markers
    reportMarkers.forEach(marker => marker.setMap(null));
    
    const filteredReports = reports.filter(report => {
      const urgencyMatch = activeFilters.urgencyLevels.includes(report.urgency_level);
      const timeMatch = filterByTimeRange(report, activeFilters.timeRange);
      const searchMatch = searchQuery === '' || 
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.animal_type?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return urgencyMatch && timeMatch && searchMatch && activeFilters.showReports;
    });

    const newMarkers = filteredReports.map(report => {
      const marker = new window.google.maps.Marker({
        position: report.coordinates,
        map: map,
        title: `Report #${report.id}`,
        icon: getReportMarkerIcon(report.urgency_level),
        zIndex: 1000
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: createReportInfoWindowContent(report)
      });

      marker.addListener('click', () => {
        setSelectedReport(report);
        infoWindow.open(map, marker);
        findNearbyOrganizations(report.coordinates);
      });

      return marker;
    });

    setReportMarkers(newMarkers);

    // Adjust map bounds to show all visible markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      filteredReports.forEach(report => {
        bounds.extend(report.coordinates);
      });
      map.fitBounds(bounds);
    }
  };

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
        addOrgMarkersToMap(organizations);
        
        // Get detailed info for each organization
        organizations.forEach(org => {
          getOrganizationDetails(org.place_id);
        });
      }
    });
  }, [placesService, map, activeFilters.showOrgs, orgMarkers]);

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

  const addOrgMarkersToMap = (organizations) => {
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
  };

  const filterByTimeRange = (report, timeRange) => {
    if (timeRange === 'all') return true;
    
    const now = new Date();
    const reportTime = new Date(report.created_at);
    const diffInHours = (now - reportTime) / (1000 * 60 * 60);
    
    switch (timeRange) {
      case '24h': return diffInHours <= 24;
      case '7d': return diffInHours <= 168; // 7 * 24
      case '30d': return diffInHours <= 720; // 30 * 24
      default: return true;
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
        </div>
      </div>
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

  return (
    <>
      <Head>
        <title>Live Reports Map - RescueRadar</title>
        <meta name="description" content="Real-time animal rescue reports and nearby organizations" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header with Controls */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Live Reports Map</h1>
                <p className="text-gray-600 mt-1">
                  Real-time animal rescue reports and nearby rescue organizations
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="text-sm">
                  <span className="font-medium text-gray-900">{reports.length}</span>
                  <span className="text-gray-600 ml-1">Reports</span>
                  <span className="text-gray-400 mx-2">|</span>
                  <span className="font-medium text-blue-600">{nearbyOrgs.length}</span>
                  <span className="text-gray-600 ml-1">Organizations</span>
                </div>

                {/* Auto-refresh toggle */}
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                  Live
                </button>

                <button
                  onClick={() => window.location.href = '/report'}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Report Incident
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

        {/* Main Content */}
        <div className="flex h-[calc(100vh-200px)]">
          {/* Map Container */}
          <div className="flex-1 relative">
            {loading ? (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
                  <p className="text-gray-600">Loading live reports map...</p>
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
                          className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
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
                
                {reports.length === 0 && !loading && (
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
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <h4 className="font-medium text-orange-900 mb-1">
                          Report #{emailModal.report.id}
                        </h4>
                        <p className="text-sm text-orange-700 mb-2">
                          {emailModal.report.description.substring(0, 100)}...
                        </p>
                        <div className="text-xs text-orange-600">
                          <span className="font-medium">Location:</span> {emailModal.report.location}
                        </div>
                        <div className="text-xs text-orange-600">
                          <span className="font-medium">Urgency:</span> {emailModal.report.urgency_level.toUpperCase()}
                        </div>
                      </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Email Preview:</strong> This will send an urgent rescue alert with the report details to {emailModal.org.name}.
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
    </>
  );
}

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
  }
];

// Enhanced mock data for demo purposes
const mockReports = [
  {
    id: "RPT001",
    description: "Injured stray dog with visible wounds on leg, appears to be in pain and limping badly. The dog seems friendly but scared and needs immediate veterinary attention.",
    location: "123 5th Avenue, Manhattan, New York, NY",
    coordinates: { lat: 40.7831, lng: -73.9712 },
    urgency_level: "high",
    animal_type: "dog",
    situation_type: "injury",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    contact_info: {
      name: "Sarah Johnson",
      phone: "+1-555-0123",
      email: "sarah@example.com"
    }
  },
  {
    id: "RPT002", 
    description: "Cat stuck in tree for 2 days, very weak and not responding to calls. Neighbors are concerned as it hasn't moved much.",
    location: "456 Central Park West, New York, NY",
    coordinates: { lat: 40.7829, lng: -73.9654 },
    urgency_level: "normal",
    animal_type: "cat",
    situation_type: "rescue",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    contact_info: {
      name: "Mike Chen",
      phone: "+1-555-0124"
    }
  },
  {
    id: "RPT003",
    description: "Multiple dogs being kept in poor conditions, no food or water visible, very crowded space. This appears to be a serious neglect case.",
    location: "789 Brooklyn Avenue, Brooklyn, NY", 
    coordinates: { lat: 40.6782, lng: -73.9442 },
    urgency_level: "emergency",
    animal_type: "dog",
    situation_type: "neglect",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    contact_info: {
      name: "Anonymous Reporter"
    }
  },
  {
    id: "RPT004",
    description: "Horse being overworked and showing signs of exhaustion, owner refusing to provide rest. Animal appears distressed.",
    location: "321 Queens Boulevard, Queens, NY",
    coordinates: { lat: 40.7282, lng: -73.7949 },
    urgency_level: "high",
    animal_type: "horse", 
    situation_type: "abuse",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    contact_info: {
      name: "Dr. Jennifer Martinez",
      phone: "+1-555-0125",
      email: "jennifer.vet@example.com"
    }
  },
  {
    id: "RPT005",
    description: "Small bird found with broken wing, unable to fly. Appears to be a young pigeon that was likely hit by something.",
    location: "Central Park, Near Bethesda Fountain, NY",
    coordinates: { lat: 40.7759, lng: -73.9719 },
    urgency_level: "normal",
    animal_type: "bird",
    situation_type: "injury",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    contact_info: {
      name: "Emily Rodriguez",
      phone: "+1-555-0126",
      email: "emily.r@example.com"
    }
  },
  {
    id: "RPT006",
    description: "Stray cat colony needs urgent assistance - several cats appear sick and malnourished. Community feeding has stopped.",
    location: "Washington Square Park, Greenwich Village, NY",
    coordinates: { lat: 40.7308, lng: -73.9975 },
    urgency_level: "high",
    animal_type: "cat",
    situation_type: "neglect",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    contact_info: {
      name: "Community Volunteer",
      email: "volunteer@example.com"
    }
  }
];
