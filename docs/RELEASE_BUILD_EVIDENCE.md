# Hồ Sơ Cấu Hình & Bằng Chứng Chuẩn Bị Phát Hành Android Release (R11 - Milestone M8)

- **Sinh viên thực hiện:** Trần Minh Quân (`CE181730`)
- **Email:** `minhquan15062004@gmail.com`
- **Học phần:** MMA301 – Assignment 2 (Integrated E-Commerce Mobile App)

---

## 1. Checklist Sẵn Sàng Phát Hành (Release Readiness Checklist - R11 / Case 15)

| Hạng mục kiểm tra | Giá trị cấu hình trong dự án | File cấu hình | Trạng thái |
| :--- | :--- | :--- | :---: |
| **Tên hiển thị ứng dụng (`expo.name`)** | `"SmartShop MMA301 - CE181730"` | [`app.json`](../app.json) | Đạt |
| **Slug dự án (`expo.slug`)** | `"assignment2-ce181730"` | [`app.json`](../app.json) | Đạt |
| **Phiên bản ứng dụng (`version` / `versionCode`)** | `version: "1.0.0"`, `android.versionCode: 1` | [`app.json`](../app.json) | Đạt |
| **Định danh gói Android (`android.package`)** | `"com.ce181730.assignment2"` | [`app.json`](../app.json) | Đạt |
| **Icon, Adaptive Icon & Splash Screen** | Cấu hình đầy đủ trong thư mục `./assets/` | [`app.json`](../app.json) | Đạt |
| **Cấu hình EAS Build xuất file APK** | Profile `preview` & `production` đặt `"buildType": "apk"` | [`eas.json`](../eas.json) | Đạt |
| **Bảo mật khóa & Biến môi trường (Mục 9.1)** | `.env`, `*.keystore`, `*.jks`, `google-services.json` đã nằm trong `.gitignore`; có `.env.example` mẫu | [`.gitignore`](../.gitignore), [`.env.example`](../.env.example) | Đạt |

---

## 2. Chi Tiết Cấu Hình Đóng Gói (`app.json` & `eas.json`)

### 2.1. Cấu hình định danh Android trong `app.json`
```json
{
  "expo": {
    "name": "SmartShop MMA301 - CE181730",
    "slug": "assignment2-ce181730",
    "version": "1.0.0",
    "android": {
      "package": "com.ce181730.assignment2",
      "versionCode": 1,
      "permissions": [
        "INTERNET",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ]
    }
  }
}
```

### 2.2. Cấu hình hồ sơ xuất bản APK trong `eas.json`
```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## 3. Quy Trình Đóng Gói Android Release APK (Theo Bài Học Slot 16)

### Phương án 1: Đóng gói APK qua dịch vụ đám mây Expo Application Services (EAS Build)
```bash
# 1. Cài đặt EAS CLI (nếu chưa cài)
npm install -g eas-cli

# 2. Đăng nhập tài khoản Expo
eas login

# 3. Thực hiện đóng gói file cài đặt .apk với profile preview
eas build --platform android --profile preview
```
- **Kết quả đầu ra:** EAS Cloud tự động quản lý Android Keystore ký số và trả về đường dẫn tải file `.apk` để cài đặt trực tiếp lên điện thoại Android thật.

### Phương án 2: Đóng gói APK Release cục bộ bằng Android Gradle (`assembleRelease`)
```bash
# 1. Sinh thư mục native android/ từ cấu hình app.json
npx expo prebuild --platform android

# 2. Tạo file upload keystore cục bộ (Tuyệt đối không commit file .keystore lên Git!)
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 3. Chạy Gradle tạo bản Release APK
cd android
./gradlew assembleRelease
```
- **Vị trí file APK đầu ra:** `android/app/build/outputs/apk/release/app-release.apk`.

---

## 4. Trả Lời Câu Hỏi Vấn Đáp Về Cấu Hình & Phát Hành (Mục 12.4)

1. **Tại sao không được commit API key hoặc file cấu hình nhạy cảm lên Git?**
   - Vì nếu đẩy API key thật (như `EXPO_PUBLIC_GEMINI_API_KEY`, `firebaseConfig` quản trị) hoặc file `*.keystore` lên kho Git, người khác có thể trích xuất khóa để gọi API trái phép làm hết hạn mức (quota)/phát sinh chi phí, hoặc giả mạo chữ ký ứng dụng khi phát hành. Do đó phải đưa `.env` và `*.keystore` vào `.gitignore` và chỉ chia sẻ `.env.example`.
2. **Sự khác nhau giữa bản chạy trong Expo Go (Development) và bản Android Release (APK/AAB) là gì?**
   - **Bản chạy trong Expo Go:** Mã nguồn JavaScript được Metro Bundler biên dịch tức thời (JIT) qua mạng LAN, bật sẵn công cụ gỡ lỗi (`__DEV__ = true`), kích thước lớn và phụ thuộc vào ứng dụng khung Expo Go.
   - **Bản Android Release:** Toàn bộ mã JavaScript và tài nguyên ảnh được đóng gói tĩnh (Hermes bytecode bundle), rút gọn dung lượng (minify), tắt chế độ debug, được gắn định danh độc lập (`com.ce181730.assignment2`) và ký số bằng Keystore để cài đặt độc lập như một ứng dụng thương mại hoàn chỉnh.
3. **Trước khi tạo bản release, em cần kiểm tra những cấu hình nào?**
   - Kiểm tra `name`, `slug`, `version`, `android.package`, `android.versionCode`, đường dẫn `icon`/`splash` trong `app.json`; kiểm tra `buildType` trong `eas.json`; kiểm tra các biến môi trường trong `.env` và đảm bảo ứng dụng có cơ chế fallback an toàn nếu dịch vụ mạng gặp sự cố.

