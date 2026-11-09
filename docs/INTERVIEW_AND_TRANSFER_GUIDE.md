# Hướng Dẫn Giải Thích Code 5 Tầng, Diễn Tập Vấn Đáp & Bài Toán Mở Rộng (Transfer Task)

- **Sinh viên thực hiện:** Nguyễn Minh Quân (`CE180048`)
- **Email:** `QuanNMCE180048@fpt.edu.vn`
- **Học phần:** MMA301 – Assignment 2 (Integrated E-Commerce Mobile App)

---

## 1. Giải Thích Code Theo 5 Tầng (Mục 7.2)

### 1.1. Luồng gọi API Sản phẩm & Phân trang (`fetchProductsPage` - `src/services/productService.js`)
1. **Purpose (Mục đích):** Tải một trang sản phẩm từ Remote API (`DummyJSON`), hỗ trợ tìm kiếm theo từ khóa, lọc theo danh mục và chuẩn hóa dữ liệu an toàn trước khi trả về cho màn hình.
2. **Input (Đầu vào):** Object `{ limit, skip, searchQuery, category, simulateError }`.
3. **Trigger (Khi nào chạy):** Được gọi bởi `loadFirstPage` (khi mở màn hình `ProductListScreen`, đổi từ khóa/danh mục, hoặc kéo `Pull-to-refresh`) và bởi `handleLoadMore` (khi cuộn xuống cuối `FlatList`).
4. **Transform (Biến đổi dữ liệu):**
   - Kiểm tra cờ `simulateError` (nếu bật thì ném lỗi để test Case 2).
   - Chọn đúng URL endpoint (`/products/search`, `/products/category/...`, hoặc `/products?limit=&skip=`).
   - Gọi `fetch()`, kiểm tra `response.ok`, chuyển từng phần tử thô qua hàm `normalizeProduct()` để đảm bảo luôn có đủ `id`, `title`, `price`, `rating`, `stock`, `thumbnail`.
   - Tính biến boolean `hasMore = skip + rawProducts.length < total && rawProducts.length > 0`.
5. **Output & Failure (Đầu ra & Xử lý lỗi):**
   - **Output:** Trả về `{ products, total, skip, limit, hasMore, source: 'remote_api' }`.
   - **Failure:** Nếu mất mạng hoặc HTTP khác 200, ném `Error` để `ProductListScreen` bắt trong `catch`, gán vào `errorMessage` và hiển thị component `StateFeedback (type="error")` kèm nút `Thử lại` và nút `Dùng dữ liệu Offline dự phòng`.

---

### 1.2. Luồng Phân trang Chống gọi lặp (`handleLoadMore` - `src/screens/ProductListScreen.js`)
1. **Purpose:** Tải trang sản phẩm tiếp theo khi người dùng cuộn chạm đáy danh sách mà không bao giờ gửi trùng request.
2. **Input:** Đọc các giá trị hiện tại `skip`, `searchText`, `selectedCategory`, `hasMore`, `isLoadingMore` và `isFetchingMoreRef.current`.
3. **Trigger:** Thuộc tính `onEndReached` của `FlatList` (ngưỡng `0.3`) hoặc khi người dùng bấm nút `↓ Tải thêm sản phẩm`.
4. **Transform:**
   - Kiểm tra khóa chặn đồng bộ: `if (isFetchingMoreRef.current || isLoadingInitial || isRefreshing || isLoadingMore || !hasMore || Boolean(errorMessage)) return;`.
   - Đặt ngay `isFetchingMoreRef.current = true` và `setIsLoadingMore(true)`.
   - Gọi `fetchProductsPage` với `skip` hiện tại, sau đó dùng `Set` chứa các `id` cũ để lọc bỏ phần tử trùng trước khi nối vào mảng `products`.
5. **Output & Failure:**
   - **Output:** Mảng `products` được nối thêm trang mới, `skip` tăng thêm `nextResult.products.length`, `hasMore` cập nhật mới.
   - **Failure:** Nếu lỗi mạng khi đang tải trang 2+, hiển thị thông báo lỗi và luôn mở khóa `isFetchingMoreRef.current = false` trong khối `finally`.

---

