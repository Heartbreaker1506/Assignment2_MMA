# Ma Trận Kiểm Thử 15 Ca (Test Matrix) & Nhật Ký Gỡ Lỗi (Debug Logs)

- **Sinh viên thực hiện:** Nguyễn Minh Quân (`CE180048`)
- **Email:** `QuanNMCE180048@fpt.edu.vn`
- **Học phần:** MMA301 – Assignment 2 (Integrated E-Commerce Mobile App)

---

## 1. Test Matrix - 15 Ca Kiểm Thử Bắt Buộc (Mục 5)

| Case | Kịch bản kiểm thử | Các bước thực hiện | Kết quả kỳ vọng (Expected) | Kết quả thực tế (Actual) | Trạng thái |
| :-: | :--- | :--- | :--- | :--- | :---: |
| **1** | **API load thành công (`R01`)** | Mở ứng dụng khi có kết nối mạng. | Hiển thị spinner `Loading` lúc đầu, sau đó render danh sách 8 sản phẩm trang 1 từ `DummyJSON` kèm giá, ảnh, đánh giá và badge `🌐 Remote API`. | Hiển thị đúng 8 sản phẩm đầu tiên, thông số thống kê báo `Hiển thị 8 / 194 sản phẩm (Trang: 1)`. | **PASS** |
| **2** | **API lỗi / mất mạng (`R01`)** | Vào `⚙️ Cài đặt & Test`, bật công tắc **Case 2 (Mô phỏng lỗi mạng Product API)** rồi quay lại `ProductListScreen`. | Có thông báo lỗi rõ ràng và nút `Thử lại (Retry API)` hoạt động; không crash ứng dụng. | Hiển thị khung `StateFeedback` màu đỏ báo lỗi kết nối kèm 2 nút `Thử lại (Retry API)` và `Dùng dữ liệu Offline dự phòng`. Bấm tắt mô phỏng và thử lại tải lại thành công. | **PASS** |
| **3** | **Search / Filter không có kết quả (`R02`)** | Tại ô tìm kiếm trên `ProductListScreen`, nhập chuỗi `"khongtontai999"` hoặc lọc danh mục không khớp. | Hiển thị trạng thái `Empty` rõ ràng kèm nút xóa bộ lọc. | Hiển thị thông báo `"Không tìm thấy sản phẩm phù hợp (R02)"` kèm nút `Xóa bộ lọc tìm kiếm`. Khi bấm nút, danh sách sản phẩm trở lại bình thường. | **PASS** |
| **4** | **Pagination load more (`R03`)** | Cuộn xuống cuối danh sách trên `ProductListScreen` hoặc bấm nút `↓ Tải thêm sản phẩm` liên tiếp đến khi hết trang. | Tải trang tiếp theo (`skip` tăng thêm 8); không gọi trùng request khi đang tải hoặc khi `hasMore === false`. | Nhờ khóa `isFetchingMoreRef.current` và lọc trùng `Set(id)`, mỗi trang chỉ gọi đúng 1 request; khi hết danh mục hiển thị dòng `✓ Đã hiển thị toàn bộ sản phẩm`. | **PASS** |
| **5** | **Pull-to-refresh (`R03`)** | Kéo danh sách sản phẩm từ trên xuống để làm mới dữ liệu. | Reset trạng thái phân trang (`skip = 0`), tải lại trang 1 mới nhất và không làm nhân đôi các phần tử cũ. | Vòng xoay `RefreshControl` xuất hiện, danh sách được đặt lại về đúng 8 sản phẩm trang 1, không xảy ra lỗi trùng key. | **PASS** |
| **6** | **Add / Update Cart (`R05`, `R06`)** | Bấm `+ Thêm giỏ` ở danh sách hoặc chọn số lượng 2 tại `ProductDetailScreen`, sau đó vào `CartScreen` bấm nút `+` để tăng số lượng. | Số lượng mặt hàng và bảng `Derived Totals` (`totalItems`, `subtotal`, `discountAmount`, `shippingFee`, `finalTotal`) cập nhật đúng tức thì. | Badge giỏ hàng tăng đúng số lượng; tại `CartScreen`, `subtotal`, giảm giá 5% (khi `>= $300`), phí ship (miễn phí khi `>= $100`) và `finalTotal` tính chính xác 100%. | **PASS** |
| **7** | **Cart quantity edge case (`R05`, `R06`)** | Tại `CartScreen`, bấm nút `−` trên mặt hàng đang có số lượng là `1` (hoặc bấm nút `Xóa`). | Tự động xóa mặt hàng khỏi giỏ khi số lượng giảm về `0`; tuyệt đối không sinh số lượng âm; tổng tiền tính lại đúng. | Khi giảm từ `1` xuống `0`, hàm `updateQuantity` tự động gọi `removeFromCart(productId)`, mặt hàng biến mất khỏi giỏ, không có số âm, tổng tiền về `$0.00` nếu giỏ trống. | **PASS** |
| **8** | **AsyncStorage persistence (`R07`)** | Thêm 2 sản phẩm vào giỏ, bật chế độ `Dark Mode`, đóng hoàn toàn ứng dụng (reload/reopen) rồi mở lại. | Dữ liệu giỏ hàng và giao diện Tối được khôi phục nguyên vẹn sau khi mở lại app. | Khi khởi động lại ứng dụng, `CartContext` và `ThemeContext` đọc từ `AsyncStorage` (`@mma301_a2_cart_items`, `@mma301_a2_theme_mode`) và hiển thị lại đúng 2 sản phẩm cùng nền tối. | **PASS** |
| **9** | **Firebase read / write / sync (`R08`)** | Bấm biểu tượng `❤️` lưu sản phẩm vào Wishlist và bấm `Đặt hàng` tại `CartScreen`, sau đó mở màn hình `SavedOrdersScreen`. | Dữ liệu Wishlist và Đơn hàng mới (`ORD-xxxxxx`) được lưu/đọc/đồng bộ đúng theo thiết kế ở cả 2 tab `Yêu thích` và `Đơn hàng`. | Tab `Yêu thích` hiển thị đúng sản phẩm vừa lưu; Tab `Đơn hàng` hiển thị đơn hàng mới kèm thời gian, nguồn đồng bộ và danh sách sản phẩm chi tiết. | **PASS** |
| **10** | **Firebase error / offline (`R08`)** | Vào `⚙️ Cài đặt & Test`, bật **Case 10 (Mô phỏng lỗi đồng bộ Firebase)** rồi thử Đặt hàng hoặc bấm `🔄 Đồng bộ ngay`. | Ứng dụng không crash; hiển thị cảnh báo lỗi đồng bộ Firebase rõ ràng; giỏ hàng không bị xóa mất khi đặt đơn thất bại. | Hiển thị banner đỏ báo lỗi `Simulated Firebase Error - Case 10`, các món hàng trong giỏ vẫn được giữ nguyên an toàn kèm nút tắt mô phỏng lỗi để thử lại. | **PASS** |
| **11** | **Notification permission denied (`R09`)** | Vào `⚙️ Cài đặt & Test`, chọn trạng thái **`✕ Từ chối (Case 11)`** rồi bấm nút `Kích hoạt Sự kiện Thông báo Kiểm thử` (hoặc Đặt hàng). | Ứng dụng không crash; hiển thị trạng thái đã chặn thông báo do quyền bị từ chối và ghi vào nhật ký. | Không phát popup thông báo, hiển thị thông báo vàng giải thích quyền đang ở trạng thái `DENIED`, đồng thời ghi bản ghi `BLOCKED_PERMISSION_DENIED` vào Nhật ký sự kiện. | **PASS** |
| **12** | **Notification allowed / test flow (`R09`)** | Chọn trạng thái **`✓ Cho phép (Case 12)`** rồi bấm `Kích hoạt Sự kiện Thông báo Kiểm thử` hoặc thực hiện Đặt hàng tại `CartScreen`. | Luồng thông báo hoạt động đúng thiết kế: phát thông báo đẩy và hiển thị thanh thông báo nổi trên màn hình. | Xuất hiện ngay thanh `NotificationBanner` màu xanh ở đầu màn hình kèm tiêu đề & nội dung sự kiện, đồng thời lưu bản ghi `DELIVERED` vào Nhật ký thông báo. | **PASS** |
| **13** | **Gemini valid request (`R10`)** | Mở `AiAssistantScreen`, chọn mẫu câu hỏi `"Tư vấn điện thoại..."` hoặc `"So sánh Laptop SV"`, tắt mô phỏng lỗi và bấm `Gửi yêu cầu tới Gemini AI`. | Nhận được phản hồi tư vấn/so sánh hợp lý, các sản phẩm đề xuất đều khớp 100% với dữ liệu `Catalog` thật và có thể bấm `Xem chi tiết` hoặc `+ Thêm vào giỏ`. | Báo cáo kiểm증 hiển thị `Gợi ý thô: 3 | Khớp Catalog thật: 3 | Đã chặn: 0`. Cả 3 thẻ sản phẩm đều có nhãn `✓ Khớp Catalog ID #...` và thêm vào giỏ hàng thành công. | **PASS** |
| **14** | **Gemini invalid / error / hallucination (`R10`)** | Tại `AiAssistantScreen`, bật công tắc **Mô phỏng Case 14 (Giả lập AI trả về sản phẩm ảo giác ID #99999)** rồi bấm `Gửi yêu cầu tới Gemini AI`. | Bộ lọc `validateAiOutputAgainstCatalog()` phát hiện và chặn sản phẩm không tồn tại trong Catalog thật; không hiển thị gợi ý sai như dữ liệu thật. | Báo cáo kiểm증 báo `Đã chặn (Ảo giác): 1`, hiển thị khung cảnh báo đỏ chỉ rõ `[ID: 99999] "Quantum Hologram Phone Z99" -> Đã chặn bởi Output Validator`, chỉ render các sản phẩm có thật bên dưới. | **PASS** |
| **15** | **Release readiness (`R11`)** | Kiểm tra cấu hình `app.json`, `eas.json`, `.gitignore`, `.env.example` và tài liệu `docs/RELEASE_BUILD_EVIDENCE.md`. | Cấu hình package `com.ce180048.assignment2`, `versionCode: 1`, build profile APK đầy đủ; không có API key hay file keystore nhạy cảm bị commit trong repo. | Kiểm tra toàn bộ mã nguồn không chứa secret thật; `app.json` và `eas.json` hợp lệ sẵn sàng cho lệnh `eas build -p android --profile preview` hoặc `./gradlew assembleRelease`. | **PASS** |

---

## 2. Nhật Ký Gỡ Lỗi - Debug Logs Theo Quy Trình 5 Bước (Mục 6)

### Debug Log #1: Lỗi gọi lặp API phân trang và cảnh báo trùng khóa (Duplicate Key) khi cuộn nhanh `FlatList`

1. **Triệu chứng (Symptom):**
   - Trong quá trình thử nghiệm tính năng cuộn tải thêm trang mới (`Pagination / Infinite Scroll` - **R03**) trên `ProductListScreen`, khi vuốt nhanh xuống cuối danh sách, ứng dụng bắn liên tiếp 2 đến 3 request có cùng tham số `skip=8`, dẫn đến cảnh báo đỏ của React Native: `Encountered two children with the same key, "9"` và danh sách bị lặp sản phẩm.
2. **Giả thuyết (Hypothesis):**
   - **Giả thuyết A:** Sự kiện `onEndReached` của `FlatList` được kích hoạt nhiều lần trong cùng một khung hình cuộn trước khi biến state `isLoadingMore` kịp cập nhật từ `false` sang `true` (do `setState` trong React hoạt động bất đồng bộ theo chu kỳ render).
   - **Giả thuyết B:** Khi nối mảng trang mới vào mảng cũ (`[...prevProducts, ...nextResult.products]`), chưa có bước lọc bỏ các phần tử có `id` đã tồn tại.
3. **Kiểm tra (Inspection):**
   - Đặt `console.log('[Pagination] skip =', skip, 'isLoadingMore =', isLoadingMore)` ở đầu hàm `handleLoadMore` trong file `src/screens/ProductListScreen.js`.
   - Quan sát log trên terminal thấy có 2 dòng log in ra cách nhau chỉ 12ms với cùng giá trị `skip = 8, isLoadingMore = false`. Điều này xác nhận cả Giả thuyết A và Giả thuyết B đều đúng.
4. **Nguyên nhân gốc (Root Cause):**
   - Chỉ dựa vào `useState` (`isLoadingMore`) để làm điều kiện chặn ở đầu hàm `handleLoadMore` là không đủ nhanh khi người dùng vuốt mạnh, vì `isLoadingMore` chỉ đổi giá trị ở lần render tiếp theo.
5. **Sửa lỗi và Kiểm thử lại (Fix & Retest):**
   - **Cách sửa trong `src/screens/ProductListScreen.js`:**
     - Bổ sung một biến tham chiếu đồng bộ `const isFetchingMoreRef = useRef(false);`.
     - Ngay khi bắt đầu `handleLoadMore`, kiểm tra `if (isFetchingMoreRef.current || isLoadingInitial || isRefreshing || isLoadingMore || !hasMore || Boolean(errorMessage)) return;` và gán lập tức `isFetchingMoreRef.current = true;` trước khi `await fetchProductsPage(...)`.
     - Khi cập nhật mảng `products`, dùng `Set` để lọc trùng theo `id`:
       ```javascript
       setProducts((prevProducts) => {
         const existingIds = new Set(prevProducts.map((item) => Number(item.id)));
         const uniqueNewItems = nextResult.products.filter(
           (item) => !existingIds.has(Number(item.id))
         );
         return [...prevProducts, ...uniqueNewItems];
       });
       ```
     - Đặt `isFetchingMoreRef.current = false;` trong khối `finally`.
   - **Kết quả kiểm thử lại (Case 4 & Case 5):** Vuốt cực nhanh nhiều lần liên tục xuống đáy danh sách và kéo `Pull-to-refresh`, mỗi trang chỉ gọi đúng 1 lần duy nhất, không còn bất kỳ cảnh báo trùng khóa nào.

---

### Debug Log #2: Lỗi lệch tổng tiền giỏ hàng (Out-of-sync Total) và sinh số lượng `0` / số âm khi giảm nhanh mặt hàng

1. **Triệu chứng (Symptom):**
   - Ở phiên bản thử nghiệm đầu tiên của `CartContext`, khi người dùng bấm nút `−` liên tiếp trên một sản phẩm trong `CartScreen` từ số lượng `1` xuống `0`, mặt hàng vẫn nằm lại trong giỏ với số lượng `0` (hoặc `-1`), và phí vận chuyển `$8.00` vẫn bị cộng vào tổng tiền dù giỏ hàng thực tế không còn món hàng nào hợp lệ.
2. **Giả thuyết (Hypothesis):**
   - **Giả thuyết A:** Hàm `updateQuantity(productId, newQuantity)` chưa xử lý trường hợp biên `newQuantity <= 0` để chuyển sang hành động xóa mặt hàng khỏi mảng `cartItems`.
   - **Giả thuyết B:** Việc lưu `subtotal` và `shippingFee` trong một `useState` riêng khiến việc tính phí ship bị trễ hoặc quên cập nhật khi xóa mặt hàng cuối cùng, hoặc quên kiểm tra điều kiện `subtotal === 0` thì `shippingFee` phải bằng `0`.
3. **Kiểm tra (Inspection):**
   - Kiểm tra logic trong `src/context/CartContext.js`: phát hiện biểu thức tính phí ship ban đầu viết `subtotal >= SHOP_CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : SHOP_CONFIG.STANDARD_SHIPPING_FEE`. Khi giỏ trống (`subtotal === 0`), vì `0 < 100` nên biểu thức trả về phí ship `$8.00`! Đồng thời hàm giảm số lượng cho phép `newQuantity = 0` nằm lại trong mảng.
4. **Nguyên nhân gốc (Root Cause):**
   - Thiếu điều kiện biên cho `newQuantity <= 0` trong hàm cập nhật số lượng và thiếu kiểm tra `subtotal === 0` trong công thức tính phí vận chuyển của `cartSummary`.
5. **Sửa lỗi và Kiểm thử lại (Fix & Retest):**
   - **Cách sửa trong `src/context/CartContext.js`:**
     - Trong `updateQuantity(productId, newQuantity)`:
       ```javascript
       const numericQty = Number(newQuantity);
       if (Number.isNaN(numericQty) || numericQty <= 0) {
         await removeFromCart(productId);
         return;
       }
       ```
     - Loại bỏ mọi state lưu tổng tiền riêng lẻ; dùng `useMemo` để tính `cartSummary` trực tiếp từ `cartItems` và sửa điều kiện phí ship:
       ```javascript
       const shippingFee =
         subtotal === 0 || subtotal >= SHOP_CONFIG.FREE_SHIPPING_THRESHOLD
           ? 0
           : SHOP_CONFIG.STANDARD_SHIPPING_FEE;
       ```
     - Khi khôi phục giỏ hàng từ `AsyncStorage` (`loadCartFromStorage`), lọc chỉ giữ các phần tử có `Number(item.quantity) > 0`.
   - **Kết quả kiểm thử lại (Case 6, Case 7 & Case 8):** Giảm số lượng từ `1` về `0` tự động xóa sản phẩm khỏi giỏ; khi giỏ trống, `subtotal`, `discountAmount`, `shippingFee` và `finalTotal` đều về đúng `$0.00`.

---

### Debug Log #3: Lỗi `JSON.parse` thất bại khi Gemini AI bọc kết quả trong Markdown ````json ```` và gợi ý sản phẩm ngoài danh mục

1. **Triệu chứng (Symptom):**
   - Khi gọi Gemini API trong `src/services/aiService.js` với câu hỏi tự do như `"Hãy gợi ý cho tôi điện thoại chơi game tốt nhất"`, đôi khi hàm `JSON.parse(rawText)` ném lỗi `SyntaxError: Unexpected token '`'` hoặc kết quả trả về chứa tên một mẫu điện thoại không hề có trong danh sách sản phẩm của ứng dụng, khiến việc bấm vào xem chi tiết bị lỗi thiếu dữ liệu.
2. **Giả thuyết (Hypothesis):**
   - **Giả thuyết A:** Dù đã nhắc trong prompt trả về JSON, mô hình LLM đôi khi vẫn bọc chuỗi JSON bên trong khối mã Markdown ````json ... ````.
   - **Giả thuyết B:** Mô hình ngôn ngữ có thể sinh ra sản phẩm theo kiến thức chung bên ngoài (Hallucination) thay vì chỉ chọn trong mảng `CATALOG_DATA` được truyền vào.
3. **Kiểm tra (Inspection):**
   - In nội dung `rawText` trả về từ Gemini API ra console và đối chiếu mảng `recommendations` với `knownCatalog`. Thấy rõ chuỗi có tiền tố ````json\n` và có trường hợp `productId` không khớp với bất kỳ `id` nào trong `knownCatalog`.
4. **Nguyên nhân gốc (Root Cause):**
   - Chưa làm sạch ký tự bọc Markdown trước khi `JSON.parse()` và chưa có bước hậu kiểm (Post-validation) đối chiếu kết quả AI với danh sách sản phẩm thật của cửa hàng trước khi đẩy lên UI.
5. **Sửa lỗi và Kiểm thử lại (Fix & Retest):**
   - **Cách sửa trong `src/services/aiService.js`:**
     - Thêm cấu hình `responseMimeType: 'application/json'` khi gọi Gemini REST API và làm sạch chuỗi trước khi parse:
       ```javascript
       const cleanedJsonText = rawText
         .replace(/```json/gi, '')
         .replace(/```/g, '')
         .trim();
       const parsedOutput = JSON.parse(cleanedJsonText);
       ```
     - Xây dựng hàm **`validateAiOutputAgainstCatalog(rawAiOutput, catalogProducts)`** tạo `Map` tra cứu theo `id` và `title` của toàn bộ sản phẩm thật trong `catalogProducts`. Chỉ những đề xuất tìm thấy sản phẩm khớp thật trong `Map` mới được đưa vào `validRecommendations` (kèm đính kèm đối tượng `product` thật); mọi đề xuất không khớp đều bị tách sang mảng `rejectedItems` và báo cáo trên UI.
   - **Kết quả kiểm thử lại (Case 13 & Case 14):** Cả khi gọi Gemini thật lẫn khi bật công tắc mô phỏng sản phẩm ảo giác `ID #99999`, ứng dụng không bao giờ bị lỗi parse JSON và chặn 100% sản phẩm không có trong Catalog thật.

