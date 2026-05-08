import { apiCall } from "./api";

/** Lấy dữ liệu trang chủ (categories + products + featured) */
export const getHome = () => apiCall("/home", { noAuth: true });

/** Danh sách sản phẩm (có filter) */
export const getProducts = (params = {}) => {
  const query = new URLSearchParams();
  if (params.category_id) query.append("category_id", params.category_id);
  if (params.search) query.append("search", params.search);
  if (params.sort) query.append("sort", params.sort);

  const qs = query.toString();
  return apiCall(`/products${qs ? `?${qs}` : ""}`, { noAuth: true });
};

/** Chi tiết sản phẩm */
export const getProductDetail = (id) => apiCall(`/products/${id}`, { noAuth: true });
