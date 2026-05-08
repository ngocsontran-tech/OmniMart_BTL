// screens/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const statusColors = {
  pending: "#FF9800",
  paid: "#2196F3",
  shipped: "#9C27B0",
  completed: "#4CAF50",
  cancelled: "#F44336",
};

const statusText = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  shipped: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={{
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 2,
      }}
      onPress={() => {
        // Có thể navigate sang chi tiết đơn hàng sau
        Alert.alert("Chi tiết đơn", `ID: ${item.id}\nTổng: ${item.total_price.toLocaleString()}₫`);
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontWeight: "bold" }}>Đơn hàng #{item.id}</Text>
        <Text style={{ color: "#555" }}>
          {new Date(item.created_at).toLocaleDateString("vi-VN")}
        </Text>
      </View>

      <Text style={{ marginVertical: 8 }}>
        Khách: {item.users?.name || "Không rõ"} ({item.users?.email})
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#E36631" }}>
          {item.total_price.toLocaleString()}₫
        </Text>
        <View
          style={{
            backgroundColor: statusColors[item.status],
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            {statusText[item.status] || item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#E36631" }}>
        Quản lý Đơn hàng
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#E36631" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrder}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 50, color: "#999" }}>
              Không có đơn hàng nào
            </Text>
          }
        />
      )}
    </ScreenWrapper>
  );
};

export default AdminOrders;