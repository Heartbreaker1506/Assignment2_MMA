# MMA301 - Assignment 2: Integrated E-Commerce Mobile App (SmartStore)

- **Sinh viên thực hiện:** Nguyễn Minh Quân
- **Mã số sinh viên (MSSV):** `CE180048`
- **Email:** `QuanNMCE180048@fpt.edu.vn`
- **Học phần:** MMA301 – Lập trình Di động Đa nền tảng (React Native & Expo)
- **Trường:** Đại học FPT (FPT University)

---

## 1. Mô tả nghiệp vụ ứng dụng

**SmartStore MMA301** là ứng dụng thương mại điện tử tích hợp (Integrated E-Commerce Mobile App) được xây dựng bằng **React Native + Expo (JavaScript)** theo đúng chuẩn kiến trúc phân tách trách nhiệm (**Separation of Concerns**). Ứng dụng giải quyết trọn vẹn hành trình mua sắm thiết bị công nghệ của người dùng trên di động thông qua **6 màn hình chức năng**:

1. **ProductListScreen (`Danh mục Sản phẩm`):** Tải dữ liệu sản phẩm từ Remote API (`DummyJSON`), hỗ trợ tìm kiếm theo từ khóa, lọc theo danh mục (`smartphones`, `laptops`, `tablets`, `mobile-accessories`, `mens-watches`), phân trang vô hạn (`limit` + `skip`) kèm khóa chống gọi trùng request (`isFetchingMoreRef`), kéo để làm mới (`Pull-to-refresh`), và xử lý đầy đủ trạng thái `Loading / Empty / Error + Retry / Offline Fallback`.
2. **ProductDetailScreen (`Chi tiết Sản phẩm`):** Hiển thị thông tin chi tiết sản phẩm, tồn kho, đánh giá, chọn số lượng kèm ghi chú để thêm vào giỏ hàng, lưu/bỏ lưu vào danh sách Yêu thích đồng bộ Firebase, và lối tắt nhờ Gemini AI đánh giá sản phẩm.
3. **CartScreen (`Giỏ hàng & Thanh toán`):** Quản lý mặt hàng trong giỏ (tăng/giảm số lượng, xóa tự động khi giảm về 0, ghi chú từng món), tính toán **Derived Cart Totals** (`totalItems`, `subtotal`, `discountAmount`, `shippingFee`, `finalTotal`) qua `useMemo`, tự động lưu bền vững xuống `AsyncStorage`, và đặt hàng đồng bộ lên Firebase kèm phát thông báo xác nhận.
4. **SavedOrdersScreen (`Firebase Wishlist & Đơn hàng`):** Quản lý 2 nghiệp vụ gắn với **Firebase Firestore** gồm danh sách Sản phẩm Yêu thích (`Wishlist`) và Lịch sử Đơn hàng đã đặt (`Order History`), có nút đồng bộ thủ công và xử lý lỗi khi mất kết nối đám mây.
5. **AiAssistantScreen (`Trợ lý Mua sắm Gemini AI`):** Nhận ngữ cảnh sản phẩm thật từ Catalog, giỏ hàng hiện tại và ngân sách của người dùng để tư vấn chọn mua hoặc so sánh sản phẩm. Đặc biệt tích hợp bộ lọc **`validateAiOutputAgainstCatalog()`** giúp kiểm tra chéo ID/tên sản phẩm với dữ liệu thật, loại bỏ hoàn toàn các sản phẩm do AI tự bịa (**Hallucination**).
6. **NotificationSettingsScreen (`Thông báo, Giao diện & Mô phỏng Kiểm thử`):** Quản lý quyền thông báo (`Granted` / `Denied`), phát thông báo theo sự kiện nghiệp vụ (`ORDER_PLACED`, `WISHLIST_UPDATED`, `TEST_EVENT`), đổi giao diện Sáng/Tối (`Dark Mode`), và tích hợp **Bảng Mô phỏng Kiểm thử (Test Matrix Simulator)** giúp tái hiện nhanh các tình huống lỗi mạng API, lỗi Firebase, từ chối quyền Notification, hoặc AI trả về dữ liệu ảo giác ngay tại buổi bảo vệ.

