import { Platform } from "react-native";

let API_URL = "http://localhost:3000";

if (Platform.OS === "android") {
  API_URL = "http://10.0.2.2:3000"; // emulator
}
else if (Platform.OS === "ios") {
  API_URL = "http://192.168.1.47:3000";
  console.log("Đây là IOSSSS")
}
// nếu chạy trên máy thật
// API_URL = "http://192.168.1.47:3000";

export default API_URL;