### 1.3. Luồng Tính toán Giỏ hàng Dẫn xuất (`cartSummary` - `src/context/CartContext.js`)
1. **Purpose:** Tính toán tự động mọi con số tổng hợp của giỏ hàng từ mảng `cartItems` mà không cần tạo state dư thừa (**R06**).
2. **Input:** Mảng `cartItems` (mỗi phần tử gồm `{ product, quantity, note }`) và hằng số cấu hình `SHOP_CONFIG`.
3. **Trigger:** Tự động tính lại qua hook `useMemo` mỗi khi mảng `cartItems` thay đổi (thêm, tăng, giảm, xóa, hoặc khôi phục từ `AsyncStorage`).
4. **Transform:**
   - `totalItems`: Dùng `reduce` cộng dồn `item.quantity`.
   - `subtotal`: Dùng `reduce` cộng dồn `item.product.price * item.quantity`.
   - `discountAmount`: Nếu `subtotal >= 300` (`VIP_DISCOUNT_THRESHOLD`) thì giảm `5%`, ngược lại bằng `0`.
   - `shippingFee`: Nếu `subtotal === 0` hoặc `subtotal >= 100` (`FREE_SHIPPING_THRESHOLD`) thì bằng `0`, ngược lại bằng `$8.00`.
   - `finalTotal`: `subtotal - discountAmount + shippingFee`.
5. **Output & Failure:**
   - **Output:** Object `{ totalItems, uniqueItemsCount, subtotal, discountAmount, shippingFee, finalTotal }`.
   - **Failure:** Ép kiểu `Number(... || 0)` ở mọi phép toán và `Math.max(0, ...)` nên không bao giờ sinh giá trị `NaN` hay số tiền âm.

---

### 1.4. Luồng Đặt hàng Firebase & Phát Notification (`submitOrderToFirebase` - `src/context/ShopContext.js`)
1. **Purpose:** Lưu đơn hàng của người dùng lên Firebase (`R08`) và kích hoạt thông báo xác nhận đơn hàng (`R09`).
2. **Input:** `{ items, cartSummary, customerNote }`.
3. **Trigger:** Người dùng bấm nút `✅ Đặt hàng & Đồng bộ Firebase + Gửi Thông báo` tại màn hình `CartScreen`.
4. **Transform:**
   - Gọi `createFirebaseOrder()` trong `src/services/firebaseService.js` để tạo bản ghi đơn hàng có mã `ORD-xxxxxx`, lưu vào `AsyncStorage` cache và đồng bộ lên Firestore collection `mma301_orders`.
   - Ngay khi tạo đơn thành công, gọi `triggerBusinessNotification({ eventType: 'ORDER_PLACED', ... })` để kiểm tra quyền thông báo và phát thông báo.
5. **Output & Failure:**
   - **Output:** Trả về `{ success: true, order, notificationResult }`, xóa giỏ hàng và hiển thị thanh `NotificationBanner` (nếu quyền là `granted`).
   - **Failure:** Nếu Firebase báo lỗi (Case 10), trả về `{ success: false, error }`, giữ nguyên giỏ hàng của người dùng và hiện cảnh báo đỏ trên `CartScreen`.

---

### 1.5. Luồng Kiểm증 Kết quả Gemini AI (`validateAiOutputAgainstCatalog` - `src/services/aiService.js`)
1. **Purpose:** Kiểm tra chéo danh sách gợi ý của AI với mảng sản phẩm thật trong Catalog để loại bỏ 100% sản phẩm do AI tự bịa (**R10 / Case 14**).
2. **Input:** `rawAiOutput` (JSON trả về từ Gemini hoặc bộ máy dự phòng) và mảng `catalogProducts` thật.
3. **Trigger:** Chạy bắt buộc ngay sau khi nhận phản hồi từ Gemini API (hoặc Fallback Engine) bên trong hàm `askGeminiProductAssistant()`.
4. **Transform:**
   - Tạo 2 bảng băm `catalogMapById` và `catalogMapByTitle` từ `catalogProducts`.
   - Duyệt từng phần tử trong `rawAiOutput.recommendations`:
     - Nếu tìm thấy sản phẩm khớp `id` hoặc `title` trong `Map` (và chưa bị trùng), đưa vào mảng `validRecommendations` kèm đối tượng `product` thật.
     - Nếu không tìm thấy trong `Map`, đẩy vào mảng `rejectedItems` kèm lý do `"ID/Tên sản phẩm không tồn tại trong Catalog thật"`.
