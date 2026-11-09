# DESIGN DECISION RECORD (DDR)

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** 02 – Integrated E-Commerce Mobile App  
**Sinh viên:** Trần Minh Quân (CE181730)  

---

## Bảng Quyết Định Kỹ Thuật (Tối thiểu 6 Quyết định theo Rubric)

| # | Quyết định Kỹ thuật | Lựa chọn giải pháp | Lý do lựa chọn (Rationale & Trade-offs) | Impact nếu đổi yêu cầu (Impact Analysis) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **State Management** | **React Context API kết hợp Custom Hooks (`useCart`, `useProducts`, `useWishlist`)** | • Đạt chuẩn kiến trúc học phần MMA301, không cồng kềnh như Redux Toolkit.<br>• Tách biệt state theo domain rõ ràng (Product / Cart / Wishlist).<br>• Dễ debug luồng dữ liệu một chiều, dễ giải thích trong vấn đáp. | Nếu ứng dụng mở rộng quy mô lớn có hàng chục tính năng tương tác chéo, việc chuyển sang Redux Toolkit/Zustand chỉ cần bọc lại Provider ở tầng Root (`App.js`), không làm thay đổi JSX của các Screen. |
| **2** | **API & Service Structure** | **Layered Architecture (Api Layer -> Service Layer -> Context Layer -> Screen UI)** | • Phân tách trách nhiệm (Separation of Concerns).<br>• Screen không bao giờ gọi trực tiếp `fetch()` hoặc SDK ngoại vi mà thông qua Service/Context.<br>• Cho phép chuẩn hóa dữ liệu (Data Normalization) và ép kiểu số an toàn trước khi vào UI. | Nếu chuyển từ DummyJSON sang REST backend của Giảng viên hoặc GraphQL, chỉ cần chỉnh sửa duy nhất file `src/api/productApi.js`, toàn bộ Context và Screen giữ nguyên 100%. |
| **3** | **Pagination Strategy** | **Offset-based Pagination (`limit` & `skip`) với Multi-level Guard** | • DummyJSON hỗ trợ chuẩn REST `limit` & `skip` (tổng 194 sản phẩm).<br>• Guard 3 tầng: `if (loading \|\| isFetchingMore \|\| !hasMore \|\| products.length >= total) return;`<br>• Khắc phục hoàn toàn lỗi lặp request vô tận khi người dùng cuộn nhanh. | Nếu đổi sang Cursor-based pagination (NextToken), chỉ cần thay `skip` bằng `cursor` trong `productApi.js` và cập nhật con trỏ trong `ProductContext.js`. |
| **4** | **Persistence Strategy** | **AsyncStorage tập trung qua `storageService.js` kết hợp Auto-Debounce** | • AsyncStorage đáp ứng tiêu chuẩn lưu trữ key-value đa nền tảng (Android/iOS/Web).<br>• Gom toàn bộ logic `getItem`, `setItem`, `JSON.parse` vào `storageService.js`, loại bỏ hoàn toàn việc rải mã chuỗi ở nhiều màn hình.<br>• Giỏ hàng tự động đồng bộ mỗi khi state thay đổi. | Nếu đổi sang SQLite (WatermelonDB / expo-sqlite), chỉ cần thay đổi việc đọc ghi trong `storageService.js`, các Context và Screen không bị ảnh hưởng. |
| **5** | **Firebase Use Case** | **Cloud Order Management & Wishlist Sync với Offline Resilient Fallback** | • Giải quyết bài toán nghiệp vụ thực tế: Khách đặt hàng cần lưu vết lên máy chủ đám mây.<br>• Hỗ trợ kiến trúc chịu lỗi (Fault-tolerant): Nếu mất mạng hoặc chưa cấu hình Firebase credentials, đơn hàng vẫn được lưu vào hàng đợi cục bộ an toàn, app không bao giờ crash. | Giảng viên có thể kiểm tra cả 2 trường hợp: online đồng bộ Firestore thời gian thực hoặc offline lưu trữ ngoại tuyến mà không gặp bất kỳ lỗi runtime nào. |
| **6** | **Gemini Context & Validation** | **In-catalog Grounded Prompting + Strict ID Verification Engine (Anti-Hallucination)** | • Tránh bẫy "Generic Chatbot" không liên quan sản phẩm.<br>• Đưa danh sách sản phẩm thực tế trong kho vào context của prompt.<br>• **Thuật toán kiểm chứng bắt buộc:** App phân tích mảng `recommendedProductIds` từ AI, chỉ hiển thị những ID thực sự tồn tại trong kho. Nếu AI bịa ID ảo, hệ thống tự động lọc bỏ và ghi cảnh báo. | Đảm bảo tính bảo mật và trải nghiệm thương mại điện tử: người dùng không bao giờ bấm vào một sản phẩm "ma" do AI sinh ra. |
| **7** | **Notification Flow** | **Permission-guarded Notification Service với In-App Floating Toast Fallback** | • Quản lý đầy đủ 3 trạng thái quyền: `granted`, `denied`, `undetermined`.<br>• Gắn liền với sự kiện kinh doanh (Business Event): Bắn thông báo khi hoàn tất đơn hàng và sự kiện Flash Sale.<br>• Nếu người dùng từ chối quyền, UI hiển thị banner hướng dẫn bật trong Cài đặt, không gây block luồng mua sắm. | Cho phép demo trơn tru trên cả máy ảo Android, thiết bị thật và trình duyệt Expo Go mà không sợ thiếu Native push credentials. |

---

## Sơ đồ Phân tách Trách nhiệm (Separation of Concerns)

```
[Screens / UI Components]
      │   ▲
      │   │ State & Dispatched Actions
      ▼   │
[Context / Custom Hooks Layer] (ProductContext, CartContext, WishlistContext)
      │   ▲
      │   │ Normalized Data / State Sync
      ▼   │
[Service & API Layer] (productApi, firebaseService, geminiService, notificationService)
      │   ▲
      │   │ Network / Storage I/O
      ▼   │
[External Providers & Persistence] (DummyJSON API, Firebase Cloud, AsyncStorage, Gemini API)
```
