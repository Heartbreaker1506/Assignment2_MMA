# Nhật Ký Sử Dụng AI Có Trách Nhiệm (AI Usage Log) & Cam Kết Sinh Viên

- **Sinh viên thực hiện:** Nguyễn Minh Quân
- **Mã số sinh viên (MSSV):** `CE180048`
- **Email:** `QuanNMCE180048@fpt.edu.vn`
- **Học phần:** MMA301 – Assignment 2 (Integrated E-Commerce Mobile App)

---

## 1. Nguyên Tắc Sử Dụng AI & Bảo Mật Cấu Hình (Mục 9.1 - 9.3)

1. **Không commit thông tin bí mật (No Secrets in Repo):**
   - Toàn bộ biến môi trường (`EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_FIREBASE_*`, `EXPO_PUBLIC_GEMINI_API_KEY`) đều được đọc qua module trung gian [`src/config/env.js`](../src/config/env.js).
   - File `.env`, `google-services.json` và các file khóa ký số (`*.keystore`, `*.jks`, `*.key`) đã được khai báo chặn trong [`.gitignore`](../.gitignore).
   - Repo chỉ cung cấp file mẫu [`.env.example`](../.env.example) không chứa khóa thật.
2. **Kiểm chứng và Làm chủ Mã nguồn:**
   - AI chỉ được sử dụng như công cụ gợi ý cấu trúc, tra cứu cú pháp API và rà soát trường hợp biên.
   - Mọi đoạn code đưa vào dự án đều được em đọc hiểu từng dòng, kiểm thử thực tế qua 15 Test Cases và chỉnh sửa phù hợp với kiến trúc của bài tập.

---

## 2. Bảng Nhật Ký Sử Dụng AI - AI Usage Log (Mục 9.4)

