# OmniMart - Hệ thống Thương mại Điện tử Full Stack

Dự án BTL môn Phân tích Thiết kế Hệ thống - Một giải pháp thương mại điện tử toàn diện bao gồm Backend, Ứng dụng Di động cho khách hàng và Trang quản trị Web cho người quản lý.

## 🏗️ Cấu trúc Dự án

Dự án được chia thành 3 phần chính:

1.  **Backend (`BTL_PTTKHDT/backend`)**: 
    *   Sử dụng Node.js & Express.
    *   Kiến trúc MVC modular, dễ bảo trì.
    *   Kết nối cơ sở dữ liệu Supabase.
    *   Quản lý xác thực qua JWT.

2.  **Mobile App (`BTL_PTTKHDT/OmniMart`)**:
    *   Phát triển trên nền tảng React Native (Expo).
    *   Dành cho khách hàng: Duyệt sản phẩm, đặt hàng, chat với người bán, quản lý voucher.
    *   Giao diện hiện đại, tối ưu trải nghiệm người dùng.

3.  **Web Admin (`WebAdmin`)**:
    *   Xây dựng bằng React + Vite.
    *   Dành cho quản trị viên hệ thống: Quản lý người dùng, duyệt sản phẩm, theo dõi đơn hàng và tạo mã giảm giá.
    *   Thiết kế cao cấp, biểu đồ thống kê trực quan (Recharts).

## 🛠️ Công nghệ Sử dụng

*   **Frontend Web**: React, Vite, Framer Motion, Lucide Icons, Recharts.
*   **Mobile**: React Native, Expo, React Navigation, Gifted Chat.
*   **Backend**: Node.js, Express, Supabase SDK, Bcrypt, JWT.
*   **Database**: PostgreSQL (via Supabase).

## 🚀 Hướng dẫn Chạy Dự án

### 1. Chạy Backend
```bash
cd BTL_PTTKHDT/backend
npm install
npm run dev
```
Server sẽ chạy tại: `http://localhost:3000`

### 2. Chạy Web Admin
```bash
cd WebAdmin
npm install
npm run dev
```
Truy cập tại: `http://localhost:5173`

### 3. Chạy Mobile App
```bash
cd BTL_PTTKHDT/OmniMart
npm install
npx expo start
```

## 🔐 Thông tin Đăng nhập (Admin)
*   **Email**: `dang@gmail.com`
*   **Mật khẩu**: `123456` (Nếu đã được reset)

## ✨ Tính năng Nổi bật
*   **Realtime Chat**: Trao đổi giữa người mua và người bán.
*   **Voucher System**: Áp dụng mã giảm giá linh hoạt.
*   **Analytics Dashboard**: Thống kê doanh thu và hoạt động hệ thống cho Admin.
*   **Responsive UI**: Hoạt động tốt trên cả điện thoại và trình duyệt máy tính.

---
Bản quyền © 2026 OmniMart Team.
