import { apiCall, apiUpload } from "./api";

/** Lấy profile */
export const getProfile = () => apiCall("/user/profile");

/** Cập nhật profile */
export const updateProfile = ({ name, phone, avatar }) =>
  apiCall("/user/profile", {
    method: "PUT",
    body: { name, phone, avatar },
  });

/** Upload avatar */
export const uploadAvatar = (formData) => apiUpload("/user/upload-avatar", formData);
