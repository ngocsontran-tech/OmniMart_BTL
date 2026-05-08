import { apiCall } from "./api";

/** Áp dụng voucher */
export const applyVoucher = (code, subtotal) =>
  apiCall("/vouchers/apply", { method: "POST", body: { code, subtotal } });

/** Lấy đánh giá sản phẩm */
export const getReviews = (productId) =>
  apiCall(`/reviews/${productId}`, { noAuth: true });

/** Gửi đánh giá */
export const submitReview = ({ product_id, order_id, rating, comment }) =>
  apiCall("/reviews", {
    method: "POST",
    body: { product_id, order_id, rating, comment },
  });
