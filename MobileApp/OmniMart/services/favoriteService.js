import { apiCall } from "./api";

/** Kiểm tra sản phẩm có trong danh sách yêu thích không */
export const checkFavorite = (productId) => apiCall(`/favorites/${productId}`);

/** Toggle yêu thích */
export const toggleFavorite = (product_id) =>
  apiCall("/favorites/toggle", { method: "POST", body: { product_id } });

/** Danh sách yêu thích */
export const getFavorites = () => apiCall("/favorites");
