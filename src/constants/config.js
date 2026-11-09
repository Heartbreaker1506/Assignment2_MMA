export const CONFIG = {
  // Remote Product Catalog API (DummyJSON)
  API_BASE_URL: process.env.EXPO_PUBLIC_PRODUCT_API_BASE_URL || 'https://dummyjson.com',
  DEFAULT_PAGE_SIZE: 10,
  REQUEST_TIMEOUT_MS: 3500,

  // Firebase Configuration (supports environment variables or local fallback)
  FIREBASE: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'mma301-assignment2-ce181730',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || '',
  },

  // Gemini AI Configuration
  GEMINI: {
    API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
    MODEL: 'gemini-1.5-flash',
    ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  },

  // App Metadata
  APP: {
    NAME: 'SmartShop E-Commerce',
    VERSION: '1.0.0',
    STUDENT_NAME: 'Minh Quan',
    STUDENT_ID: 'CE181730',
    CLASS_CODE: 'MMA301',
  },
};