---

## 2. Hướng dẫn cài đặt và chạy dự án

### Yêu cầu môi trường
- **Node.js:** Phiên bản LTS (`>= 18.x` hoặc `>= 20.x`)
- **Thiết bị chạy thử:** Ứng dụng **Expo Go** trên điện thoại Android/iOS, máy ảo **Android Emulator**, hoặc trình duyệt Web.

### Các bước cài đặt
```bash
# Bước 1: Di chuyển vào thư mục dự án
cd assignment2_ce180048

# Bước 2: Cài đặt các gói thư viện phụ thuộc
npm install

# Bước 3: Tạo file biến môi trường .env từ file mẫu .env.example
cp .env.example .env

# Bước 4: Khởi chạy Expo Development Server
npx expo start
```

> **Lưu ý về Bảo mật (Mục 9.1):** File `.env` chứa khóa cá nhân đã được đưa vào `.gitignore` để tuyệt đối không commit secret lên Git. Ngay cả khi người chấm chưa điền API Key của Firebase hoặc Gemini vào `.env`, ứng dụng vẫn tự động kích hoạt **Safe Local Sync Adapter** và **Catalog Context Fallback Engine** để đảm bảo 100% tính năng chạy ổn định khi demo.

---

## 3. Kiến trúc thư mục và Quản lý State

```text
assignment2_ce180048/
├── App.js                                  # Cấu hình Providers & Stack Navigator (6 màn hình)
├── index.js                                # Điểm khởi chạy ứng dụng Expo
├── app.json                                # Cấu hình ứng dụng & package Android (com.ce180048.assignment2)
├── eas.json                                # Cấu hình hồ sơ đóng gói Android Release APK (R11)
├── .env.example                            # Mẫu cấu hình biến môi trường (không chứa secret)
├── src/
│   ├── config/
│   │   └── env.js                          # Đọc và chuẩn hóa biến môi trường EXPO_PUBLIC_*
│   ├── constants/
│   │   └── theme.js                        # Bảng màu Light/Dark, quy tắc phí ship/giảm giá & Fallback Catalog
│   ├── utils/
│   │   └── storage.js                      # Wrapper đọc/ghi AsyncStorage an toàn (try/catch + fallback)
│   ├── services/
│   │   ├── productService.js               # Gọi API sản phẩm, phân trang (limit/skip), chuẩn hóa dữ liệu
│   │   ├── firebaseService.js              # Đồng bộ Wishlist & Lịch sử Đơn hàng với Firebase + Local Cache
│   │   ├── notificationService.js          # Xin quyền & phát thông báo theo sự kiện nghiệp vụ (R09)
│   │   └── aiService.js                    # Gọi Gemini AI, xây dựng ngữ cảnh & validate output (R10)
│   ├── context/
│   │   ├── ThemeContext.js                 # Quản lý trạng thái giao diện Sáng / Tối
│   │   ├── CartContext.js                  # Quản lý Giỏ hàng, lưu AsyncStorage & tính Derived Totals
│   │   └── ShopContext.js                  # Quản lý Wishlist, Orders, Notification & Cờ mô phỏng Test Matrix
│   ├── components/
│   │   ├── CustomButton.js                 # Nút bấm tái sử dụng hỗ trợ trạng thái loading
│   │   ├── StateFeedback.js                # Khối hiển thị Loading / Empty / Error + nút Retry
│   │   ├── ProductCard.js                  # Thẻ hiển thị sản phẩm trên FlatList
│   │   ├── CartItemCard.js                 # Thẻ mặt hàng trong giỏ kèm nút +/-/xóa và ghi chú
│   │   └── NotificationBanner.js           # Thanh thông báo nổi hiển thị tức thì khi phát sự kiện R09
│   └── screens/
│       ├── ProductCatalogScreen.js         # Màn hình 1: Danh mục sản phẩm, tìm kiếm, lọc & phân trang
│       ├── ProductInfoScreen.js            # Màn hình 2: Chi tiết thông tin sản phẩm & Thêm vào giỏ
│       ├── ShoppingCartScreen.js           # Màn hình 3: Giỏ hàng, tính tiền & Đặt hàng
│       ├── CloudHistoryScreen.js           # Màn hình 4: Wishlist & Lịch sử đơn hàng (Firebase)
│       ├── GeminiAdvisorScreen.js          # Màn hình 5: Trợ lý mua sắm & So sánh sản phẩm Gemini AI
│       └── AppSettingsScreen.js            # Màn hình 6: Cài đặt Thông báo, Theme & Bảng mô phỏng Test
└── docs/
    ├── RTM_AND_DESIGN_DECISIONS.md         # Bảng RTM (R01-R12), Kiến trúc & 7 Quyết định Thiết kế (DDR)
    ├── TEST_MATRIX_AND_DEBUG_LOGS.md       # Bảng kiểm thử 15 Test Cases & 3 Nhật ký Gỡ lỗi (Debug Logs)
    ├── INTERVIEW_AND_TRANSFER_GUIDE.md     # Giải thích code 5 tầng, Diễn tập 30s & Hướng dẫn mở rộng (Transfer)
    ├── AI_USAGE_LOG.md                     # Nhật ký sử dụng AI có trách nhiệm & Cam kết sinh viên
    └── RELEASE_BUILD_EVIDENCE.md           # Hướng dẫn và bằng chứng cấu hình Android Release Build
```

