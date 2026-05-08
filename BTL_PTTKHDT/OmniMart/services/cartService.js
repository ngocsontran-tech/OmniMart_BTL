import { apiCall } from "./api";

/** Lấy giỏ hàng */
export const getCart = () => apiCall("/cart");

/** Thêm vào giỏ hàng */
export const addToCart = (variant_id, quantity) =>
  apiCall("/cart", { method: "POST", body: { variant_id, quantity } });

/** Cập nhật số lượng */
export const updateCartItem = (cartId, quantity) =>
  apiCall(`/cart/${cartId}`, { method: "PUT", body: { quantity } });

/** Xóa khỏi giỏ hàng */
export const removeCartItem = (cartId) =>
  apiCall(`/cart/${cartId}`, { method: "DELETE" });
