// =========================================================================
// Dự án: SmartStore - Ứng dụng Thương mại Điện tử Tích hợp (MMA301 Assignment 2)
// Sinh viên thực hiện: Nguyễn Minh Quân - MSSV: CE180048
// Tệp: src/config/env.js - Quản lý cấu hình biến môi trường an toàn
// =========================================================================

// Hàm hỗ trợ lọc giá trị biến môi trường, tự động trả về giá trị mặc định nếu rỗng hoặc là chuỗi mẫu
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
  // Đường dẫn máy chủ API danh mục sản phẩm từ xa (Mặc định: DummyJSON)
  API_BASE_URL: cleanEnvValue(
    process.env.EXPO_PUBLIC_API_BASE_URL,
    'https://dummyjson.com'
  ),

  // Cấu hình Google Firebase Cloud Firestore
  FIREBASE: {
    apiKey: cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_API_KEY, ''),
    authDomain: cleanEnvValue(
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      'mma301-ecommerce-ce180048.firebaseapp.com'
    ),
    projectId: cleanEnvValue(
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      'mma301-ecommerce-ce180048'
    ),
    storageBucket: cleanEnvValue(
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      'mma301-ecommerce-ce180048.appspot.com'
    ),
    messagingSenderId: cleanEnvValue(
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      ''
    ),
    appId: cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_APP_ID, ''),
  },

  // Cấu hình Google Gemini AI shopping assistant
  GEMINI: {
    apiKey: cleanEnvValue(process.env.EXPO_PUBLIC_GEMINI_API_KEY, ''),
    model: cleanEnvValue(
      process.env.EXPO_PUBLIC_GEMINI_MODEL,
      'gemini-2.5-flash'
    ),
  },
};

// Kiểm tra xem cấu hình Firebase thực tế có sẵn sàng hay không
export const isFirebaseCloudConfigured = () => {
  return Boolean(
    ENV_CONFIG.FIREBASE.apiKey &&
      ENV_CONFIG.FIREBASE.apiKey.length > 10 &&
      ENV_CONFIG.FIREBASE.projectId &&
      ENV_CONFIG.FIREBASE.projectId !== 'demo-project'
  );
};

// Kiểm tra xem khóa API Google Gemini có hợp lệ hay không
export const isGeminiApiKeyConfigured = () => {
  return Boolean(
    ENV_CONFIG.GEMINI.apiKey &&
      ENV_CONFIG.GEMINI.apiKey.length > 10 &&
      !ENV_CONFIG.GEMINI.apiKey.includes('your_')
  );
};
