// src/utils/envValidation.js

/**
 * Validates that required environment variables are present
 * @param {Object} requiredVars - Object with variable names as keys and descriptions as values
 * @throws {Error} If any required variables are missing
 */
export const validateEnvironmentVariables = (requiredVars = {}) => {
  const missing = [];
  
  // Default required variables
  const defaultRequired = {
    VITE_API_BASE_URL: 'Base URL for the JSON Express API',
    VITE_FASTAPI_URL: 'Base URL for the FastAPI server',
    VITE_ENVIRONMENT: 'Application environment (development/production)'
  };
  
  const allRequired = { ...defaultRequired, ...requiredVars };
  
  // Check each required variable
  Object.entries(allRequired).forEach(([varName, description]) => {
    const value = import.meta.env[varName];
    
    if (!value || value.trim() === '') {
      missing.push({ varName, description });
    }
  });
  
  // Throw error if any variables are missing
  if (missing.length > 0) {
    const errorMessage = [
      'Missing required environment variables:',
      ...missing.map(({ varName, description }) => 
        `  - ${varName}: ${description}`
      ),
      '',
      'Please check your .env.development or .env.production file.',
      'You can use .env.example as a template.'
    ].join('\n');
    
    throw new Error(errorMessage);
  }
};

/**
 * Validates environment configuration and logs warnings for development
 */
export const initializeEnvironment = () => {
  try {
    validateEnvironmentVariables();
    
    // Log environment info in development
    if (import.meta.env.DEV) {
      console.log('🌍 Environment Configuration:');
      console.log(`  Environment: ${import.meta.env.VITE_ENVIRONMENT}`);
      console.log(`  API Base: ${import.meta.env.VITE_API_BASE_URL}`);
      console.log(`  FastAPI: ${import.meta.env.VITE_FASTAPI_URL}`);
      console.log(`  App Name: ${import.meta.env.VITE_APP_NAME || 'Not set'}`);
    }
    
    // Validate URLs in production
    if (import.meta.env.PROD) {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const fastApiUrl = import.meta.env.VITE_FASTAPI_URL;
      
      if (!apiUrl.startsWith('https://')) {
        console.warn('⚠️  Warning: API Base URL should use HTTPS in production');
      }
      
      if (!fastApiUrl.startsWith('https://')) {
        console.warn('⚠️  Warning: FastAPI URL should use HTTPS in production');
      }
      
      if (apiUrl.includes('localhost') || fastApiUrl.includes('localhost')) {
        console.warn('⚠️  Warning: Using localhost URLs in production');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    
    // In production, we might want to show a user-friendly error page
    if (import.meta.env.PROD) {
      throw new Error('Application configuration error. Please contact support.');
    }
    
    throw error;
  }
};

export default {
  validateEnvironmentVariables,
  initializeEnvironment
};