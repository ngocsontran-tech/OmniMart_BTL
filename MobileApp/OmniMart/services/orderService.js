import { apiCall } from "./api";

/** Danh sách đơn hàng (customer) */
export const getOrders = () => apiCall("/orders");

/** Chi tiết đơn hàng */
export const getOrderDetail = (orderId) => apiCall(`/orders/${orderId}`);

/** Hoàn thành đơn hàng (customer xác nhận nhận hàng) */
export const completeOrder = (orderId) =>
  apiCall(`/orders/${orderId}/complete`, { method: "POST" });

/** Hủy đơn hàng */
export const cancelOrder = (orderId) =>
  apiCall(`/orders/${orderId}/status`, {
    method: "PUT",
    body: { status: "cancelled" },
  });

/** Thanh toán (checkout) */
export const checkout = (address_id, payment_method = "cod") =>
  apiCall("/checkout", {
    method: "POST",
    body: { address_id, payment_method },
  });

/** Lấy danh sách địa chỉ */
export const getAddresses = () => apiCall("/addresses");

/** Thêm địa chỉ */
export const addAddress = ({ full_name, phone, address, is_default }) =>
  apiCall("/addresses", {
    method: "POST",
    body: { full_name, phone, address, is_default },
  });
