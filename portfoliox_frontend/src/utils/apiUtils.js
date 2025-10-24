// src/utils/apiUtils.js
import { getApiBaseUrl } from '../api/apiConfig';

// Utility function to make API calls with proper base URL
export const apiCall = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    }
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...defaultOptions, ...options });
};

// Utility function to get full URL for assets
export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
};

// Utility function to get profile picture URL
export const getProfilePicUrl = (profilePic) => {
  if (!profilePic) return '';
  if (profilePic.startsWith('http')) return profilePic;
  return getAssetUrl(profilePic);
};