5. **Output & Failure:**
   - **Output:** `{ summary, comparisonNote, validRecommendations, rejectedItems, validationReport }`.
   - **Failure:** Kể cả khi AI trả về mảng rỗng hoặc toàn ID sai, hàm vẫn trả về cấu trúc an toàn với `validRecommendations: []` và báo cáo số lượng bị chặn trong `validationReport`.

---

## 2. Bài Tập Tự Diễn Tập 30 Giây - "Mở Đúng File, Chỉ Đúng Dòng Code" (Mục 7.3)

Khi giảng viên hỏi bất kỳ câu nào trong 7 câu dưới đây, em mở ngay đúng file và chỉ vào đúng hàm tương ứng trong vòng 30 giây:

| # | Yêu cầu của Giảng viên | File cần mở ngay | Hàm / Vị trí chỉ tay giải thích |
| :-: | :--- | :--- | :--- |
| **1** | *"Mở file gọi API sản phẩm và chỉ chỗ xử lý `loading` / `error`"* | `src/services/productService.js` & `src/screens/ProductListScreen.js` | • Tại `productService.js`: Hàm `fetchProductsPage` (xây dựng URL, `fetch`, kiểm tra `response.ok`, chuẩn hóa qua `normalizeProduct`).<br>• Tại `ProductListScreen.js`: Hàm `loadFirstPage` (`setIsLoadingInitial(true)`, khối `catch` gán `setErrorMessage`, và `ListEmptyComponent` hiển thị `StateFeedback`). |
| **2** | *"Chỉ chỗ quản lý `pagination` và giải thích cách tránh gọi lặp request"* | `src/screens/ProductListScreen.js` | • Biến `const isFetchingMoreRef = useRef(false);` và hàm `handleLoadMore`.<br>• Giải thích: Kiểm tra `if (isFetchingMoreRef.current || !hasMore || ...) return;` ngay đầu hàm để chặn đồng bộ khi `FlatList.onEndReached` bắn liên tiếp, kết hợp `new Set(prevProducts.map(i => i.id))` để lọc trùng. |
| **3** | *"Chỉ nơi tính tổng tiền giỏ hàng và giải thích vì sao thiết kế như vậy"* | `src/context/CartContext.js` | • Biến `const cartSummary = useMemo(() => { ... }, [cartItems]);`.<br>• Giải thích: Dùng **Derived State** tính trực tiếp từ `cartItems` thay vì lưu vào `useState` riêng để đảm bảo Single Source of Truth, không bao giờ bị lệch tổng tiền khi thêm/sửa/xóa. |
| **4** | *"Chỉ chỗ đọc/ghi `AsyncStorage` và xử lý dữ liệu lỗi"* | `src/utils/storage.js` | • Hàm `getStoredItem(key, fallbackValue)` và `setStoredItem(key, value)`.<br>• Giải thích: Bọc `AsyncStorage.getItem` và `JSON.parse` trong `try/catch`; nếu dữ liệu `null` hoặc chuỗi JSON bị hỏng thì trả về `fallbackValue` mặc định, không làm crash app. |
| **5** | *"Chỉ nơi tích hợp Firebase và dữ liệu nào đang được đồng bộ"* | `src/services/firebaseService.js` & `src/context/ShopContext.js` | • Tại `firebaseService.js`: Các hàm `fetchFirebaseWishlist`, `saveFirebaseWishlist`, `fetchFirebaseOrders`, `createFirebaseOrder`.<br>• Đồng bộ 2 nghiệp vụ: Danh sách Yêu thích (`mma301_wishlists`) và Lịch sử Đơn hàng (`mma301_orders`) gắn với MSSV `CE180048`. |
| **6** | *"Chỉ nơi xin quyền `Notification` và sự kiện nào kích hoạt thông báo"* | `src/services/notificationService.js` | • Hàm `requestNotificationPermission()` và hàm `triggerBusinessNotification({ title, body, eventType })`.<br>• Giải thích: Kiểm tra `if (settings.permissionStatus !== 'granted')` trước tiên (Case 11); được kích hoạt khi Đặt hàng thành công (`ORDER_PLACED`), Lưu Wishlist (`WISHLIST_UPDATED`) hoặc bấm nút Test (`TEST_EVENT`). |
| **7** | *"Chỉ nơi gọi Gemini AI, dữ liệu ngữ cảnh truyền vào và cách validate output"* | `src/services/aiService.js` | • Hàm `buildShoppingPrompt` (truyền `catalogProducts`, `cartItems`, `budgetLimit`, `userPrompt`).<br>• Hàm `validateAiOutputAgainstCatalog(rawAiOutput, catalogProducts)` dùng `Map` đối chiếu `productId`/`title` với Catalog thật, đẩy các sản phẩm ảo giác vào `rejectedItems`. |

