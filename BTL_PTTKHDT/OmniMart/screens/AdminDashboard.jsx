// screens/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "expo-router";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const [statsRes, reqRes] = await Promise.all([
        fetch(`${API_URL}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/password-requests`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const statsData = await statsRes.json();
      const reqData = await reqRes.json();

      setStats(statsData);
      setRequests(reqData);
    } catch (err) {
      Alert.alert("Lỗi", "Không tải được dữ liệu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      await AsyncStorage.removeItem("token");
      if (navigation.replace) {
        navigation.replace("Login");
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    };

    if (Platform.OS === "web") {
      const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
      if (confirm) {
        await doLogout();
      }
    } else {
      Alert.alert(
        "Xác nhận đăng xuất",
        "Bạn có chắc chắn muốn đăng xuất không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng xuất",
            style: "destructive",
            onPress: async () => {
              await doLogout();
            },
          },
        ]
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcess = (id, email) => {
    Alert.alert(
      "Cấp lại mật khẩu",
      `Bạn có chắc muốn cấp mật khẩu mới cho:\n${email}\n\nMật khẩu mới sẽ là: 123456\n(User nên đổi ngay sau khi đăng nhập)`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Cấp ngay",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await fetch(`${API_URL}/admin/password-requests/${id}/process`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();

              if (res.ok) {
                Alert.alert(
                  "Thành công!",
                  `Đã cấp mật khẩu mới: 123456\n\nVui lòng gửi ngay cho người dùng qua Zalo/Email/Fanpage.\nHướng dẫn họ đổi mật khẩu trong phần Hồ sơ.`,
                  [{ text: "OK", onPress: fetchData }]
                );
              } else {
                Alert.alert("Lỗi", data.message || "Không thể xử lý");
              }
            } catch (err) {
              Alert.alert("Lỗi", "Không thể kết nối server");
            }
          },
        },
      ]
    );
  };

  const handleDelete = (id, email) => {
    Alert.alert(
      "Xóa yêu cầu",
      `Xóa yêu cầu từ ${email}?\nHành động này không thể hoàn tác.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await fetch(`${API_URL}/admin/password-requests/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });

              if (res.ok) {
                Alert.alert("Thành công", "Đã xóa yêu cầu", [{ text: "OK", onPress: fetchData }]);
              } else {
                Alert.alert("Lỗi", "Không thể xóa");
              }
            } catch (err) {
              Alert.alert("Lỗi", "Không thể kết nối");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#E36631" />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: "#E36631" }}>
          Admin Dashboard
        </Text>

        {/* Nút Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "#f44336",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Thống kê nhanh */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 30 }}>
          {[
            { label: "Tổng người dùng", value: stats?.totalUsers || 0 },
            { label: "Seller", value: stats?.totalSellers || 0 },
            { label: "Sản phẩm", value: stats?.totalProducts || 0 },
            { label: "Đơn hàng", value: stats?.totalOrders || 0 },
            { label: "Doanh thu hôm nay", value: `${(stats?.todayRevenue || 0).toLocaleString()}₫` },
            { label: "Tổng doanh thu", value: `${(stats?.totalRevenue || 0).toLocaleString()}₫` },
            { 
              label: "Doanh thu sàn (5%)", 
              value: `${(stats?.platformRevenue || 0).toLocaleString()}₫`,
              color: "#4CAF50" 
            },
          ].map((item, index) => (
            <View 
              key={index} 
              style={{ 
                backgroundColor: item.color || "#E36631", 
                padding: 15, 
                borderRadius: 12, 
                width: "48%", 
                marginBottom: 10 
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14 }}>{item.label}</Text>
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 5 }}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#E36631" }}>
          Lối tắt
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 30 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("AdminCategories")}
            style={{
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 12,
              flex: 1,
              marginRight: 10,
              alignItems: "center",
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 24, marginBottom: 5 }}>📁</Text>
            <Text style={{ fontWeight: "bold", color: "#333", textAlign: "center" }}>Quản lý Danh mục</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("AdminShops")}
            style={{
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 12,
              flex: 1,
              marginLeft: 10,
              alignItems: "center",
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 24, marginBottom: 5 }}>🏪</Text>
            <Text style={{ fontWeight: "bold", color: "#333", textAlign: "center" }}>Quản lý Cửa hàng</Text>
          </TouchableOpacity>
        </View>

        {/* Danh sách yêu cầu quên mật khẩu */}
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#E36631" }}>
          Yêu cầu quên mật khẩu ({requests.filter(r => r.status === "pending").length})
        </Text>

        {requests.length === 0 ? (
          <Text style={{ textAlign: "center", color: "#888", fontStyle: "italic", marginVertical: 30 }}>
            Chưa có yêu cầu nào
          </Text>
        ) : (
          requests.map((req) => (
            <View
              key={req.id}
              style={{
                backgroundColor: req.status === "pending" ? "#fffbe6" : "#f0fff0",
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: req.status === "pending" ? "#ffecb3" : "#c8e6c9",
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 16 }}>Email: {req.email}</Text>
              <Text>Họ tên: {req.full_name}</Text>
              <Text>SĐT: {req.phone}</Text>
              {req.users && (
                <Text style={{ color: "#E36631", fontWeight: "600", marginTop: 4 }}>
                  → DB: {req.users.name || "?"} - {req.users.phone || "?"}
                </Text>
              )}
              <Text style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                Thời gian: {new Date(req.requested_at).toLocaleString("vi-VN")}
              </Text>

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
                {req.status === "pending" ? (
                  <>
                    <TouchableOpacity
                      onPress={() => handleProcess(req.id, req.email)}
                      style={{ backgroundColor: "#E36631", padding: 10, borderRadius: 8, flex: 1, marginRight: 8 }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>
                        Cấp mật khẩu 123456
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(req.id, req.email)}
                      style={{ backgroundColor: "#f44336", padding: 10, borderRadius: 8, flex: 1, marginLeft: 8 }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>
                        Xóa yêu cầu
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={{ color: "#4caf50", fontWeight: "bold", fontSize: 16 }}>
                    Đã xử lý
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AdminDashboard;