import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const CustomerOrders = () => {
  const navigation = useNavigation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.replace("Login");
        return;
      }

      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const error = await res.json();
        Alert.alert("Lỗi", error.message || "Không thể tải đơn hàng");
        return;
      }

      const data = await res.json();
      // Sắp xếp mới nhất trước
      const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sorted);
    } catch (err) {
      Alert.alert("Lỗi kết nối", "Vui lòng kiểm tra mạng và thử lại");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      "Hủy đơn hàng",
      "Bạn có chắc chắn muốn hủy đơn hàng này?\nHành động này không thể hoàn tác.",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "cancelled" }),
              });

              if (res.ok) {
                Alert.alert("Thành công", "Đơn hàng đã được hủy");
                fetchOrders(); // Refresh lại danh sách
              } else {
                const err = await res.json();
                Alert.alert("Lỗi", err.message || "Không thể hủy đơn");
              }
            } catch (err) {
              Alert.alert("Lỗi", "Không thể kết nối server");
            }
          },
        },
      ]
    );
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return { text: "Chờ xác nhận", color: "#FF9800" };
      case "paid": return { text: "Đã thanh toán", color: "#4CAF50" };
      case "shipped": return { text: "Đang giao", color: "#2196F3" };
      case "completed": return { text: "Hoàn thành", color: "#4CAF50" };
      case "cancelled": return { text: "Đã hủy", color: "#F44336" };
      default: return { text: status || "Không rõ", color: "#999" };
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#E36631" />
          <Text style={{ marginTop: 10, color: "#666" }}>Đang tải đơn hàng...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#fff", elevation: 3 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: "center", fontSize: 20, fontWeight: "bold" }}>
          Đơn hàng của tôi
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {orders.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 80 }}>
            <Ionicons name="receipt-outline" size={100} color="#ccc" />
            <Text style={{ marginTop: 20, fontSize: 18, color: "#999" }}>
              Bạn chưa có đơn hàng nào
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const statusInfo = getStatusText(order.status);

            return (
              <View
                key={order.id}
                style={{
                  backgroundColor: "#fff",
                  marginHorizontal: 15,
                  marginTop: 15,
                  padding: 15,
                  borderRadius: 12,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: "#eee",
                }}
              >
                {/* Header đơn hàng */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                  <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                    Đơn hàng #{order.id}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#666" }}>
                    {new Date(order.created_at).toLocaleString("vi-VN")}
                  </Text>
                </View>

                {/* Địa chỉ giao hàng */}
                {order.address && (
                  <Text style={{ color: "#666", marginBottom: 10 }}>
                    Giao đến: <Text style={{ fontWeight: "600" }}>{order.address.full_name}</Text> - {order.address.phone}
                    {"\n"}{order.address.address}
                  </Text>
                )}

                {/* Trạng thái */}
                <Text style={{ marginBottom: 8 }}>
                  Trạng thái: <Text style={{ fontWeight: "bold", color: statusInfo.color }}>
                    {statusInfo.text}
                  </Text>
                </Text>

                {/* Tổng tiền */}
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#E36631", marginBottom: 15 }}>
                  Tổng tiền: {Number(order.total_price).toLocaleString()}₫
                </Text>

                {/* Nút hủy đơn nếu được phép */}
                {(order.status === "pending" || order.status === "paid") && (
                  <TouchableOpacity
                    onPress={() => handleCancelOrder(order.id)}
                    style={{
                      backgroundColor: "#F44336",
                      padding: 12,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Hủy đơn hàng</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default CustomerOrders;