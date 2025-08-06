// API Service Layer for RescueRadar
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service methods
export const apiService = {
  // Submit complete report
  async submitReport(reportData) {
    try {
      const response = await api.post('/api/save-report', reportData);
      return response.data;
    } catch (error) {
      console.error('Submit Report Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit report');
    }
  },

  // Upload image
  async uploadImage(formData) {
    try {
      const response = await api.post('/api/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload Image Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
  },

  // Get AI analysis
  async getAIAnalysis(description, location, imageUrl = null) {
    try {
      const response = await api.post('/api/ai-analysis', {
        description,
        location,
        image_url: imageUrl,
      });
      return response.data;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to analyze report');
    }
  },

  // Generate QR code
  async generateQR(reportId) {
    try {
      const response = await api.get(`/api/generate-qr?report_id=${reportId}`);
      return response.data;
    } catch (error) {
      console.error('QR Generation Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate QR code');
    }
  },

  // Send email notification
  async sendEmailNotification(emailData) {
    try {
      const response = await api.post('/api/email-notify', emailData);
      return response.data;
    } catch (error) {
      console.error('Email Notification Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send email');
    }
  },

  // Send WhatsApp notification
  async sendWhatsAppNotification(whatsappData) {
    try {
      const response = await api.post('/api/whatsapp-notify', whatsappData);
      return response.data;
    } catch (error) {
      console.error('WhatsApp Notification Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send WhatsApp message');
    }
  },

  // Get report details (if you add a get endpoint later)
  async getReport(reportId) {
    try {
      const response = await api.get(`/api/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Get Report Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve report');
    }
  },

  // Get all active reports for the map
  async getActiveReports() {
    try {
      const response = await api.get('/api/reports/active');
      return response.data;
    } catch (error) {
      console.error('Get Active Reports Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve active reports');
    }
  },

  // Save report with notifications
  async saveReport(reportData) {
    try {
      const response = await api.post('/api/save-report', reportData);
      return response.data;
    } catch (error) {
      console.error('Save Report Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to save report');
    }
  },

  // Upload multiple files
  async uploadMultipleImages(files) {
    try {
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('image', file);
        return this.uploadImage(formData);
      });
      
      const results = await Promise.allSettled(uploadPromises);
      return results.map((result, index) => ({
        file: files[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
      }));
    } catch (error) {
      console.error('Multiple Upload Error:', error);
      throw new Error('Failed to upload multiple images');
    }
  },

  // Download QR code
  async downloadQR(reportId, format = 'png', size = 200) {
    try {
      const response = await api.get(`/api/generate-qr?report_id=${reportId}&format=${format}&size=${size}&download=true`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qr-code-${reportId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'QR code downloaded' };
    } catch (error) {
      console.error('QR Download Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to download QR code');
    }
  },
};

export default apiService;