---

## 3. Ngân Hàng Câu Hỏi Phỏng Vấn & Câu Trả Lời Mẫu (Mục 12)

### 12.1. Câu hỏi về Kiến trúc và Luồng dữ liệu
- **Hỏi: Luồng dữ liệu đi như thế nào từ lúc mở màn hình sản phẩm đến lúc hiển thị danh sách?**
  - **Đáp:** Khi `ProductListScreen` mount, `useEffect` gọi hàm `loadFirstPage()`. Hàm này bật `isLoadingInitial = true` (UI hiện vòng xoay Loading), sau đó gọi `fetchProductsPage()` trong `src/services/productService.js`. Service gửi GET request tới `DummyJSON API`, nhận mảng sản phẩm thô, chuẩn hóa từng phần tử qua `normalizeProduct()` và trả về `{ products, total, hasMore }`. Màn hình cập nhật state `products`, đồng thời gọi `registerCatalogProducts()` lưu vào `ShopContext` cho AI dùng, và `FlatList` render danh sách các thẻ `ProductCard`.
- **Hỏi: Khi thêm sản phẩm vào giỏ, những state nào thay đổi và màn hình nào bị ảnh hưởng?**
  - **Đáp:** Khi gọi `addToCart(product, qty)` trong `CartContext`, mảng `cartItems` được cập nhật (cộng dồn số lượng nếu đã có hoặc thêm phần tử mới) và lưu ngay xuống `AsyncStorage` (`@mma301_a2_cart_items`). Khi `cartItems` đổi, biến `cartSummary` (`useMemo`) tự động tính lại `totalItems`, `subtotal`, `discountAmount`, `shippingFee`, `finalTotal`. Các màn hình bị ảnh hưởng và tự động cập nhật UI là: `ProductListScreen` (badge số lượng trên nút Giỏ hàng và nút `+ Giỏ (n)` trên thẻ sản phẩm), `ProductDetailScreen` (thông báo số lượng đang có trong giỏ), và `CartScreen` (danh sách món hàng và bảng tính tiền).
- **Hỏi: Tại sao tổng tiền giỏ hàng nên là derived value thay vì state lưu riêng?**
  - **Đáp:** Vì tổng số lượng, tạm tính, phí ship và tổng thanh toán hoàn toàn phụ thuộc 100% vào mảng `cartItems`. Nếu lưu chúng vào các `useState` riêng, bất kỳ khi nào thêm, tăng, giảm, xóa hoặc khôi phục giỏ hàng từ `AsyncStorage` mà quên cập nhật đồng thời tất cả các state đó thì giao diện sẽ bị lệch dữ liệu (Out-of-sync bug). Dùng `useMemo` tính từ `cartItems` đảm bảo một nguồn sự thật duy nhất (Single Source of Truth).
- **Hỏi: Làm sao tránh gọi trùng request khi người dùng cuộn xuống cuối danh sách nhiều lần?**
  - **Đáp:** Em kết hợp biến `useRef` (`isFetchingMoreRef.current`) với kiểm tra `!hasMore`, `isLoadingInitial`, `isRefreshing`, `errorMessage` ở ngay đầu hàm `handleLoadMore`. Vì `useRef` thay đổi giá trị đồng bộ tức thì ngay trong cùng frame cuộn (không chờ chu kỳ render tiếp theo như `useState`), các sự kiện `onEndReached` bắn trùng sau đó vài mili-giây sẽ bị chặn lại ngay lập tức.
