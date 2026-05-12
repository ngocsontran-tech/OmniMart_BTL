import { apiCall } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Đăng nhập */
export const login = async (email, password) => {
  const data = await apiCall("/auth/login", {
    method: "POST",
    body: { email, password },
    noAuth: true,
  });

  // Lưu token + user vào storage
  await AsyncStorage.setItem("token", data.token);
  await AsyncStorage.setItem("user", JSON.stringify(data.user));

  return data;
};

/** Đăng ký */
export const register = async ({ email, password, name, is_seller, shop_name }) => {
  return apiCall("/auth/register", {
    method: "POST",
    body: { email, password, name, is_seller, shop_name },
    noAuth: true,
  });
};

/** Quên mật khẩu */
export const forgotPassword = async ({ email, fullName, phone }) => {
  return apiCall("/auth/forgot-password", {
    method: "POST",
    body: { email, fullName, phone },
    noAuth: true,
  });
};

/** Đăng xuất */
export const logout = async () => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
  await AsyncStorage.removeItem("applied_voucher");
};
