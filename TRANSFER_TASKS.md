# MODIFICATION / TRANSFER TASK PLAYBOOK

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** 02 – Integrated E-Commerce Mobile App  
**Sinh viên:** Trần Minh Quân (CE181730)  
**Mục tiêu:** Sẵn sàng xử lý các yêu cầu thay đổi (Change Requests) trực tiếp từ Giảng viên trong buổi vấn đáp (Tiêu chí Mục 7 Rubric: 1.0 / 1.0 điểm).

---

## 1. Bảng Phân Tích Tác Động (Impact Analysis Worksheet - Mục 8.4)

| Change Request (Yêu cầu thay đổi) | Screen / Component bị ảnh hưởng | State / Data bị ảnh hưởng | Service / Storage bị ảnh hưởng | UI / Permission thay đổi | Tests cần thêm / sửa |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CR1: Thêm Sắp xếp theo Price / Rating (Sort)** | `ProductListScreen.js` | Thêm state `sortBy` (`none`, `price-asc`, `price-desc`, `rating`). `displayedProducts` memoized. | Không tác động tầng Service (sắp xếp ở Client). | Thêm nút biểu tượng Phễu lọc/Sort trên thanh Search bar. | Test sắp xếp tăng dần giá, giảm dần giá và theo điểm đánh giá. |
| **CR2: Thêm Field Ghi Chú (Note) cho Cart Item** | `CartItemCard.js`<br>`CartScreen.js` | Mảng `cartItems`: thêm trường `{ note: string }`. Thêm action `updateItemNote`. | `storageService.js` tự động lưu trữ cấu trúc object mới vào AsyncStorage. | Thêm ô nhập TextInput nhỏ và icon cây bút ở từng dòng sản phẩm giỏ hàng. | Test nhập ghi chú, lưu ghi chú, reload app kiểm tra ghi chú còn không. |
| **CR3: Thêm Nút Thử Lại (Retry Button) cho API Error** | `ErrorView.js`<br>`ProductListScreen.js` | `error: string \| null`, `loading: boolean`. | `productApi.js`<br>`ProductContext.js` (gọi hàm `retry()`). | Hiển thị nút "Thử lại ngay" với icon refresh khi mạng lỗi. | Test ngắt mạng -> hiện nút retry -> bật mạng -> bấm nút -> dữ liệu tải lại. |
| **CR4: Đổi Gemini sang So Sánh Sản Phẩm (Product Comparison)** | `AIScreen.js`<br>`ProductDetailScreen.js` | `result: { advice, comparisonTable, validatedProducts }`. | `geminiService.js` (thay đổi prompt yêu cầu so sánh 2 sản phẩm). | Thêm nút "So sánh sản phẩm tương đương" tại ProductDetail. | Test truyền 2 ID sản phẩm vào prompt, kiểm tra bảng ưu/nhược điểm trả về. |
| **CR5: Thêm Thông Báo Khi Thêm/Xóa Mục Yêu Thích** | `WishlistContext.js`<br>`ProductCard.js` | `wishlist: Array` | `notificationService.js` (gọi hàm `sendNotification`). | Bắn toast banner khi bấm tim yêu thích sản phẩm. | Test bấm tim -> banner xuất hiện thông báo: "Đã thêm vào yêu thích". |

---

## 2. Mã Nguồn Mẫu Đã Kiểm Thử Sẵn Sàng Triển Khai (Ready-to-Use Snippets)

### Bài luyện 1: Thêm Sort theo Price/Rating (Đã tích hợp sẵn trong `ProductListScreen.js`)
```javascript
// Khai báo state
const [sortBy, setSortBy] = useState('none'); // 'none' | 'price-asc' | 'price-desc' | 'rating'

// Logic sắp xếp tự động qua useMemo
const displayedProducts = useMemo(() => {
  if (!products) return [];
  let list = [...products];
  if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
  return list;
}, [products, sortBy]);
```

### Bài luyện 2: Thêm field note cho cart item (Đã tích hợp sẵn trong `CartContext.js` & `CartItemCard.js`)
```javascript
// Thêm action vào CartContext.js
const updateItemNote = useCallback((productId, note) => {
  setCartItems((prev) =>
    prev.map((item) => (item.product.id === productId ? { ...item, note } : item))
  );
}, []);
```

### Bài luyện 3: Thêm thông báo khi yêu thích sản phẩm
```javascript
// Trong src/context/WishlistContext.js
const toggleWishlist = useCallback(async (product) => {
  setWishlist((prev) => {
    const exists = prev.some((item) => item.id === product.id);
    const updated = exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
    
    // Gửi thông báo sự kiện
    notificationService.sendNotification({
      title: exists ? 'Đã bỏ yêu thích' : '❤️ Đã lưu vào yêu thích',
      body: `Sản phẩm "${product.title}" đã được ${exists ? 'xóa khỏi' : 'thêm vào'} danh sách yêu thích của bạn.`,
      type: 'wishlist',
    });

    return updated;
  });
}, []);
```