- **Hỏi: Em kiểm tra kết quả Gemini bằng cách nào trước khi hiển thị?**
  - **Đáp:** Em viết hàm `validateAiOutputAgainstCatalog(rawAiOutput, catalogProducts)` trong `src/services/aiService.js`. Hàm này đưa toàn bộ sản phẩm thật trong Catalog vào `Map` theo `id` và `title`. Sau đó duyệt từng gợi ý trong `rawAiOutput.recommendations`: chỉ những mục tìm thấy đối tượng khớp trong `Map` mới được đưa vào `validRecommendations` để hiển thị lên UI; những mục không khớp sẽ bị chặn và đưa vào `rejectedItems`.

### 12.2. Câu hỏi về Xử lý Lỗi và Trường hợp Biên
- **Hỏi: Nếu API sản phẩm lỗi hoặc mạng chậm, người dùng nhìn thấy gì và làm gì tiếp theo?**
  - **Đáp:** Lúc đang chờ mạng sẽ thấy spinner `Loading`. Nếu API lỗi hoặc mất mạng, màn hình không bị trắng hay crash mà hiển thị khung `StateFeedback (type="error")` thông báo rõ nguyên nhân lỗi kèm 2 nút hành động: `Thử lại (Retry API)` để gọi lại máy chủ, hoặc `Dùng dữ liệu Offline dự phòng` để chuyển sang danh mục `FALLBACK_PRODUCTS` có sẵn trong máy.
- **Hỏi: Nếu giảm số lượng sản phẩm trong giỏ về 0 thì điều gì xảy ra?**
  - **Đáp:** Trong hàm `updateQuantity(productId, newQuantity)` của `CartContext`, em kiểm tra `if (Number.isNaN(numericQty) || numericQty <= 0)` thì tự động gọi `removeFromCart(productId)` để xóa mặt hàng đó khỏi giỏ, tuyệt đối không để tồn tại số lượng `0` hoặc số âm.
- **Hỏi: Nếu dữ liệu trong `AsyncStorage` bị lỗi định dạng JSON thì ứng dụng xử lý ra sao?**
  - **Đáp:** Hàm `getStoredItem(key, fallbackValue)` trong `src/utils/storage.js` bọc lệnh `JSON.parse(rawValue)` trong khối `try/catch`. Nếu chuỗi JSON bị hỏng, khối `catch` sẽ bắt lỗi, ghi `console.warn` và trả về `fallbackValue` an toàn (ví dụ mảng rỗng `[]` cho giỏ hàng) để ứng dụng khởi chạy bình thường.
- **Hỏi: Nếu quyền thông báo bị từ chối, app của em cư xử thế nào?**
  - **Đáp:** Trong `triggerBusinessNotification()` (`src/services/notificationService.js`), em kiểm tra `if (settings.permissionStatus !== 'granted')` trước khi gọi thông báo. Nếu bị từ chối (`denied`), ứng dụng vẫn hoàn tất nghiệp vụ chính (ví dụ vẫn đặt hàng thành công), không crash, không gọi hàm thông báo hệ thống, trả về trạng thái `BLOCKED_PERMISSION_DENIED` và ghi nhận vào Nhật ký sự kiện để người dùng biết lý do không có thông báo.
- **Hỏi: Nếu Gemini gợi ý một sản phẩm không có trong danh sách thật thì sao?**
  - **Đáp:** Hàm `validateAiOutputAgainstCatalog()` sẽ phát hiện `productId` và `productTitle` đó không nằm trong `catalogMapById` / `catalogMapByTitle`. Sản phẩm ảo giác đó bị loại khỏi danh sách hiển thị mua hàng và được liệt kê vào hộp cảnh báo đỏ `Đã chặn (Ảo giác)` trên màn hình `AiAssistantScreen` (như em đã chứng minh ở Test Case 14 với `ID #99999`).

---

## 4. Hướng Dẫn Thực Hiện Nhanh Modification / Transfer Task Tại Buổi Chấm (Mục 8)

Dưới đây là bảng phân tích tác động (**Impact Analysis Worksheet**) và hướng dẫn sửa code nhanh cho **7 yêu cầu mở rộng** giảng viên thường giao trực tiếp tại buổi bảo vệ:

