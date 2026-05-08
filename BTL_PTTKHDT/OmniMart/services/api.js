/**
 * API Client tập trung - Tự động gắn JWT token vào mọi request.
 * Tất cả các screen chỉ cần import hàm từ đây thay vì viết fetch + token rải rác.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../config/api";

/**
 * Gọi API với token tự động.
 * @param {string} endpoint - Đường dẫn API (vd: "/user/profile")
 * @param {object} options - { method, body, headers, noAuth }
 * @returns {Promise<any>} - JSON response
 */
const apiCall = async (endpoint, options = {}) => {
  const { method = "GET", body, headers = {}, noAuth = false } = options;

  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Tự động gắn token nếu không phải noAuth
  if (!noAuth) {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Lỗi server");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

/**
 * Upload file (multipart/form-data) - Dùng cho ảnh sản phẩm, avatar.
 * @param {string} endpoint - Đường dẫn API (vd: "/upload")
 * @param {FormData} formData - FormData chứa file
 * @returns {Promise<any>}
 */
const apiUpload = async (endpoint, formData) => {
  const token = await AsyncStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Không set Content-Type, để browser/RN tự thêm boundary
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Upload thất bại");
    error.status = res.status;
    throw error;
  }

  return data;
};

export { apiCall, apiUpload };
export default apiCall;
