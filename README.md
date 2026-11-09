# SMARTSHOP – INTEGRATED E-COMMERCE MOBILE APPLICATION

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** 02 – Integrated E-Commerce Mobile App  
**Nền tảng:** React Native 0.86 • Expo SDK 57 • JavaScript  
**Sinh viên thực hiện:** Trần Minh Quân  
**Mã số sinh viên:** CE181730  
**Lớp / Học kỳ:** FA26 – MMA301  

---

## 1. Tổng quan Dự án (Project Overview & Business Workflow)

SmartShop là ứng dụng thương mại điện tử di động hoàn chỉnh, đáp ứng đầy đủ chuỗi giá trị và 8 tiêu chí năng lực đánh giá của học phần MMA301.

### Luồng nghiệp vụ cốt lõi (Core Business Flow):
1. **Khởi động (Startup):** Tự động khôi phục dữ liệu Giỏ hàng, Danh sách yêu thích và Cài đặt cá nhân từ `AsyncStorage` trước khi tải danh mục sản phẩm từ DummyJSON REST API.
2. **Khám phá & Tìm kiếm (Catalog / Search):** Hiển thị danh mục sản phẩm dạng lưới 2 cột qua `FlatList` với cơ chế phân trang vô tận (`skip` & `limit`), tìm kiếm từ khóa thời gian thực, lọc danh mục và kéo để làm mới (`pull-to-refresh`).
3. **Chi tiết & Giỏ hàng (Detail & Cart):** Xem thông tin chi tiết, hình ảnh, đánh giá và tồn kho. Thêm/sửa/xóa sản phẩm trong giỏ hàng. Tổng tiền và số lượng được tính toán tự động qua **Pure Derived Selectors** (không bị lệch state).
4. **Đồng bộ Đám mây (Firebase Cloud Integration):** Lưu trữ và đồng bộ hóa đơn hàng đã thanh toán cùng danh sách yêu thích lên **Firebase Firestore Cloud**, tích hợp cơ chế chịu lỗi ngoại tuyến (Offline Resilient Fallback).
5. **Trợ lý Thông minh (Gemini AI Shopping Advisor):** Tích hợp mô hình Google Gemini 1.5 Flash. Prompt được gắn trực tiếp với dữ liệu kho hàng thực tế (**Grounded in Catalog**). Ứng dụng tích hợp thuật toán **kiểm chứng chống ảo giác (Anti-Hallucination)** bắt buộc trước khi hiển thị sản phẩm đề xuất.
6. **Hệ thống Thông báo (Notification Workflow):** Quản lý quyền thông báo chặt chẽ (`granted`, `denied`, `undetermined`) và tự động bắn thông báo xác nhận khi đơn hàng được tạo thành công.

---

## 2. Hướng dẫn Cài đặt & Chạy Ứng dụng (Setup & Running)

### 2.1 Yêu cầu môi trường
- **Node.js:** v18.0 trở lên (khuyên dùng Node 20 hoặc Node 24)
- **NPM:** v9.0 trở lên
- **Expo Go App:** Cài đặt trên điện thoại Android/iOS (hoặc chạy qua trình giả lập Android Emulator)

### 2.2 Các bước khởi chạy
```bash
# 1. Di chuyển vào thư mục dự án
cd Assignment2

# 2. Cài đặt các gói phụ thuộc (nếu chưa cài)
npm install

# 3. Khởi chạy Expo Metro Bundler
npx expo start
```

### 2.3 Cấu hình biến môi trường (Environment Config)
Tạo file `.env` từ file mẫu `.env.example` (Lưu ý: Không commit file `.env` chứa key thật lên Git):
```ini
# Gemini AI API Key (Tùy chọn: có thể nhập trực tiếp trong màn hình Cài đặt của app)
EXPO_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Firebase Project Credentials
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id

# Product Catalog API (Mặc định: DummyJSON)
EXPO_PUBLIC_PRODUCT_API_BASE_URL=https://dummyjson.com
```

> **Ghi chú tiện ích cho buổi chấm:** Nếu không có API Key, ứng dụng đã tích hợp sẵn **Smart Local Fallback Engine** cho cả Gemini và Firebase. Giảng viên có thể chạy thử nghiệm toàn bộ luồng mà ứng dụng không bao giờ bị gián đoạn hay crash!

---

## 3. Kiến trúc State & Dữ liệu (State & Data Architecture)

Dự án áp dụng mô hình **Phân tách trách nhiệm (Separation of Concerns)** theo 4 tầng rõ rệt:

```
┌─────────────────────────────────────────────────────────────┐
│                       Screen UI Layer                       │
│ (ProductList, ProductDetail, Cart, Checkout, AIScreen...)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Dispatches actions / Consumes state
┌──────────────────────────────▼──────────────────────────────┐
│                    Context & Hooks Layer                    │
│   • ProductContext: catalog, search, pagination guards      │
│   • CartContext: items, memoized derived totals             │
│   • WishlistContext: favorites toggle & cloud sync          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Normalizes & calls I/O
┌──────────────────────────────▼──────────────────────────────┐
│                    Service & API Layer                      │
│   • productApi.js: DummyJSON REST API (skip/limit)          │
│   • firebaseService.js: Firestore sync & offline fallback   │
│   • geminiService.js: Grounded prompt & ID validation       │
│   • notificationService.js: Permission & business triggers  │
│   • storageService.js: AsyncStorage centralized wrapper     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Read / Write
┌──────────────────────────────▼──────────────────────────────┐
│                  Storage & Cloud Backends                   │
│ (DummyJSON REST, Firebase Cloud, Google Gemini, AsyncStorage)│
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Bằng chứng Tích hợp Tính năng Nâng cao

### 4.1 Firebase Cloud Integration
- **Nghiệp vụ thực tế:** Khi khách hàng điền form thông tin nhận hàng và bấm "Đặt hàng ngay", đơn hàng được đóng gói thành tài liệu Firestore `orders/{orderId}` chứa: `customerName`, `customerPhone`, `customerAddress`, `totalAmount`, `items`, `createdAt`.
- **Chịu lỗi ngoại tuyến:** Nếu mất kết nối mạng hoặc quy tắc bảo mật từ chối, đơn hàng tự động lưu vào bộ nhớ nội bộ `storageService`, người dùng nhận thông báo trạng thái mà không gặp crash.

### 4.2 Gemini AI Integration & Anti-Hallucination
- **Grounded Catalog Prompting:** Đưa danh sách 25 sản phẩm thực tế trong kho vào bối cảnh của prompt.
- **Thuật toán kiểm chứng:** Hàm `validateAndMatchOutput` phân tích kết quả trả về từ Gemini, kiểm tra từng `recommendedProductIds` xem có tồn tại trong mảng kho hàng không. Nếu AI tự ý bịa ra ID không có thật (ảo giác), hệ thống tự động loại bỏ ID đó và hiển thị thông báo cảnh báo minh bạch cho người dùng.

### 4.3 Notification Workflow
- **Xử lý quyền (Permission Handling):** Cung cấp giao diện trong màn hình Cài đặt để kiểm tra, cấp quyền, hoặc mô phỏng từ chối quyền (`denied`).
- **Sự kiện kinh doanh (Business Event):** Tự động bắn thông báo xác nhận kèm mã đơn hàng và tổng tiền ngay khi hoàn tất đặt hàng.

---

## 5. Hướng dẫn Đóng gói Release Build (Android APK)

Cấu hình đóng gói được định nghĩa đầy đủ trong `app.json`:
- **Package Name:** `com.minhquan.ecommerceapp`
- **Version:** `1.0.0`
- **Permissions:** `android.permission.INTERNET`, `android.permission.ACCESS_NETWORK_STATE`, `android.permission.POST_NOTIFICATIONS`

### Lệnh tạo file APK độc lập bằng EAS Build:
```bash
# 1. Cài đặt EAS CLI (nếu chưa có)
npm install -g eas-cli

# 2. Đăng nhập tài khoản Expo
eas login

# 3. Cấu hình build APK
eas build:configure

# 4. Chạy lệnh build file APK cho Android (Preview Profile)
eas build -p android --profile preview
```

---

## 6. Hồ sơ Tài liệu Kèm theo Dự án

1. **[RTM.md](file:///d:/FA26-MMA-PE/Assignment2_MMA/Assignment2/RTM.md):** Ma trận truy vết yêu cầu (Requirement Traceability Matrix từ R01 đến R12).
2. **[DESIGN_DECISIONS.md](file:///d:/FA26-MMA-PE/Assignment2_MMA/Assignment2/DESIGN_DECISIONS.md):** 7 Quyết định kỹ thuật trọng tâm và phân tích tác động (DDR).
3. **[TEST_MATRIX.md](file:///d:/FA26-MMA-PE/Assignment2_MMA/Assignment2/TEST_MATRIX.md):** Ma trận kiểm thử chi tiết 15 Test Cases (Normal, Negative, Edge cases) có kết quả thực tế.
4. **[DEBUG_LOGS.md](file:///d:/FA26-MMA-PE/Assignment2_MMA/Assignment2/DEBUG_LOGS.md):** Phân tích nguyên nhân gốc rễ và bản vá cho 2 bug thực tế (Lặp API cuộn trang & Lệch tính toán tiền giỏ hàng).
5. **[TRANSFER_TASKS.md](file:///d:/FA26-MMA-PE/Assignment2_MMA/Assignment2/TRANSFER_TASKS.md):** Bảng phân tích tác động và mã nguồn mẫu cho các câu hỏi chuyển giao yêu cầu.
6. **[AI_USAGE_LOG.md](file:///d:/FA26-MMA-PE/Assignment2_MMA/Assignment2/AI_USAGE_LOG.md):** Nhật ký sử dụng AI minh bạch và bản cam kết trung thực học thuật.
7. **[INTERVIEW_PREP.md](file:///d:/FA26-MMA-PE/Assignment2_MMA/Assignment2/INTERVIEW_PREP.md):** Cẩm nang trả lời chi tiết toàn bộ các câu hỏi vấn đáp của đề bài.

---

## 7. Giới hạn & Phát triển Tương lai (Limitations)
- Sử dụng mô phỏng cổng thanh toán (COD / Chuyển khoản VietQR) thay vì tích hợp cổng thanh toán thực tế có thu phí (đúng theo giới hạn đề bài Mục 1.4).
- Ứng dụng tối ưu hóa giao diện cho điện thoại di động ở cả hai hệ điều hành Android và iOS.

