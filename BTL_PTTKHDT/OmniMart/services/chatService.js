import { apiCall } from "./api";

/** Lấy lịch sử tin nhắn theo sản phẩm */
export const getMessages = (productId) => apiCall(`/chat/messages/${productId}`);

/** Gửi tin nhắn */
export const sendMessage = (product_id, message) =>
  apiCall("/chat/send", { method: "POST", body: { product_id, message } });

/** Danh sách chat (tất cả cuộc hội thoại) */
export const getChatList = () => apiCall("/chat/list");
