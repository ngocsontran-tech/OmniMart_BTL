import { apiCall, apiUpload } from "./api";

/** Lấy thông tin shop */
export const getShop = () => apiCall("/seller/shop");

/** Cập nhật shop */
export const updateShop = ({ name, description, logo }) =>
  apiCall("/seller/shop", { method: "PUT", body: { name, description, logo } });

/** Đăng ký làm seller */
export const registerSeller = ({ name, description, logo }) =>
  apiCall("/seller/register", { method: "POST", body: { name, description, logo } });

/** Danh sách sản phẩm của seller */
export const getSellerProducts = () => apiCall("/seller/products");

/** Thêm sản phẩm */
export const addProduct = (product) =>
  apiCall("/seller/products", { method: "POST", body: product });

/** Cập nhật sản phẩm */
export const updateProduct = (id, product) =>
  apiCall(`/seller/products/${id}`, { method: "PUT", body: product });

/** Xóa sản phẩm */
export const deleteProduct = (id) =>
  apiCall(`/seller/products/${id}`, { method: "DELETE" });

/** Thêm biến thể */
export const addVariant = (productId, variant) =>
  apiCall(`/seller/products/${productId}/variants`, { method: "POST", body: variant });

/** Cập nhật biến thể */
export const updateVariant = (variantId, variant) =>
  apiCall(`/seller/variants/${variantId}`, { method: "PUT", body: variant });

/** Xóa biến thể */
export const deleteVariant = (variantId) =>
  apiCall(`/seller/variants/${variantId}`, { method: "DELETE" });

/** Danh sách đơn hàng của seller */
export const getSellerOrders = () => apiCall("/seller/orders");

/** Cập nhật trạng thái đơn hàng (shipped/cancelled) */
export const updateOrderStatus = (orderId, status) =>
  apiCall(`/seller/orders/${orderId}/status`, { method: "PUT", body: { status } });

/** Upload ảnh sản phẩm */
export const uploadProductImage = (formData) => apiUpload("/upload", formData);
