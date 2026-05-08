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
import { useNavigation } from "expo-router";

const SellerOrders = ({ nav }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/seller/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        Alert.alert("Lỗi", errorData.message || "Không thể tải đơn hàng");
        return;
      }

      const data = await res.json();
      setOrders(data);
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

  const updateOrderStatus = async (orderId, newStatus) => {
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn chuyển đơn hàng này thành "${newStatus === "shipped" ? "Đã giao hàng" : "Hủy đơn"}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          style: newStatus === "cancelled" ? "destructive" : "default",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await fetch(`${API_URL}/seller/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
              });

              if (res.ok) {
                Alert.alert("Thành công", "Cập nhật trạng thái đơn hàng thành công!");
                fetchOrders(); // Refresh danh sách
              } else {
                const errorData = await res.json();
                Alert.alert("Lỗi", errorData.message || "Không thể cập nhật");
              }
            } catch (err) {
              Alert.alert("Lỗi", "Không thể kết nối server");
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#FF9800";
      case "paid": return "#4CAF50";
      case "shipped": return "#2196F3";
      case "completed": return "#4CAF50";
      case "cancelled": return "#F44336";
      default: return "#999";
    }
  };

  const getPaymentStatusText = (payment) => {
    if (!payment) return { text: "Chưa thanh toán", color: "#FF9800" };
    switch (payment.status) {
      case "success": return { text: "Đã thanh toán", color: "#4CAF50" };
      case "failed": return { text: "Thanh toán thất bại", color: "#F44336" };
      default: return { text: "Chưa thanh toán", color: "#FF9800" };
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
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />
        }
      >
        <View style = {{flexDirection:"row"}}>
               <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#000000ff" />
                  </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: "bold", marginVertical: 20, marginHorizontal: 20, color: "#E36631" }}>
          Quản lý đơn hàng
        </Text>
        </View>


        {orders.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Ionicons name="basket-outline" size={80} color="#ccc" />
            <Text style={{ fontSize: 18, color: "#999", marginTop: 20 }}>
              Chưa có đơn hàng nào
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const paymentInfo = getPaymentStatusText(order.payment);

            return (
              <View
                key={order.id}
                style={{
                  backgroundColor: "#fff",
                  marginHorizontal: 20,
                  marginBottom: 15,
                  borderRadius: 12,
                  padding: 15,
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
                  <Text style={{ fontSize: 14, color: "#666" }}>
                    {new Date(order.created_at).toLocaleString("vi-VN")}
                  </Text>
                </View>

                {/* Khách hàng */}
                <Text style={{ fontWeight: "600", marginBottom: 5 }}>
                  Khách hàng: {order.customer.name || "Chưa có tên"} ({order.customer.phone})
                </Text>

                {/* Địa chỉ giao */}
                <Text style={{ color: "#666", marginBottom: 10 }}>
                  Giao đến: {order.address.full_name} - {order.address.phone}
                  {"\n"}{order.address.address}
                </Text>

                {/* Trạng thái thanh toán */}
                <Text style={{ fontWeight: "600", color: paymentInfo.color, marginBottom: 5 }}>
                  Thanh toán: {paymentInfo.text} ({order.payment?.method?.toUpperCase() || "COD"})
                </Text>

                {/* Trạng thái đơn hàng */}
                <Text style={{ fontWeight: "600", color: getStatusColor(order.status), marginBottom: 10 }}>
                  Trạng thái: {order.status === "pending" ? "Chờ xử lý" :
                              order.status === "paid" ? "Đã thanh toán" :
                              order.status === "shipped" ? "Đang giao" :
                              order.status === "completed" ? "Hoàn thành" :
                              order.status === "cancelled" ? "Đã hủy" : order.status}
                </Text>

                {/* Tổng tiền */}
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#E36631", marginBottom: 10 }}>
                  Tổng tiền: {Number(order.total_price).toLocaleString()}₫
                </Text>

                {/* Danh sách sản phẩm trong đơn */}
                <Text style={{ fontWeight: "600", marginBottom: 8 }}>Sản phẩm:</Text>
                {order.items.map((item) => (
                  <View key={item.id} style={{ flexDirection: "row", marginBottom: 8, alignItems: "center" }}>
                    <Text style={{ flex: 1 }}>
                      {item.product_name} {item.size && `(Size: ${item.size})`} {item.color && `(Màu: ${item.color})`}
                      {"\n"}x{item.quantity} @ {Number(item.price).toLocaleString()}₫
                    </Text>
                  </View>
                ))}

                {/* Nút hành động - chỉ hiện nếu chưa giao hoặc chưa hủy */}
                {order.status !== "shipped" && order.status !== "completed" && order.status !== "cancelled" && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 15 }}>
                    <TouchableOpacity
                      onPress={() => updateOrderStatus(order.id, "shipped")}
                      style={{
                        backgroundColor: "#2196F3",
                        padding: 12,
                        borderRadius: 8,
                        flex: 1,
                        marginRight: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>Đã giao hàng</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => updateOrderStatus(order.id, "cancelled")}
                      style={{
                        backgroundColor: "#F44336",
                        padding: 12,
                        borderRadius: 8,
                        flex: 1,
                        marginLeft: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>Hủy đơn</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default SellerOrders;