---

## 4. Cách cấu hình Firebase, Notification và Gemini AI

1. **Remote Product API (`EXPO_PUBLIC_API_BASE_URL`):** Mặc định kết nối tới `https://dummyjson.com` để tải danh sách sản phẩm phân trang (`/products?limit=8&skip=0`), tìm kiếm (`/products/search?q=...`) và lọc theo danh mục (`/products/category/...`).
2. **Firebase (`src/services/firebaseService.js`):**
   - Điền `EXPO_PUBLIC_FIREBASE_API_KEY` và `EXPO_PUBLIC_FIREBASE_PROJECT_ID` trong file `.env`.
   - Service tự động đồng bộ hai bộ sưu tập `mma301_wishlists` và `mma301_orders` theo mã sinh viên `CE180048`, đồng thời lưu bản sao vào `AsyncStorage` để chống mất dữ liệu khi rớt mạng.
3. **Notification (`src/services/notificationService.js`):**
   - Sử dụng `expo-notifications` kết hợp thanh `NotificationBanner` và nhật ký sự kiện trong ứng dụng.
   - Kiểm tra chặt chẽ `permissionStatus` (`granted` / `denied`) trước khi phát thông báo cho các sự kiện: Đặt hàng thành công (`ORDER_PLACED`), Lưu sản phẩm yêu thích (`WISHLIST_UPDATED`), và Kiểm thử thông báo (`TEST_EVENT`).
4. **Gemini AI (`src/services/aiService.js`):**
   - Điền `EXPO_PUBLIC_GEMINI_API_KEY` vào `.env` để gọi trực tiếp model `gemini-2.5-flash`.
   - Trước khi hiển thị lên UI, toàn bộ kết quả trả về đều bắt buộc đi qua hàm `validateAiOutputAgainstCatalog(rawAiOutput, catalogProducts)` để đối chiếu `productId` với danh sách sản phẩm thật, loại bỏ các gợi ý không tồn tại.

---

## 5. Kiểm thử 15 Test Cases và Cách Demo nhanh trên lớp

Toàn bộ **15 Test Cases** bắt buộc trong Mục 5 của đề bài đã được thực hiện và ghi nhận đầy đủ tại file [`docs/TEST_MATRIX_AND_DEBUG_LOGS.md`](./docs/TEST_MATRIX_AND_DEBUG_LOGS.md).

