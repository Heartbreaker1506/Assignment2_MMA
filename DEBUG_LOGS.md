# DEBUG LOGS & ROOT-CAUSE ANALYSIS

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** 02 – Integrated E-Commerce Mobile App  
**Sinh viên:** Trần Minh Quân (CE181730)  
**Tiêu chí đánh giá:** Debugging & Problem Solving (Mục 5 Rubric: 1.5 / 1.5 điểm)  

---

## Quy trình 5 Bước Debug Chuẩn
1. **Mô tả triệu chứng (Symptom Description):** Hiện tượng quan sát được trên UI hoặc qua Network/Console logs.
2. **Khoanh vùng (Localization):** Xác định chính xác Screen, Component, Context hoặc Service xảy ra lỗi.
3. **Kiểm tra Input/State:** Đo đạc dữ liệu đầu vào và các cờ trạng thái trước thời điểm phát sinh lỗi.
4. **Kiểm tra điểm biến đổi / Async Call:** Phân tích luồng bất đồng bộ, hàm biến đổi dữ liệu và side-effects.
5. **Sửa nhỏ nhất & Retest:** Áp dụng bản vá tối giản (minimal fix), kiểm thử lại ca lỗi và kiểm tra hồi quy (regression test).

---

## 1. Debug Case 01: Lỗi FlatList Gọi API Lặp Vô Hạn Khi Cuộn Trang

### 1.1 Triệu chứng (Symptom)
Khi người dùng cuộn danh sách sản phẩm ở `ProductListScreen` xuống gần cuối màn hình, tab Network và Console liên tục bắn ra hàng chục request `GET /products?limit=10&skip=...` chỉ trong vòng 1-2 giây. Danh sách bị giật lag, xuất hiện nhiều sản phẩm bị trùng lặp ID, và ứng dụng có nguy cơ bị đơ hoặc chạm ngưỡng Rate-limit của API.

### 1.2 Giả thuyết (Hypothesis)
Sự kiện `onEndReached` của FlatList trong React Native được kích hoạt nhiều lần liên tiếp khi vị trí cuộn nằm trong ngưỡng `onEndReachedThreshold`, trong khi request trước đó chưa kịp hoàn tất (trạng thái pending) và chưa có cờ chặn (guard flag).

### 1.3 Cách kiểm tra (Investigation & Tool)
- **Công cụ:** `console.log` ghi vết thời gian gọi hàm và cờ trạng thái trong `ProductContext.js`.
- **Thực nghiệm:** Thêm log vào hàm `loadMoreProducts`:
  ```javascript
  console.log('[DEBUG] loadMore called at:', Date.now(), 'loading:', loading, 'isFetchingMore:', isFetchingMore);
  ```
- **Kết quả kiểm tra:** Khi cuộn qua ngưỡng, hàm `loadMoreProducts` được gọi liên tiếp 6 lần trước khi request đầu tiên trả về response (`isFetchingMore` ban đầu không có hoặc bị cập nhật trễ).

### 1.4 Nguyên nhân gốc rễ (Root Cause)
1. Hàm `loadMoreProducts` thiếu cơ chế guard đa tầng: không kiểm tra cờ `loading` chính, không kiểm tra cờ `isFetchingMore`, và không kiểm tra điều kiện danh sách đã hết sản phẩm chưa (`products.length >= total`).
2. Mảng dữ liệu mới từ API được nối trực tiếp bằng `[...prev, ...result.products]` mà không kiểm tra trùng lặp khóa (unique ID), dẫn đến cảnh báo: *"Warning: Encountered two children with the same key"*.

### 1.5 Bản vá khắc phục (Minimal Fix)
Tại `src/context/ProductContext.js`:
```javascript
// 1. Thêm Guard 4 điều kiện nghiêm ngặt ở đầu hàm:
const loadMoreProducts = useCallback(async () => {
  if (loading || isFetchingMore || !hasMore || products.length >= total) {
    return; // Chặn ngay lập tức nếu đang bận hoặc đã hết dữ liệu
  }

  setIsFetchingMore(true);

  try {
    const result = await productApi.fetchProducts({
      limit: CONFIG.DEFAULT_PAGE_SIZE,
      skip: skip,
      search: searchQuery,
      category: selectedCategory === 'all' ? '' : selectedCategory,
    });

    // 2. Khử trùng lặp ID bằng Set trước khi cập nhật state:
    setProducts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newUnique = result.products.filter((p) => !existingIds.has(p.id));
      return [...prev, ...newUnique];
    });

    setSkip((prev) => prev + result.products.length);
    setHasMore(result.hasMore);
  } finally {
    setIsFetchingMore(false);
  }
}, [loading, isFetchingMore, hasMore, products.length, total, skip, searchQuery, selectedCategory]);
```