| Bước / Milestone | Mục đích hỏi AI | Nội dung AI gợi ý | Phần em đã chỉnh sửa / tự kiểm chứng | Cách em xác nhận kết quả đúng |
| :--- | :--- | :--- | :--- | :--- |
| **M1 - Phân tích & Thiết kế Kiến trúc** | Tham khảo cách chia thư mục chuẩn Separation of Concerns cho ứng dụng E-Commerce 6 màn hình trong React Native + Expo. | Gợi ý tách `screens/`, `components/`, `context/`, `services/`, `utils/`, `config/`. | Em tự thiết kế sơ đồ `State Ownership Map` và quyết định tách 3 Context (`ThemeContext`, `CartContext`, `ShopContext`) để tránh re-render chéo và giữ code dễ đọc như ở Assignment 1. | Kiểm tra luồng import giữa các tầng không bị vòng lặp (circular dependency), chạy `npx expo start` lên màn hình mượt mà. |
| **M2 & M3 - Product API, Search, Filter & Pagination (`R01-R03`)** | Tra cứu cú pháp phân trang (`limit`, `skip`) và tìm kiếm (`/products/search?q=`) của `DummyJSON API` cũng như cách chống gọi lặp `onEndReached` trên `FlatList`. | Gợi ý dùng `onEndReachedThreshold` và biến state `isLoadingMore` để chặn. | Khi test thực tế em phát hiện chỉ dùng `useState` vẫn bị bắn đúp request khi vuốt nhanh (Debug Log #1), nên em tự bổ sung khóa đồng bộ `useRef` (`isFetchingMoreRef`) và lọc trùng `id` bằng `Set`. | Thực hiện Test Case 1, 2, 3, 4, 5: cuộn chạm đáy liên tục và kéo `Pull-to-refresh` không còn cảnh báo trùng key. |
| **M4 - Giỏ hàng, Derived Totals & AsyncStorage (`R05-R07`)** | Tham khảo công thức tính tổng giỏ hàng và cách xử lý lỗi `JSON.parse` khi đọc `AsyncStorage`. | Gợi ý dùng `Array.prototype.reduce` trong `useMemo` và bọc `AsyncStorage.getItem` trong `try/catch`. | Em bổ sung thêm điều kiện biên trong `updateQuantity`: khi giảm số lượng về `<= 0` thì tự động xóa mặt hàng khỏi giỏ, đồng thời sửa điều kiện `subtotal === 0` thì `shippingFee = 0` (Debug Log #2). | Thực hiện Test Case 6, 7, 8: giảm số lượng từ 1 về 0 tự xóa món hàng, đóng mở lại app giỏ hàng giữ nguyên 100%. |
| **M5 - Đồng bộ Firebase Wishlist & Orders (`R08`)** | Tham khảo cấu trúc lưu trữ tài liệu trên Firebase Firestore REST API kết hợp bộ nhớ đệm offline. | Gợi ý cấu trúc endpoint Firestore REST và cách đóng gói trường dữ liệu `fields`. | Em xây dựng `src/services/firebaseService.js` gắn mã sinh viên `CE180048` cho 2 nghiệp vụ `Wishlist` và `Orders`, đồng thời thêm cơ chế `Local Sync Adapter` và công tắc `simulateFirebaseError` để kiểm thử lỗi mạng. | Thực hiện Test Case 9 & Case 10: lưu sản phẩm yêu thích, đặt hàng thành công và bật mô phỏng lỗi Firebase để kiểm tra thông báo lỗi. |
| **M6 - Quyền & Luồng Thông báo Nghiệp vụ (`R09`)** | Tra cứu cách xin quyền và lập lịch thông báo cục bộ bằng `expo-notifications` theo bài học Slot 15. | Gợi ý dùng `requestPermissionsAsync()` và `scheduleNotificationAsync()`. | Em bổ sung bước kiểm tra `permissionStatus !== 'granted'` trước khi phát thông báo (để xử lý gọn gàng Case 11 khi bị từ chối quyền), kết hợp component `NotificationBanner` và bảng Nhật ký sự kiện trực quan trên UI. | Thực hiện Test Case 11 (Denied) và Case 12 (Granted): chuyển đổi giữa 2 trạng thái quyền và kiểm tra ứng dụng không bao giờ crash. |
| **M7 - Tích hợp Gemini AI & Kiểm증 Output (`R10`)** | Hỏi cách truyền danh sách sản phẩm vào prompt Gemini và ép trả về định dạng JSON để hiển thị thẻ sản phẩm. | Gợi ý dùng `responseMimeType: 'application/json'` trên Gemini REST API. | Em tự viết hàm hậu kiểm **`validateAiOutputAgainstCatalog()`** trong `src/services/aiService.js` dùng `Map` đối chiếu `productId`/`productTitle` với Catalog thật để chặn sản phẩm ảo giác (Debug Log #3), kèm công tắc mô phỏng Case 14 (`ID #99999`). | Thực hiện Test Case 13 & Case 14: bật mô phỏng sản phẩm giả `ID #99999`, xác nhận bộ lọc tự động chặn và báo cáo chính xác trên `AiAssistantScreen`. |
| **M8 - Cấu hình Android Release Build (`R11`)** | Kiểm tra lại các trường bắt buộc trong `app.json` và `eas.json` để xuất file APK trên Android. | Gợi ý cấu hình `android.package`, `versionCode` và profile `preview` với `buildType: "apk"`. | Em thiết lập package `com.ce180048.assignment2`, kiểm tra `.gitignore` để đảm bảo không lộ khóa bí mật và ghi lại tài liệu hướng dẫn đóng gói tại `docs/RELEASE_BUILD_EVIDENCE.md`. | Thực hiện Test Case 15: đối chiếu toàn bộ checklist Release Readiness trong đề bài. |

---

## 3. Cam Kết Cuối Cùng Của Sinh Viên (Mục 12.6)

Tôi tên là **Nguyễn Minh Quân** (MSSV: **`CE180048`**), sinh viên thực hiện bài tập **MMA301 – Assignment 2**. Tôi xin cam kết:

1. Tôi hiểu rõ mục tiêu bài toán, kiến trúc phân tách 5 tầng và toàn bộ luồng dữ liệu của ứng dụng **SmartShop MMA301** mà tôi nộp.
2. Tôi có thể tự chạy ứng dụng, tái hiện trực tiếp toàn bộ **15 Test Cases** (bao gồm cả các trường hợp lỗi và biên) và giải thích bất kỳ file, hàm hoặc state chính nào trong dự án.
3. Tôi đã kiểm tra cẩn thận các trường hợp lỗi mạng API, dữ liệu rỗng, phân trang chạm đáy, giảm số lượng giỏ hàng về 0, khôi phục `AsyncStorage`, lỗi đồng bộ Firebase, từ chối quyền Notification và chặn sản phẩm ảo giác từ Gemini AI.
4. Tôi không commit API key, private token hay thông tin bảo mật thật lên kho mã nguồn, và tôi đã ghi lại trung thực toàn bộ quá trình sử dụng AI trong tài liệu này.
5. Tôi sẵn sàng thực hiện yêu cầu chỉnh sửa/mở rộng chức năng (**Modification / Transfer Task**) trực tiếp tại buổi chấm để chứng minh năng lực làm chủ mã nguồn của mình.

