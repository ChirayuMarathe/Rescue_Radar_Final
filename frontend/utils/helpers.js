// Utility functions for RescueRadar

// Form validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// File validation utilities
export const validateImageFile = (file) => {
  if (!file) return { valid: false, error: 'No file provided' };
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  return { valid: true };
};

// Form data processing utilities
export const processFormData = (formData) => {
  const processed = {};
  
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'string') {
      processed[key] = formData[key].trim();
    } else {
      processed[key] = formData[key];
    }
  });
  
  return processed;
};

// Report data validation
export const validateReportData = (data) => {
  const errors = [];
  
  if (!validateRequired(data.description)) {
    errors.push('Description is required');
  }
  
  if (!validateRequired(data.location)) {
    errors.push('Location is required');
  }
  
  if (data.contact_email && !validateEmail(data.contact_email)) {
    errors.push('Invalid email address');
  }
  
  if (data.contact_phone && !validatePhone(data.contact_phone)) {
    errors.push('Invalid phone number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Date/time utilities
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return formatDateTime(dateString);
};

// Location utilities
export const validateLocation = (location) => {
  return location && location.trim().length >= 5;
};

export const formatLocation = (location) => {
  return location.trim().replace(/\s+/g, ' ');
};

// Report status utilities
export const getStatusColor = (status) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    investigating: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };
  
  return statusColors[status] || statusColors.pending;
};

export const getUrgencyColor = (urgencyLevel) => {
  if (urgencyLevel >= 8) return 'bg-red-100 text-red-800';
  if (urgencyLevel >= 6) return 'bg-orange-100 text-orange-800';
  if (urgencyLevel >= 4) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

// Error handling utilities
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'Server error occurred',
      status: error.response.status,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'No response from server. Please check your connection.',
      status: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
    };
  }
};

// Local storage utilities
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
    return false;
  }
};
