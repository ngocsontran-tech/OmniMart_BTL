# Hướng dẫn Hiện đại hóa Giao diện OmniMart Web

Tài liệu này hướng dẫn bạn từng bước để xây dựng giao diện Web cho khách hàng (Customer-facing) dựa trên bản thiết kế mới, đồng bộ với phong cách Mobile App.

---

## 🏗 Bước 1: Cấu trúc lại Hệ thống Màu sắc và Style (Design Tokens)

Trước tiên, chúng ta cần định nghĩa lại các biến màu sắc chủ đạo trong `WebAdmin/src/index.css` để đảm bảo tính nhất quán:

```css
:root {
  --primary: #E36631;          /* Màu cam chủ đạo */
  --primary-light: #ff8b5c;
  --primary-dark: #b54a1d;
  --bg-white: #ffffff;
  --bg-dark: #0f172a;          /* Dùng cho các section đặc biệt */
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border-radius-lg: 25px;    /* Cho các nút chính */
  --border-radius-md: 15px;    /* Cho các ô input */
  --shadow-primary: 0 4px 6px -1px rgba(227, 102, 49, 0.4);
}
```

---

## 🔐 Bước 2: Đồng bộ hóa Giao diện Đăng ký (SignUp)

Dựa trên trang Đăng nhập đã làm, trang Đăng ký cần được cập nhật trong `src/pages/SignUp.jsx`:

1.  **Cấu trúc**: Sử dụng nền trắng (`--bg-white`), thẻ form ở trung tâm.
2.  **Logo**: Căn giữa logo OmniMart ở trên cùng.
3.  **Input**: Sử dụng viền cam 2px, bo góc 15px, có icon Lucide (User, Mail, Lock, Store) màu xám ở bên trái.
4.  **Chức năng**: Thêm checkbox "Register as a seller" để hiển thị thêm trường nhập tên cửa hàng.
5.  **Nút bấm**: Nút "Sign up" màu cam, bo góc 25px, font chữ đậm.

---

## 🏷️ Bước 3: Xây dựng Thanh Điều hướng (Navbar)

Tạo một component `Navbar.jsx` mới với phong cách hiện đại:

- **Bên trái**: Logo OmniMart.
- **Giữa**: Danh sách liên kết: `Home`, `Special Offers`, `Categories`, `Track Order`.
- **Bên phải**: Nút "Login/Signup" bo góc 25px, màu nền tối hoặc cam đậm.
- **Hiệu ứng**: `backdrop-filter: blur(10px)` để tạo cảm giác kính (glassmorphism) khi cuộn.

---

## 👟 Bước 4: Thiết kế Trang Danh sách Sản phẩm (Product Page)

Đây là phần quan trọng nhất trong hình ảnh thiết kế:

### 1. Banner Nổi bật (Hero Section)
- Sử dụng màu nền tối (`--bg-dark`).
- Hiển thị sản phẩm hot (ví dụ: Nike) kèm theo ảnh sản phẩm chất lượng cao ở bên phải.
- Nút CTA (Call to Action) như "Show details" hoặc "Shop now".

### 2. Bộ lọc Danh mục (Category Tabs)
- Thiết kế thanh tab nằm ngang dưới Banner.
- Các mục: `All`, `Sneakers`, `Tops & T-Shirts`, `Hoodies`, `Shorts`.
- Mục đang được chọn sẽ có nền cam và chữ trắng, bo góc tròn.

### 3. Ô tìm kiếm (Search Bar)
- Đặt ở phía bên phải thanh tab danh mục.
- Bo góc tròn, có icon kính lúp.

### 4. Lưới Sản phẩm (Product Grid)
- Mỗi thẻ sản phẩm (`ProductCard`) có nền trắng xám nhạt (`#f8fafc`).
- Bo góc nhẹ (12px).
- Hình ảnh sản phẩm chiếm 70% diện tích thẻ, tên và giá ở dưới cùng.

---

## 🗺️ Bước 5: Hoàn thiện Chân trang (Footer)

Thiết kế Footer chuyên nghiệp với nền xám nhạt (`#f1f5f9`):

