# REQUIREMENT TRACEABILITY MATRIX (RTM)

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** 02 – Integrated E-Commerce Mobile App  
**Sinh viên:** Trần Minh Quân (CE181730)  
**Đề tài:** SmartShop Mobile E-Commerce Application  

---

## 1. Ma trận truy vết yêu cầu (Requirement Traceability Matrix)

| Mã YC | Tên Yêu Cầu | Thành phần UI / Code đảm nhận | Service / State / Layer | Test Case Tương Ứng | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R01** | **Remote Product Data**<br>Tải catalog từ DummyJSON API | `src/screens/ProductListScreen.js`<br>`src/components/ProductCard.js` | `src/api/productApi.js`<br>`src/context/ProductContext.js` | TC01 (Success)<br>TC02 (Offline/Retry) | ✅ Hoàn thành |
| **R02** | **FlatList + Pagination / Infinite**<br>Phân trang cuộn tải vô tận | `src/screens/ProductListScreen.js`<br>`ListFooterComponent` | `ProductContext.js`<br>`loadMoreProducts()` (skip & limit guard) | TC04 (End of list & No duplicate) | ✅ Hoàn thành |
| **R03** | **Search / Filter + Refresh**<br>Tìm kiếm từ khóa, danh mục & kéo làm mới | `src/screens/ProductListScreen.js`<br>`RefreshControl`, Category chips | `ProductContext.js`<br>`handleSearch()`, `handleCategorySelect()` | TC03 (Empty filter)<br>TC05 (Search hit/miss) | ✅ Hoàn thành |
| **R04** | **Product Detail**<br>Chi tiết sản phẩm, gallery, giá, kho hàng | `src/screens/ProductDetailScreen.js`<br>Image carousel, Buy bar | `productApi.fetchProductById()`<br>`route.params` | TC06 (Valid ID)<br>TC07 (Missing/invalid ID) | ✅ Hoàn thành |
| **R05** | **Cart State**<br>Thêm, tăng/giảm số lượng, xóa sản phẩm | `src/screens/CartScreen.js`<br>`src/components/CartItemCard.js` | `src/context/CartContext.js`<br>`addToCart()`, `updateQuantity()` | TC08 (Add same item)<br>TC09 (Quantity 0 removal) | ✅ Hoàn thành |
| **R06** | **Derived Totals**<br>Tính toán subtotal, giảm giá, phí ship, tổng tiền | `src/screens/CartScreen.js`<br>`src/screens/CheckoutScreen.js` | `CartContext.js`<br>Pure useMemo selectors (`totals`) | TC10 (0/1/many items calculation) | ✅ Hoàn thành |
| **R07** | **Persistence**<br>Lưu trữ và khôi phục giỏ hàng khi khởi động lại | `App.js`<br>`CartContext.js` | `src/services/storageService.js`<br>`AsyncStorage (@smartshop_cart_v1)` | TC11 (Kill & restart app state) | ✅ Hoàn thành |
| **R08** | **Firebase Use Case**<br>Đồng bộ đơn hàng đã đặt và Wishlist lên Cloud | `src/screens/CheckoutScreen.js`<br>`src/screens/OrderHistoryScreen.js` | `src/services/firebaseService.js`<br>`saveOrder()`, `fetchOrders()` | TC12 (Firebase write/read)<br>TC13 (Cloud offline fallback) | ✅ Hoàn thành |
| **R09** | **Notification Flow**<br>Xin quyền và kích hoạt thông báo sự kiện đơn hàng | `src/components/NotificationBanner.js`<br>`src/screens/SettingsScreen.js` | `src/services/notificationService.js`<br>`notifyOrderPlaced()`, `notifyFlashSale()` | TC14 (Permission allow/deny)<br>TC15 (Order placed event) | ✅ Hoàn thành |
| **R10** | **Gemini AI Integration**<br>Tư vấn mua sắm dựa trên kho hàng thực tế & validate | `src/screens/AIScreen.js`<br>`src/components/ValidatedAICard.js` | `src/services/geminiService.js`<br>`askShoppingAdvisor()`, `validateAndMatchOutput()` | TC16 (Valid recommendations)<br>TC17 (Hallucinated ID filtering) | ✅ Hoàn thành |
| **R11** | **Debug Evidence**<br>Bằng chứng tìm nguyên nhân gốc rễ và sửa 2 bug | `DEBUG_LOGS.md`<br>Git commit history | `ProductContext.js` (onEndReached guard)<br>`CartContext.js` (Price parsing) | TC18 (Infinite loop guard)<br>TC19 (Total precision fix) | ✅ Hoàn thành |
| **R12** | **Release Build**<br>Cấu hình standalone APK / build evidence | `app.json`<br>`eas.json` (Release profile) | Standalone build config & assets | TC20 (Build verification) | ✅ Hoàn thành |

---

## 2. Business Workflow & Event Flow

```mermaid
flowchart TD
    Start([1. Khởi động Ứng dụng]) --> RestoreStorage[Khôi phục Cart & Wishlist từ AsyncStorage]
    RestoreStorage --> FetchAPI[Tải danh mục Catalog từ DummyJSON API]
    FetchAPI --> Browse[2. Lướt xem danh mục & Tìm kiếm / Lọc danh mục]
    Browse --> Detail[3. Xem chi tiết sản phẩm]
    
    Detail -->|Bấm Thêm vào giỏ| Cart[4. Quản lý Giỏ hàng]
    Detail -->|Bấm Hỏi AI| AI[5. Tư vấn Gemini AI]
    
    AI --> Grounding[Truyền danh mục hàng thật vào Context]
    Grounding --> GeminiAPI[Gọi Gemini 1.5 Flash]
    GeminiAPI --> ValidateAI{Kiểm tra ID AI trả về có trong kho?}
    ValidateAI -->|Hợp lệ| RenderCards[Hiển thị Card có nút Xem & Mua]
    ValidateAI -->|ID ảo/Lỗi| FilterFallback[Lọc bỏ ID ảo + Cảnh báo an toàn]
    RenderCards --> Cart
    FilterFallback --> Cart

    Cart --> DerivedCalc[Tự động tính Tạm tính - Giảm giá 10% + Ship]
    DerivedCalc --> Checkout[6. Xác nhận thanh toán & Giao hàng]
    Checkout --> FirebaseSync[7. Đồng bộ đơn hàng lên Firebase Firestore]
    FirebaseSync --> NotifTrigger[8. Bắn thông báo Đặt hàng thành công]
    NotifTrigger --> SuccessScreen([9. Màn hình hoàn tất & Lịch sử đơn hàng])
```

