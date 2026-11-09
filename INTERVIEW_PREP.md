# INTERVIEW & CODE EXPLANATION PREPARATION GUIDE

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** 02 – Integrated E-Commerce Mobile App  
**Sinh viên:** Trần Minh Quân (CE181730)  
**Tiêu chí đánh giá:** Code Explanation (1.0đ) + Problem Understanding (1.0đ) + Solution Design (1.5đ)  

---

## 1. Rehearsal Checklist – "Mở File & Chỉ Code trong ≤ 30 Giây" (Mục 7.3)

| Mục tiêu Giảng viên yêu cầu mở | File cần mở ngay lập tức | Dòng code / Hàm cần chỉ vào |
| :--- | :--- | :--- |
| **1. Product service & fetch logic** | `src/api/productApi.js` | Hàm `fetchProducts({ limit, skip, search, category })` |
| **2. Pagination & onEndReached guard** | `src/context/ProductContext.js` | Dòng `if (loading \|\| isFetchingMore \|\| !hasMore \|\| products.length >= total) return;` trong `loadMoreProducts` |
| **3. Cart state & Derived totals** | `src/context/CartContext.js` | Selector `const totals = useMemo(() => { ... }, [cartItems]);` |
| **4. Firebase service & Cloud record** | `src/services/firebaseService.js` | Hàm `saveOrder(order)` và `payload = { fields: { ... } }` |
| **5. Notification permission & handler** | `src/services/notificationService.js` | Hàm `requestPermission()` và `notifyOrderPlaced(order)` |
| **6. AI service & Validation chống ảo giác** | `src/services/geminiService.js` | Hàm `validateAndMatchOutput(rawResponse, catalogProducts)` |
| **7. Config & Bảo mật Secret** | `src/constants/config.js`<br>`.env.example` | Đọc `process.env.EXPO_PUBLIC_...` và không hardcode secret |

---

## 2. Khung Giải Thích Code 5 Bước (Purpose - Input - Trigger - Transform - Output)

### Ví dụ giải thích luồng Catalog Data:
1. **Purpose:** Tải và hiển thị danh sách sản phẩm từ Remote API DummyJSON, hỗ trợ tìm kiếm, lọc danh mục và phân trang vô tận.
2. **Input:** `searchQuery` (chuỗi tìm kiếm), `selectedCategory` (danh mục), `skip` (vị trí offset), `limit` (số lượng 10).
3. **Trigger:** `useEffect` chạy khi mount hoặc khi người dùng đổi danh mục; sự kiện `onSubmitEditing` trên ô tìm kiếm; sự kiện `onEndReached` khi cuộn xuống đáy.
4. **Transform:** `productApi.fetchProducts()` gọi HTTP GET -> chuẩn hóa số `Number(price)` -> `ProductContext` lọc bỏ trùng lặp ID bằng `Set` -> cập nhật `products`.
5. **Output / Failure path:** State `products` cập nhật làm FlatList render lại. Nếu mất mạng, hệ thống bắt ngoại lệ trong `catch`, kích hoạt cờ fallback `MOCK_PRODUCTS` hoặc bật màn hình `ErrorView` với nút "Thử lại", app tuyệt đối không crash.

---

## 3. Trả Lời Toàn Bộ Bộ Câu Hỏi Vấn Đáp Của Đề Bài (Mục 12)

### 3.1 Nhóm Data / List / State (Mục 12.1)
- **Câu hỏi 1: `onEndReached` có thể gọi lặp khi nào?**  
  *Trả lời:* `onEndReached` bị lặp khi chiều cao nội dung danh sách nhỏ hơn chiều cao màn hình (chưa đủ sản phẩm lấp đầy), hoặc khi người dùng cuộn tới ngưỡng `onEndReachedThreshold` nhưng hàm xử lý trước đó chưa hoàn tất (đang async pending) mà không có cờ khóa `isFetchingMore`. Khắc phục bằng guard 4 điều kiện: kiểm tra `loading`, `isFetchingMore`, `!hasMore`, và `products.length >= total`.

- **Câu hỏi 2: Source data và Displayed data khác nhau thế nào?**  
  *Trả lời:* Source data là toàn bộ mảng dữ liệu gốc nhận về từ API/Database lưu trong state (`products`). Displayed data là dữ liệu đã qua các bước xử lý biến đổi của Client như sắp xếp theo giá (`sortBy`), lọc tạm thời, hoặc định dạng trước khi đổ vào `FlatList` (`displayedProducts = useMemo(...)`).

- **Câu hỏi 3: Cart total nên lưu hay derive? Vì sao?**  
  *Trả lời:* Cart total **bắt buộc phải là Derived State (Trạng thái phái sinh)** tính toán qua `useMemo` từ mảng `cartItems`. Không bao giờ được tạo `useState(total)` độc lập, vì sẽ sinh ra "2 nguồn chân lý" (Multiple Sources of Truth), dễ dẫn đến lỗi lệch pha (State Desynchronization) khi người dùng tăng giảm số lượng hoặc xóa sản phẩm.

---