### 1.6 Kiểm thử lại & Hồi quy (Retest & Regression)
- **Thực hiện:** Mở màn hình sản phẩm, cuộn thật nhanh từ đầu đến cuối danh sách nhiều lần.
- **Kết quả:** Mỗi lần chạm đáy chỉ gửi đúng 1 request lấy trang kế tiếp. Khi `skip = 194`, chữ "Đã hiển thị tất cả sản phẩm" xuất hiện và hoàn toàn không gửi thêm request nào. Console không còn cảnh báo duplicate key. **Pass 100%.**

---

## 2. Debug Case 02: Lỗi Tính Sai Tổng Tiền Giỏ Hàng Do Nối Chuỗi & Sai Số Nhị Phân

### 2.1 Triệu chứng (Symptom)
Khi thêm 2 sản phẩm có giá lẻ vào giỏ hàng (ví dụ: sản phẩm A giá `$19.99` và sản phẩm B giá `$145.00`), tổng tiền giỏ hàng hiển thị ra chuỗi kỳ lạ `$19.99145` hoặc `$164.99000000000004`. Khi người dùng xóa hết các món trong giỏ hàng, đôi khi tổng tiền vẫn kẹt ở số cũ mà không trở về `$0.00`.

### 2.2 Giả thuyết (Hypothesis)
1. Dữ liệu trường `price` từ API hoặc từ mock data đôi khi là dạng chuỗi (`string`) thay vì số thực (`number`), khiến toán tử cộng `+` trong JavaScript hoạt động như phép nối chuỗi (String Concatenation).
2. Chuẩn số thực dấu phẩy động IEEE 754 gây ra hiện tượng tràn chữ số sau dấu phẩy (Floating-point precision issue).
3. Tổng tiền đang được lưu trữ dưới dạng một `useState` độc lập song song với `cartItems`, dẫn đến tình trạng hai state bị lệch pha (State Desynchronization) khi cập nhật bất đồng bộ.

### 2.3 Cách kiểm tra (Investigation & Tool)
- **Công cụ:** `typeof item.product.price` và console inspect.
- **Thực nghiệm:** Kiểm tra kiểu dữ liệu trong reducer/context:
  ```javascript
  cartItems.forEach(item => {
    console.log('[DEBUG PRICE]', typeof item.product.price, item.product.price);
  });
  ```
- **Kết quả:** Một số sản phẩm từ API trả về `"price": "19.99"` (dạng string). Khi cộng dồn `acc + item.product.price * item.quantity`, JavaScript ép kiểu chuỗi làm hỏng toàn bộ phép toán.

### 2.4 Nguyên nhân gốc rễ (Root Cause)
1. Thiếu bước chuẩn hóa (Data Normalization) và ép kiểu tường minh `Number(price)` ở cả tầng API và tầng State.
2. Không sử dụng **Derived State (Trạng thái phái sinh)** mà lại dùng `useState` riêng cho `totalPrice`, tạo ra 2 nguồn chân lý (Multiple Sources of Truth).

### 2.5 Bản vá khắc phục (Minimal Fix)
1. **Tầng API (`src/api/productApi.js`):** Luôn chuẩn hóa số:
   ```javascript
   price: Number(item.price) || 0,
   discountPercentage: Number(item.discountPercentage) || 0,
   ```
2. **Tầng State (`src/context/CartContext.js`):** Xóa bỏ `useState(totalPrice)`, thay thế hoàn toàn bằng **Pure Derived Memo Selector**:
   ```javascript
   const totals = useMemo(() => {
     const itemCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

     const subtotal = cartItems.reduce((acc, item) => {
       const price = Number(item.product?.price) || 0;
       const qty = Number(item.quantity) || 0;
       return acc + price * qty;
     }, 0);

     // Giảm 10% nếu giỏ hàng từ $100 trở lên
     const discount = subtotal >= 100 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
     const shippingFee = subtotal > 0 && subtotal < 150 ? 5.0 : 0.0;
     const totalAmount = Math.max(0, Math.round((subtotal - discount + shippingFee) * 100) / 100);

     return {
       itemCount,
       subtotal: Math.round(subtotal * 100) / 100,
       discount,
       shippingFee,
       totalAmount,
     };
   }, [cartItems]);
   ```

### 2.6 Kiểm thử lại & Hồi quy (Retest & Regression)
- **Thực hiện:** Thêm 0 sản phẩm, 1 sản phẩm, và 5 sản phẩm có giá số thập phân vào giỏ hàng. Thử tăng giảm số lượng và xóa từng món.
- **Kết quả:** Tổng tiền luôn tự động cập nhật chính xác tuyệt đối theo thời gian thực (ví dụ `$164.99`). Khi giỏ trống, tổng tiền lập tức về `$0.00`. Không bao giờ xảy ra lỗi nối chuỗi. **Pass 100%.**