| Kịch bản mở rộng (Modification Task) | File cần sửa | State / Hàm bị ảnh hưởng | Cách sửa nhanh trong 2–3 phút | Cách kiểm thử lại |
| :--- | :--- | :--- | :--- | :--- |
| **1. Thêm Sắp xếp sản phẩm theo Giá tăng/giảm hoặc Rating** | `src/screens/ProductListScreen.js` | Thêm state `sortBy` (`'default' \| 'price_asc' \| 'price_desc' \| 'rating_desc'`) | Tạo mảng `sortedProducts = useMemo(...)` sắp xếp mảng `products` theo `sortBy` rồi truyền `sortedProducts` vào thuộc tính `data` của `FlatList`. Thêm 3 nút bấm chọn kiểu sắp xếp ở `renderHeader`. | Bấm nút `Giá tăng dần` / `Giá giảm dần` -> Kiểm tra sản phẩm rẻ nhất/đắt nhất nhảy lên đầu danh sách. |
| **2. Thêm Bộ lọc Tồn kho (`stock > 20`) hoặc Rating (`>= 4.8`)** | `src/screens/ProductListScreen.js` | Thêm state boolean `onlyHighRating` | Lọc mảng `products` trước khi truyền vào `FlatList`: `products.filter(p => !onlyHighRating \|\| p.rating >= 4.8)`. | Bật nút lọc `★ >= 4.8` -> Chỉ các sản phẩm có đánh giá từ 4.8 trở lên được hiển thị; nếu rỗng thì hiện `StateFeedback`. |
| **3. Thêm Mã giảm giá (Voucher/Coupon) hoặc đổi quy tắc Freeship** | `src/constants/theme.js` & `src/context/CartContext.js` | `SHOP_CONFIG` và `cartSummary` trong `CartContext.js` | Đổi `FREE_SHIPPING_THRESHOLD` trong `theme.js`, hoặc thêm state `couponCode` trong `CartContext` (nếu `couponCode === 'FPT10'` thì giảm thêm `$10` trong `cartSummary`). | Nhập mã `FPT10` tại `CartScreen` -> Kiểm tra dòng giảm giá và `finalTotal` giảm đúng `$10.00`. |
| **4. Giới hạn số lượng tối đa mỗi sản phẩm trong giỏ (VD: Tối đa 5 món)** | `src/context/CartContext.js` | Hàm `addToCart` và `updateQuantity` | Dùng `Math.min(5, Math.floor(numericQty))` trong `updateQuantity` và `addToCart`. | Tại `CartScreen`, bấm nút `+` liên tục -> Số lượng dừng lại ở mức tối đa là `5`, không vượt quá giới hạn. |
| **5. Thêm trường mức độ ưu tiên hoặc ghi chú khi lưu Wishlist Firebase** | `src/context/ShopContext.js` & `src/screens/SavedOrdersScreen.js` | Hàm `toggleWishlistProduct` | Khi thêm sản phẩm vào `nextWishlist`, bổ sung trường `priority: 'Cao'` và hiển thị nhãn `Ưu tiên: Cao` trên thẻ Wishlist tại `SavedOrdersScreen`. | Lưu 1 sản phẩm mới vào Wishlist -> Mở tab `Yêu thích` kiểm tra nhãn `Ưu tiên: Cao` xuất hiện. |
| **6. Thêm sự kiện Notification khi tổng giỏ hàng vượt ngân sách (VD > $2000)** | `src/context/CartContext.js` hoặc `src/screens/CartScreen.js` | `triggerBusinessNotification` | Khi `cartSummary.finalTotal > 2000`, gọi `triggerBusinessNotification({ title: 'Cảnh báo ngân sách', body: 'Giỏ hàng đã vượt $2000!', eventType: 'BUDGET_ALERT' })`. | Thêm 2 chiếc MacBook/iPhone vào giỏ -> Thanh thông báo nổi cảnh báo vượt ngân sách xuất hiện ngay. |
| **7. Bắt buộc AI chỉ gợi ý sản phẩm còn tồn kho > 15 chiếc** | `src/services/aiService.js` | Hàm `validateAiOutputAgainstCatalog` | Trong điều kiện kiểm tra `matchedProduct`, thêm `&& matchedProduct.stock > 15`. Nếu `stock <= 15` thì đẩy vào `rejectedItems` với lý do `"Tồn kho thấp"`. | Bấm gửi yêu cầu AI -> Kiểm tra các sản phẩm được đề xuất đều có `stock > 15`. |