### 3.2 Nhóm Firebase / Notification (Mục 12.2)
- **Câu hỏi 1: Firebase feature giải quyết business problem gì?**  
  *Trả lời:* Giải quyết bài toán đồng bộ dữ liệu giao dịch thực tế: Khi khách hàng hoàn tất đặt hàng (Checkout), thông tin đơn hàng cùng danh sách sản phẩm, địa chỉ giao hàng và tổng tiền được lưu trữ thời gian thực lên Firebase Firestore Cloud. Người dùng có thể xem lại lịch sử đơn hàng trên mọi thiết bị mà không phụ thuộc vào bộ nhớ cục bộ.

- **Câu hỏi 2: Nếu permission notification bị deny thì workflow thay đổi ra sao?**  
  *Trả lời:* Nếu người dùng từ chối quyền (`status === 'denied'`), luồng mua hàng và thanh toán vẫn diễn ra bình thường 100%, app không bị chặn hay crash. `notificationService` sẽ ghi log trạng thái, bỏ qua việc bắn native push và chuyển sang hiển thị banner giao diện mềm trong ứng dụng hoặc Alert hướng dẫn người dùng bật lại quyền trong Cài đặt nếu muốn.

- **Câu hỏi 3: Nếu Firebase offline hoặc lỗi mạng thì UI thể hiện gì?**  
  *Trả lời:* Ứng dụng triển khai cơ chế **Offline Resilient Fallback**: Nếu Firebase mất mạng hoặc chưa cấu hình API key, đơn hàng tự động được lưu vào `storageService` (AsyncStorage). Giao diện hiển thị nhãn trạng thái "Lưu trữ cục bộ" và tiếp tục dẫn người dùng đến màn hình "Đặt hàng thành công", đảm bảo trải nghiệm khách hàng không bị gián đoạn.

---

### 3.3 Nhóm Gemini AI (Mục 12.3)
- **Câu hỏi 1: Prompt và context lấy từ đâu?**  
  *Trả lời:* Prompt lấy từ câu hỏi/nhu cầu thực tế của người dùng. Context được trích xuất trực tiếp từ danh mục sản phẩm hiện có trong kho hàng (`products.slice(0, 25)` gồm: ID, tên, giá, danh mục, rating). Hai thông tin này được ghép vào System Prompt để Gemini đóng vai Trợ lý mua sắm của SmartShop.

- **Câu hỏi 2: Output nào phải validate trước khi dùng?**  
  *Trả lời:* Mảng `recommendedProductIds` (mã sản phẩm do AI đề xuất). Không bao giờ được tin tưởng trực tiếp dữ liệu do AI sinh ra.

- **Câu hỏi 3: Nếu AI hallucinate (ảo giác) mã sản phẩm không tồn tại thì phát hiện thế nào?**  
  *Trả lời:* Hàm `validateAndMatchOutput` duyệt qua từng ID do AI trả về và đối chiếu với danh mục kho: `catalogProducts.find(p => p.id === id)`. Nếu ID không tồn tại, hệ thống đưa vào mảng `hallucinatedIds`, loại bỏ khỏi danh sách hiển thị, và xuất thông báo: *"Lưu ý: Hệ thống đã lọc bỏ ID ảo không có trong kho hàng"*. Nếu toàn bộ ID đều ảo, hệ thống tự động fallback tìm kiếm sản phẩm theo từ khóa thực tế.

- **Câu hỏi 4: Phương pháp tiếp cận bảo mật Credential / API Key là gì?**  
  *Trả lời:* Tuân thủ nguyên tắc không bao giờ commit file `.env` hoặc API key thật lên Git repository (đã cấu hình trong `.gitignore`). Ứng dụng cung cấp màn hình Settings cho phép người dùng/giảng viên tự nhập API Key cá nhân vào AsyncStorage trong lúc chấm bài, hoặc nạp qua biến môi trường `EXPO_PUBLIC_GEMINI_API_KEY`.

---

### 3.4 Nhóm Debug / Release / Transfer (Mục 12.4)
- **Câu hỏi 1: Dev chạy bình thường nhưng Release lỗi: khoanh vùng gì đầu tiên?**  
  *Trả lời:* Khoanh vùng:
  1. Biến môi trường (`process.env`) chưa được nạp vào bản build release.
  2. Các thư viện native chưa được cấu hình quyền trong `app.json` (ví dụ thiếu quyền `INTERNET` hoặc `POST_NOTIFICATIONS`).
  3. Lỗi ProGuard / Minification làm đổi tên các hàm hoặc thuộc tính JSON parse.
  4. Địa chỉ `http://` không có SSL bị Android chặn (phải dùng `https://` như DummyJSON).

- **Câu hỏi 2: Thêm Category Filter kết hợp Search: Những tầng nào bị ảnh hưởng?**  
  *Trả lời:* 
  - Tầng API: URL chuyển thành gọi endpoint phù hợp hoặc lọc kết hợp.
  - Tầng State: `ProductContext` quản lý đồng thời cả `searchQuery` và `selectedCategory`.
  - Tầng UI: `ProductListScreen` gắn sự kiện `onPress` của category chips và ô search.
  - Tầng Test: Cần test 3 trường hợp: (1) Chỉ search; (2) Chỉ lọc danh mục; (3) Vừa chọn danh mục vừa search từ khóa.