Để thuận tiện cho việc kiểm tra trực tiếp trên lớp, ứng dụng cung cấp **Bảng Mô phỏng Lỗi & Edge Cases** tại màn hình **`⚙️ Cài đặt & Test` (`NotificationSettingsScreen`)**:
- Bật công tắc **Case 2 (R01):** Tái hiện lỗi mạng khi gọi API sản phẩm -> Kiểm tra màn hình Error, nút `Thử lại (Retry API)` và nút `Dùng dữ liệu Offline dự phòng`.
- Bật công tắc **Case 10 (R08):** Tái hiện lỗi đọc/ghi Firebase -> Kiểm tra thông báo lỗi khi Đặt hàng hoặc Lưu Wishlist mà không làm mất giỏ hàng.
- Bật/tắt nút **Case 11 & Case 12 (R09):** Chuyển đổi trạng thái quyền thông báo `DENIED` / `GRANTED` và bấm phát thông báo kiểm thử.
- Bật công tắc **Case 14 (R10):** Chèn sản phẩm ảo giác `ID #99999 - Quantum Hologram Phone Z99` vào phản hồi AI để chứng minh bộ lọc `validateAiOutputAgainstCatalog()` tự động phát hiện và chặn lại.

---

## 6. Chuẩn bị phát hành Android Release Build (R11)

Dự án đã được cấu hình đầy đủ định danh ứng dụng và hồ sơ đóng gói Android trong [`app.json`](./app.json) và [`eas.json`](./eas.json):
- **Tên ứng dụng:** `SmartStore MMA301 - CE180048`
- **Android Package ID:** `com.ce180048.assignment2`
- **Version:** `1.0.0` (`versionCode: 1`)
- **Lệnh đóng gói APK qua EAS:** `eas build -p android --profile preview`
- **Lệnh đóng gói APK cục bộ qua Gradle:** `npx expo prebuild --platform android && cd android && ./gradlew assembleRelease`

Chi tiết quy trình cấu hình ký số và kiểm tra bảo mật trước khi phát hành được trình bày tại [`docs/RELEASE_BUILD_EVIDENCE.md`](./docs/RELEASE_BUILD_EVIDENCE.md).

---

## 7. Hạn chế hiện tại và Hướng cải tiến

- **Hạn chế hiện tại:**
  - Chức năng thanh toán hiện dừng ở bước xác nhận đơn hàng và đồng bộ lên Firebase Firestore chứ chưa tích hợp cổng thanh toán trực tuyến thật (VNPay/MoMo/Stripe).
  - Dữ liệu đánh giá sao (`rating`) đang đọc từ catalog chung, chưa tách bảng bình luận chi tiết của từng tài khoản người dùng.
- **Hướng cải tiến tiếp theo:**
  - Tích hợp xác thực tài khoản nhiều người dùng với Firebase Authentication (Email/Password & Google Sign-In).
  - Bổ sung tính năng theo dõi trạng thái vận chuyển đơn hàng theo thời gian thực (Realtime Snapshot Listener).

---

## 8. Hồ sơ Tài liệu Kỹ thuật Chi tiết (`docs/`)

1. [**Bảng RTM, Phân tích Bài toán & 7 Quyết định Thiết kế (DDR)**](./docs/RTM_AND_DESIGN_DECISIONS.md)
2. [**Ma trận 15 Ca Kiểm thử (Test Matrix) & 3 Nhật ký Gỡ lỗi (Debug Logs)**](./docs/TEST_MATRIX_AND_DEBUG_LOGS.md)
3. [**Giải thích Code 5 Tầng, Diễn tập Vấn đáp 30s & Bài toán Mở rộng (Transfer Task)**](./docs/INTERVIEW_AND_TRANSFER_GUIDE.md)
4. [**Nhật ký Sử dụng AI có Trách nhiệm (AI Usage Log) & Cam kết Sinh viên**](./docs/AI_USAGE_LOG.md)
5. [**Hồ sơ Cấu hình & Bằng chứng Đóng gói Android Release (R11)**](./docs/RELEASE_BUILD_EVIDENCE.md)

