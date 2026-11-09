# AI USAGE & ENGINEERING PRACTICE LOG

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** 02 – Integrated E-Commerce Mobile App  
**Sinh viên:** Trần Minh Quân (CE181730)  
**Tiêu chí đánh giá:** AI Usage & Engineering Practice (Mục 8 Rubric: 0.5 / 0.5 điểm)  

---

## 1. Nhật Ký Sử Dụng AI Có Kiểm Soát (AI Usage Log - Mục 9.4)

| # | Nhiệm vụ / Prompt / Reference | Mục đích | Output dùng được? | Tôi đã chỉnh sửa & thích ứng những gì? | Cách tôi kiểm chứng kết quả? |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | *"Thiết kế prompt và hàm kiểm chứng chống ảo giác (Anti-Hallucination) cho Gemini 1.5 Flash khi tư vấn sản phẩm từ mảng catalog."* | Nhận diện và lọc các mã ID sản phẩm không tồn tại trong kho hàng do mô hình tự bịa. | Dùng phần logic JSON parsing và regex. | Bổ sung hàm `validateAndMatchOutput()`: kiểm tra từng `recommendedProductIds` khớp với `catalogProducts.find(p => p.id === id)`. Nếu không khớp, loại bỏ và thêm cảnh báo vào `validationMessage`. Thêm cơ chế Fallback tìm theo từ khóa. | Chạy kịch bản test truyền ID giả lập `[99999, 88888]`. Kết quả: Mảng sản phẩm trả về lọc sạch ID giả, hiển thị thông báo an toàn đúng yêu cầu. |
| **2** | *"Tối ưu FlatList cuộn vô tận tránh duplicate request khi chạm onEndReached."* | Tìm nguyên nhân và cách khắc phục lỗi spam request khi cuộn nhanh. | Dùng gợi ý về cờ guard đa tầng. | Không chỉ kiểm tra `!loading`, tôi bổ sung thêm 3 điều kiện: `isFetchingMore`, `!hasMore`, và `products.length >= total`. Đồng thời dùng `new Set(prev.map(p => p.id))` để lọc trùng lặp key tuyệt đối. | Mở tab Network console, cuộn liên tục xuống đáy trang. Kết quả: Mỗi lần cuộn chỉ gửi duy nhất 1 request, không có request dư thừa hay cảnh báo duplicate key. |
| **3** | *"Viết hàm tính toán Derived Totals cho giỏ hàng đảm bảo không bị sai số dấu phẩy động và nối chuỗi."* | Khắc phục lỗi số thực IEEE 754 và tránh dùng `useState` riêng cho tổng tiền gây lệch state. | Dùng cấu trúc `useMemo` tính toán tổng từ mảng `cartItems`. | Bổ sung ép kiểu tường minh `Number(price)`, làm tròn chuẩn `Math.round(total * 100) / 100`, thêm quy tắc giảm giá 10% cho đơn từ $100 và miễn phí ship trên $150. | Kiểm thử tính toán với các trường hợp giỏ hàng: 0 sản phẩm, 1 sản phẩm lẻ ($19.99), và nhiều sản phẩm lớn. Kết quả ra đúng `$0.00` và số tiền chính xác từng cent. |
| **4** | *"Gợi ý kiến trúc tích hợp Firebase Firestore cho nghiệp vụ lưu đơn hàng với phương án dự phòng khi mất kết nối (Offline Resilient)."* | Đảm bảo ứng dụng không bao giờ bị crash khi không có internet hoặc khi chưa gắn Firebase key. | Dùng cấu trúc gọi REST API của Firestore. | Đóng gói toàn bộ trong `firebaseService.js`: kiểm tra `isConfigured()`. Nếu có lỗi hoặc ngoại tuyến, tự động lưu vào `storageService` (AsyncStorage) và trả về cờ `isOffline: true`. | Thử tắt WiFi và tiến hành Checkout. Kết quả: Đơn hàng vẫn được tạo thành công, lưu vào bộ nhớ cục bộ, chuyển sang màn hình thành công mượt mà không văng lỗi. |

---

## 2. Quy Trình 6 Bước: AI → Verify → Adopt (Mục 9.3)
1. **Ask:** Đặt câu hỏi kỹ thuật cụ thể, tập trung vào nguyên lý và giải thuật (ví dụ: cách chống ảo giác cho AI, cách ngăn duplicate request).
2. **Inspect:** Đọc kỹ output do AI sinh ra, phân tích các rủi ro tiềm ẩn (bị crash nếu thiếu mạng, không tương thích React 19 / Expo 57).
3. **Adapt:** Điều chỉnh mã nguồn cho phù hợp với cấu trúc project của đề bài: thêm comment tiếng Việt, chuẩn hóa biến và xử lý lỗi chặt chẽ.
4. **Run:** Chạy thử trực tiếp trên môi trường máy ảo / Expo và kiểm tra bằng các test cases cụ thể.
5. **Explain:** Tự giải thích lại toàn bộ luồng hoạt động (Data flow, Event triggers, Transform, Output).
6. **Record:** Ghi lại nhật ký minh bạch, sẵn sàng bảo vệ trong buổi vấn đáp.

---

## 3. Bản Tự Xác Nhận Trung Thực Học Thuật (Final Self-Declaration - Mục 12.6)

> **Sinh viên tự xác nhận:**  
> *"Tôi đã tự kiểm tra assignment, có thể giải thích các phần chính, có thể phân tích/sửa một thay đổi nhỏ và chịu trách nhiệm với mọi code, tài nguyên và AI output tôi sử dụng."*
>  
> **Ký tên:**  
> Trần Minh Quân – MSSV: CE181730  
> Ngày: 09/11/2026  

