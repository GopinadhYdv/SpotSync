/**
 * Environment configuration utilities
 * Centralized access to environment variables for URLs and configuration
 * 
 * Usage:
 * - Client-side: Use NEXT_PUBLIC_* variables (exposed to browser)
 * - Server-side: Use all variables
 */

// Helper to get dynamic base URL
const getDynamicUrl = (value: string | undefined, fallbackPort: string): string => {
  if (typeof window !== 'undefined') {
    // On client: if no value or it's localhost, use current origin
    if (!value || value.includes('localhost') || value.includes('127.0.0.1')) {
      return window.location.origin;
    }
  }
  return value || `http://localhost:${fallbackPort}`;
};

// API Configuration
export const API_BASE_URL = getDynamicUrl(import.meta.env.NEXT_PUBLIC_API_URL, '4000');
export const APP_URL = getDynamicUrl(import.meta.env.NEXT_PUBLIC_APP_URL, '4000');

// Auth Configuration (server-side only)
export const getAuthUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: derive from window location
    return `${window.location.origin}/api/auth`;
  }
  // Server-side
  return process.env.AUTH_URL || `${APP_URL}/api/auth`;
};

// External Services URLs
export const RAZORPAY_KEY_ID = import.meta.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
export const GOOGLE_MAPS_API_KEY = import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
export const ABLY_API_KEY = import.meta.env.NEXT_PUBLIC_ABLY_API_KEY || '';

// Create.xyz Configuration
export const CREATE_BASE_URL = import.meta.env.NEXT_PUBLIC_CREATE_BASE_URL || 'https://www.create.xyz';
export const CREATE_ENV = import.meta.env.NEXT_PUBLIC_CREATE_ENV || 'DEVELOPMENT';

/**
 * Validates that required environment variables are set
 * Useful for debugging deployment issues
 */
export const validateEnvironment = (): string[] => {
  const missing: string[] = [];
  
  if (!API_BASE_URL) missing.push('NEXT_PUBLIC_API_URL');
  if (!APP_URL) missing.push('NEXT_PUBLIC_APP_URL');
  
  return missing;
};

/**
 * Gets a formatted environment summary for debugging
 */
export const getEnvironmentSummary = (): object => {
  return {
    API_BASE_URL,
    APP_URL,
    AUTH_URL: getAuthUrl(),
    NODE_ENV: import.meta.env.MODE,
    RAZORPAY_CONFIGURED: !!RAZORPAY_KEY_ID,
    GOOGLE_MAPS_CONFIGURED: !!GOOGLE_MAPS_API_KEY,
    ABLY_CONFIGURED: !!ABLY_API_KEY,
  };
};