- **Cột 1**: Logo "Order" và các nút tải app trên App Store/Play Store.
- **Cột 2**: Liên kết Điều khoản & Pháp lý (`Legal`).
- **Cột 3**: Liên kết Điều hướng (`Navigation`).
- **Cột 4**: Thông tin Quan trọng (`Important`).

---
> [!TIP]
> Bạn có muốn tôi bắt đầu triển khai **Trang Đăng ký (SignUp)** và **Thanh Điều hướng (Navbar)** ngay bây giờ để khớp với bản thiết kế này không?
## 📱 PHẦN 2: HIỆN ĐẠI HÓA GIAO DIỆN MOBILE APP (EXPO/REACT NATIVE)

Dựa trên bản thiết kế Figma, chúng ta sẽ cập nhật các component trong thư mục `BTL_PTTKHDT/OmniMart`.

---

### 🏗 Bước 6: Cấu hình Theme và Constants (`constants/Colors.ts`)
Thiết lập lại bảng màu để đồng bộ với Web:
```javascript
export const Colors = {
  primary: '#E36631',
  background: '#ffffff',
  text: '#1e293b',
  gray: '#64748b',
  lightGray: '#f8fafc',
  white: '#ffffff',
};
```

---

### 🏠 Bước 7: Cải thiện Trang chủ (Home.jsx)
1.  **Top Bar**: Hiển thị logo OmniMart bên trái, icon Tìm kiếm và Thông báo bên phải.
2.  **Hero Banner**: Sử dụng `View` với `backgroundColor: '#0f172a'`, bo góc 20px. Đặt ảnh sản phẩm nổi bật lồng ghép với text quảng cáo.
3.  **Category Scroll**: Sử dụng `FlatList` nằm ngang. Các tab như `All`, `Shoes`, `T-Shirts` sẽ có kiểu dáng "Pill" (bo tròn hoàn toàn). Tab active sẽ có nền cam.
4.  **Product Grid**: Cấu trúc lại `renderItem` của `FlatList` để mỗi card sản phẩm có:
    - Nền trắng, đổ bóng nhẹ (`elevation: 3`).
    - Ảnh sản phẩm lớn ở trên.
    - Nút "Add to cart" nhỏ hình tròn màu cam ở góc dưới.

---

### 👟 Bước 8: Trang Chi tiết Sản phẩm (Item.jsx)
1.  **Gallery**: Sử dụng `ScrollView` ngang hoặc `PagerView` để hiển thị ảnh sản phẩm lớn.
2.  **Price**: Hiển thị giá nổi bật với màu cam, font chữ đậm.
3.  **Size Selection**: Thiết kế danh sách các ô chọn size (38, 39, 40...) bo góc 10px. Ô được chọn sẽ có viền cam.
4.  **Sticky Bottom**: Nút "Buy Now" (hoặc biểu tượng giỏ hàng + nút Mua) luôn cố định ở dưới cùng màn hình với nền cam.

---

### 🛒 Bước 9: Giỏ hàng & Thanh toán (Cart.jsx & Checkout.jsx)
1.  **Cart Items**: Mỗi item có nút tăng/giảm số lượng thiết kế tối giản.
2.  **Checkout Form**: Các ô nhập địa chỉ, số điện thoại sử dụng style `borderWidth: 1`, `borderColor: '#ddd'`, `borderRadius: 12`.
3.  **Payment Methods**: Thiết kế các thẻ chọn phương thức thanh toán (Visa, PayPal...) có logo trực quan.

---

### 👤 Bước 10: Trang Cá nhân (Profile.jsx)
1.  **Avatar Section**: Căn giữa ảnh đại diện lớn với viền cam mỏng.
2.  **Menu List**: Các mục như "My Orders", "Help & Support", "Logout" sử dụng `Ionicons` ở bên trái và icon `chevron-forward` ở bên phải để tạo cảm giác chuyên nghiệp.

---

## ✅ Danh sách kiểm tra cuối cùng (Final Checklist)
- [ ] Đảm bảo tất cả các nút bấm có `borderRadius: 25` (kiểu Capsule).
- [ ] Tất cả các ô nhập liệu (TextInput) có `borderRadius: 15`.
- [ ] Sử dụng bóng đổ (Shadow/Elevation) đồng nhất cho các thẻ Card.
- [ ] Kiểm tra hiển thị tốt trên cả iOS và Android (Expo).
