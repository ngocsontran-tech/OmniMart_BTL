# Phát triển hệ thống Sàn thương mại điện tử Thời trang OmniMart: Thiết kế kiến trúc đa nền tảng và triển khai mô hình quản trị đa vai trò

## 📝 Giới thiệu Đề tài
Đây là dự án BTL chuyên ngành **Công nghệ phần mềm**. Hệ thống tập trung vào giải pháp thương mại điện tử chuyên biệt cho ngành **Thời trang** (Quần áo, Giày dép, Phụ kiện), giải quyết các bài toán về quản lý biến thể sản phẩm (Size, Màu sắc) và phân quyền quản trị đa cấp.

Hệ thống bao gồm một hệ sinh thái hoàn chỉnh: **Backend API**, **Ứng dụng Di động (Khách hàng & Người bán)** và **Trang quản trị Web (Admin hệ thống)**.

---

## 🏗️ Kiến trúc Hệ thống
Dự án được xây dựng theo mô hình Client-Server với các thành phần:

1.  **Backend Service (`MobileApp/backend`)**: 
    *   **Công nghệ**: Node.js & Express.
    *   **Nhiệm vụ**: Cung cấp RESTful API, quản lý logic nghiệp vụ thời trang, xác thực JWT và kết nối Supabase (PostgreSQL).
    *   **Đặc điểm**: Kiến trúc modular, xử lý phân quyền đa vai trò (Customer, Seller, Admin).

2.  **Mobile App (`MobileApp/OmniMart`)**:
    *   **Công nghệ**: React Native (Expo).
    *   **Đối tượng**: 
        *   *Khách hàng*: Duyệt đồ thời trang theo category, chọn size/màu, đặt hàng, chat realtime.
        *   *Người bán (Seller)*: Quản lý gian hàng, đăng sản phẩm thời trang, xử lý đơn hàng.
    *   **Giao diện**: Tối ưu trải nghiệm mobile, mượt mà và hiện đại.

3.  **Web Admin DashBoard (`WebAdmin`)**:
    *   **Công nghệ**: React, Vite, Framer Motion.
    *   **Đối tượng**: Quản trị viên hệ thống (Admin).
    *   **Nhiệm vụ**: Quản lý danh mục thời trang, kiểm soát người dùng/shop, thống kê doanh thu toàn sàn bằng biểu đồ trực quan.

---

## ✨ Tính năng Đặc thù ngành Thời trang
*   **Product Variants**: Hỗ trợ quản lý sản phẩm theo nhiều thuộc tính (Size giày 38-44, Màu sắc, Chất liệu).
*   **Real-time Chat**: Tích hợp kênh trao đổi trực tiếp giữa người mua và chủ shop thời trang.
*   **Voucher & Promotion**: Hệ thống mã giảm giá giúp kích cầu mua sắm.
*   **Phân quyền (RBAC)**: Cơ chế kiểm soát truy cập nghiêm ngặt dựa trên vai trò của người dùng.

---

## 🛠️ Stack Công nghệ
*   **Frontend**: React, Vite, Framer Motion, Lucide Icons, Recharts.
*   **Mobile**: React Native, Expo, React Navigation, Gifted Chat.
*   **Backend**: Node.js, Express, Supabase SDK, Bcrypt, JWT.
*   **Cơ sở dữ liệu**: PostgreSQL (Supabase).

---

## 🚀 Hướng dẫn Triển khai

### 1. Khởi động Backend
```bash
cd MobileApp/backend
npm install
npm run dev
```
*Cổng mặc định: `http://localhost:3000`*

### 2. Khởi động Web Admin
```bash
cd WebAdmin
npm install
npm run dev
```
*Cổng mặc định: `http://localhost:5173`*

### 3. Khởi động Mobile App
```bash
cd MobileApp/OmniMart
npm install
npx expo start
```
*Dùng Expo Go trên điện thoại để quét mã QR.*

---

## 🔐 Thông tin Đăng nhập Quản trị
*   **Tài khoản Admin**: `dang@gmail.com`
*   **Mật khẩu**: `123456`

---
*Dự án được thực hiện cho học phần Công nghệ phần mềm © 2026 OmniMart Team.*
