import { Platform } from "react-native";

// IP của máy tính chạy Backend (Dùng chung cho cả Android và iOS máy thật)
const MY_IP = "192.168.1.68"; 

const API_URL = `http://${MY_IP}:3000`;

export default API_URL;
