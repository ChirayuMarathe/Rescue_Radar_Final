"use client";

import { useState, useEffect } from "react";
// Removed custom Button import
import {
  Upload,
  MapPin,
  Phone,
  Mail,
  Camera,
  Loader2,
  Navigation,
} from "lucide-react";
import { apiService } from "../../services/api";
import { supabase } from "../../utils/supabaseClient";
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateImageFile,
  processFormData,
} from "../../utils/helpers";

export function ReportForm() {
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    coordinates: null,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    image: null,
    urgencyLevel: "normal",
    animalType: "",
    situationType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Get user's current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setErrors({ ...errors, location: null });

    if (!navigator.geolocation) {
      setErrors({
        ...errors,
        location: "Geolocation is not supported by this browser",
      });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted_address;
            setFormData({
              ...formData,
              location: address,
              coordinates: { lat: latitude, lng: longitude },
            });
          } else {
            setFormData({
              ...formData,
              location: `${latitude}, ${longitude}`,
              coordinates: { lat: latitude, lng: longitude },
            });
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          setFormData({
            ...formData,
            location: `${latitude}, ${longitude}`,
            coordinates: { lat: latitude, lng: longitude },
          });
        }

        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
          default:
            errorMessage = "An unknown error occurred while getting location";
            break;
        }
        setErrors({ ...errors, location: errorMessage });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.description)) {
      newErrors.description = "Description is required";
    }

    if (!validateRequired(formData.location)) {
      newErrors.location = "Location is required";
    }

    if (formData.contactEmail && !validateEmail(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    if (formData.contactPhone && !validatePhone(formData.contactPhone)) {
      newErrors.contactPhone = "Please enter a valid phone number";
    }

    if (formData.image) {
      const imageValidation = validateImageFile(formData.image);
      if (!imageValidation.valid) {
        newErrors.image = imageValidation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Process form data
      const processedData = processFormData({
        description: formData.description,
        location: formData.location,
        contact_name: formData.contactName,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
      });

      // Upload image if provided
      let imageUrl = null;
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append("image", formData.image);
        const imageResponse = await apiService.uploadImage(imageFormData);
        if (imageResponse.success) {
          imageUrl = imageResponse.image_url;
        }
      }

      // Convert coordinates to (lng, lat) string for Postgres POINT type
      let coordinates = null;
      if (
        formData.coordinates &&
        formData.coordinates.lat &&
        formData.coordinates.lng
      ) {
        coordinates = `(${formData.coordinates.lng}, ${formData.coordinates.lat})`;
      }

      // Submit complete report to Supabase
      const { data, error } = await supabase
        .from("reports")
        .insert([
          {
            ...processedData,
            image_url: imageUrl,
            urgency_level: formData.urgencyLevel,
            animal_type: formData.animalType,
            situation_type: formData.situationType,
            coordinates,
            status: "active",
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        // Log the full error object for debugging
        console.error("Supabase insert error:", error);

        let errorMsg = "Failed to submit report";
        if (error.message) {
          errorMsg = error.message;
        } else if (error.details) {
          errorMsg = error.details;
        } else if (typeof error === "string" && error.trim() !== "") {
          errorMsg = error;
        } else if (Object.keys(error).length > 0) {
          errorMsg = JSON.stringify(error);
        }
        setErrors({
          submit: errorMsg,
        });
        setIsSubmitting(false);
        return;
      } else {
        setSubmitSuccess({
          reportId: data[0]?.id,
          workflow: null,
          qrCodeUrl: null,
        });
        // Reset form
        setFormData({
          description: "",
          location: "",
          coordinates: null,
          contactName: "",
          contactEmail: "",
          contactPhone: "",
          image: null,
          urgencyLevel: "normal",
          animalType: "",
          situationType: "",
        });
        setImagePreview(null);
        setErrors({});
        setAiAnalysis(null);
        // Clear file input
        const fileInput = document.getElementById("image-upload");
        if (fileInput) fileInput.value = "";
      }
    } catch (error) {
      console.error("Report submission error:", error);
      setErrors({
        submit: error.message || "Error submitting report. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetAIAnalysis = async () => {
    if (!formData.description || !formData.location) {
      setErrors({ ai: "Please fill in description and location first" });
      return;
    }

    try {
      setIsSubmitting(true);
      const analysis = await apiService.getAIAnalysis(
        formData.description,
        formData.location,
        null // image URL if available
      );

      if (analysis.success) {
        setAiAnalysis(analysis.analysis);
        setErrors({}); // Clear errors
      }
    } catch (error) {
      setErrors({ ai: "Failed to get AI analysis. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload with preview
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageValidation = validateImageFile(file);
      if (!imageValidation.valid) {
        setErrors({ ...errors, image: imageValidation.error });
        return;
      }

      setFormData({ ...formData, image: file });
      setErrors({ ...errors, image: null });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear image
  const clearImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
    setErrors({ ...errors, image: null });
    const fileInput = document.getElementById("image-upload");
    if (fileInput) fileInput.value = "";
  };
  return (
    <section className="max-w-4xl mx-auto py-6 lg:py-10 px-4 sm:px-6 lg:px-8 pt-20 lg:pt-10">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8 text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            🚨 Report Animal Emergency
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Fill out this form to report animal cruelty or emergency situations. All reports are processed immediately.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm sm:text-base font-medium text-gray-700">
              Description of Incident *
            </label>
            <textarea
              id="description"
              placeholder="Please describe what you witnessed in detail..."
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) {
                  setErrors({ ...errors, description: null });
                }
              }}
              required
              rows={4}
              className={`resize-none w-full border rounded-lg p-3 text-sm sm:text-base ${
                errors.description ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm sm:text-base font-medium text-gray-700">
              Location/Address *
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  id="location"
                  type="text"
                  placeholder="Enter the exact location or address"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData({ ...formData, location: e.target.value });
                    if (errors.location) {
                      setErrors({ ...errors, location: null });
                    }
                  }}
                  required
                  className={`pl-10 w-full border rounded-lg p-3 text-sm sm:text-base ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                />
              </div>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="px-3 sm:px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm whitespace-nowrap"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {isGettingLocation ? "Getting..." : "Current Location"}
              </button>
            </div>
            {errors.location && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.location}</p>
            )}
            {formData.coordinates && (
              <p className="text-xs sm:text-sm text-green-600">
                📍 Location detected: {formData.coordinates.lat.toFixed(6)},{" "}
                {formData.coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>

          {/* Form grid for better mobile layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-2">
              <label htmlFor="urgencyLevel" className="text-sm sm:text-base font-medium text-gray-700">
                Urgency Level
              </label>
              <select
                id="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={(e) =>
                  setFormData({ ...formData, urgencyLevel: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="low">🟢 Low - Can wait</option>
                <option value="normal">🟡 Normal - Within 24 hours</option>
                <option value="high">🟠 High - Urgent attention needed</option>
                <option value="emergency">🔴 Emergency - Immediate action required</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="animalType" className="text-sm sm:text-base font-medium text-gray-700">
                Animal Type
              </label>
              <select
                id="animalType"
                value={formData.animalType}
                onChange={(e) =>
                  setFormData({ ...formData, animalType: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select animal type</option>
                <option value="dog">🐕 Dog</option>
                <option value="cat">🐱 Cat</option>
                <option value="bird">🐦 Bird</option>
                <option value="horse">🐎 Horse</option>
                <option value="livestock">🐄 Livestock</option>
                <option value="wildlife">🦌 Wildlife</option>
                <option value="other">🐾 Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="situationType" className="text-sm sm:text-base font-medium text-gray-700">
              Situation Type
            </label>
            <select
              id="situationType"
              value={formData.situationType}
              onChange={(e) =>
                setFormData({ ...formData, situationType: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select situation</option>
              <option value="abuse">⚠️ Active Abuse</option>
              <option value="neglect">😢 Neglect</option>
              <option value="injury">🩹 Injury/Medical</option>
              <option value="abandonment">🏠 Abandonment</option>
              <option value="hoarding">📦 Hoarding</option>
              <option value="fighting">⚔️ Animal Fighting</option>
              <option value="other">❓ Other</option>
            </select>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <label htmlFor="image-upload" className="text-sm sm:text-base font-medium text-gray-700">
              📷 Upload Photo (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-32 sm:h-48 object-cover rounded-lg mx-auto"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 text-center">
                    Image ready for upload. Click the ✕ to remove.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-2" />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Click to upload or drag and drop a photo
                    </span>
                    <br />
                    <span className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
            {errors.image && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.image}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="border-t pt-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">
              📞 Contact Information (Optional)
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="contactName" className="text-sm sm:text-base font-medium text-gray-700">Your Name</label>
                <input
                  id="contactName"
                  type="text"
                  placeholder="Full name"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="contactPhone" className="text-sm sm:text-base font-medium text-gray-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="contactPhone"
                      type="text"
                      placeholder="(123) 456-7890"
                      value={formData.contactPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPhone: e.target.value,
                        })
                      }
                      className="pl-10 w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  {errors.contactPhone && (
                    <p className="text-red-500 text-xs sm:text-sm">{errors.contactPhone}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contactEmail" className="text-sm sm:text-base font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="contactEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.contactEmail}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          contactEmail: e.target.value,
                        });
                        if (errors.contactEmail) {
                          setErrors({ ...errors, contactEmail: null });
                        }
                      }}
                      className={`pl-10 w-full border rounded-lg p-3 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.contactEmail ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.contactEmail && (
                    <p className="text-red-500 text-xs sm:text-sm">{errors.contactEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-3">
              <h4 className="text-base sm:text-lg font-semibold text-blue-900">
                🤖 AI Analysis Preview
              </h4>
              <button
                type="button"
                onClick={handleGetAIAnalysis}
                disabled={
                  isSubmitting || !formData.description || !formData.location
                }
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                {isSubmitting ? "Analyzing..." : "Get AI Analysis"}
              </button>
            </div>

            {errors.ai && (
              <p className="text-red-500 text-xs sm:text-sm mb-3">{errors.ai}</p>
            )}

            {aiAnalysis && (
              <div className="bg-white p-3 sm:p-4 rounded-lg border">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Severity:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                        aiAnalysis.severity === "high"
                          ? "bg-red-100 text-red-800"
                          : aiAnalysis.severity === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {aiAnalysis.severity}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">
                      Recommended Action:
                    </span>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {aiAnalysis.recommended_action}
                    </p>
                  </div>
                  {aiAnalysis.summary && (
                    <div className="space-y-1">
                      <span className="font-medium text-gray-700 text-sm sm:text-base">
                        Summary:
                      </span>
                      <p className="text-gray-600 text-sm sm:text-base">{aiAnalysis.summary}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Emergency Notice */}
          <div className="bg-orange-50 p-4 sm:p-6 rounded-lg border-l-4 border-orange-400">
            <p className="text-xs sm:text-sm text-orange-800 leading-relaxed">
              <strong>🚨 Emergency:</strong> If this is an immediate emergency
              where an animal is in immediate danger, please call local
              authorities (911) first, then submit this report.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isSubmitting || !formData.description || !formData.location
            }
            className="w-full bg-orange-500 hover:bg-orange-600 text-base sm:text-lg py-4 sm:py-6 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting Report...
              </div>
            ) : (
              "🚨 Submit Report"
            )}
          </button>

          {/* Error and Success Messages */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
              <p className="text-red-700 font-medium text-sm sm:text-base">Error:</p>
              <p className="text-red-600 text-sm sm:text-base mt-1">{errors.submit}</p>
            </div>
          )}

          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
              <h4 className="text-green-800 font-bold mb-2 text-base sm:text-lg">
                ✅ Report Submitted Successfully!
              </h4>
              <div className="space-y-2 text-green-700 text-sm sm:text-base">
                <p>
                  <strong>Report ID:</strong> {submitSuccess.reportId}
                </p>
                {submitSuccess.workflow?.notifications_sent?.email && (
                  <p>✅ Email notification sent</p>
                )}
                {submitSuccess.workflow?.notifications_sent?.whatsapp && (
                  <p>✅ WhatsApp notification sent</p>
                )}
                {submitSuccess.qrCodeUrl && (
                  <div className="mt-3">
                    <p className="font-medium">QR Code for your report:</p>
                    <img
                      src={submitSuccess.qrCodeUrl}
                      alt="Report QR Code"
                      className="mt-2 border rounded-lg mx-auto sm:mx-0"
                      style={{ maxWidth: "150px" }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
