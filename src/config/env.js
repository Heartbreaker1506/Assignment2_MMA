// Author: Trần Minh Quân - Student ID: CE181730

// Helper to clean environment variable strings and fallback if empty or placeholder
const cleanEnvValue = (value, defaultValue = '') => {
  if (!value || typeof value !== 'string') return defaultValue;
  const trimmed = value.trim();
  if (
    trimmed === '' ||
    trimmed === 'your_firebase_api_key_here' ||
    trimmed === 'your_gemini_api_key_here'
  ) {
    return defaultValue;
  }
  return trimmed;
};

export const ENV_CONFIG = {
  // Remote Product Catalog API
  API_BASE_URL: cleanEnvValue(
    process.env.EXPO_PUBLIC_API_BASE_URL,
    'https://dummyjson.com'
  ),

  // Firebase Configuration
  FIREBASE: {
    apiKey: cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_API_KEY, ''),
    authDomain: cleanEnvValue(
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      'mma301-ecommerce-ce181730.firebaseapp.com'
    ),
    projectId: cleanEnvValue(
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      'mma301-ecommerce-ce181730'
    ),
    storageBucket: cleanEnvValue(
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      'mma301-ecommerce-ce181730.appspot.com'
    ),
    messagingSenderId: cleanEnvValue(
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      ''
    ),
    appId: cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_APP_ID, ''),
  },

  // Gemini AI Configuration
  GEMINI: {
    apiKey: cleanEnvValue(process.env.EXPO_PUBLIC_GEMINI_API_KEY, ''),
    model: cleanEnvValue(
      process.env.EXPO_PUBLIC_GEMINI_MODEL,
      'gemini-2.5-flash'
    ),
  },
};

// Check if valid Firebase credentials are provided in .env
export const isFirebaseCloudConfigured = () => {
  return Boolean(
    ENV_CONFIG.FIREBASE.apiKey &&
      ENV_CONFIG.FIREBASE.apiKey.length > 10 &&
      ENV_CONFIG.FIREBASE.projectId
  );
};

// Check if a valid Gemini API key is provided in .env
export const isGeminiApiKeyConfigured = () => {
  return Boolean(
    ENV_CONFIG.GEMINI.apiKey && ENV_CONFIG.GEMINI.apiKey.length > 10
  );
};
