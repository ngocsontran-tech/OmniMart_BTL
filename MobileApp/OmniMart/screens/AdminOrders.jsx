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

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        Alert.alert("Thành công", "Đã cập nhật trạng thái");
      } else {
        Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
      }
    } catch (err) {
      Alert.alert("Lỗi", "Lỗi kết nối");
    }
  };

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
        setSelectedOrder(item);
        setModalVisible(true);
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
          {item.total_price?.toLocaleString()}₫
        </Text>
        <View
          style={{
            backgroundColor: statusColors[item.status] || "#94a3b8",
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

      {/* Order Details Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 15, padding: 20, maxHeight: "80%" }}>
            {selectedOrder && (
              <>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                  <Text style={{ fontSize: 20, fontWeight: "bold" }}>Chi tiết đơn #{selectedOrder.id}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={{ fontSize: 24, color: "#999" }}>×</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ marginBottom: 15, backgroundColor: "#f8fafc", padding: 10, borderRadius: 8 }}>
                  <Text style={{ marginBottom: 4 }}>Ngày đặt: {new Date(selectedOrder.created_at).toLocaleString("vi-VN")}</Text>
                  <Text>Trạng thái: <Text style={{ color: statusColors[selectedOrder.status], fontWeight: "bold" }}>{statusText[selectedOrder.status]}</Text></Text>
                </View>

                <FlatList 
                  data={selectedOrder.order_items}
                  keyExtractor={(item) => item.id.toString()}
                  style={{ marginBottom: 15 }}
                  renderItem={({ item }) => (
                    <View style={{ flexDirection: "row", marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 10 }}>
                      <View style={{ width: 50, height: 50, backgroundColor: "#ccc", borderRadius: 8, marginRight: 10 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "bold" }}>{item.products?.name}</Text>
                        <Text style={{ color: "#666", fontSize: 12 }}>SL: {item.quantity} | Đơn giá: {item.price?.toLocaleString()}₫</Text>
                      </View>
                      <Text style={{ fontWeight: "bold" }}>{(item.price * item.quantity).toLocaleString()}₫</Text>
                    </View>
                  )}
                />

                <View style={{ borderTopWidth: 2, borderTopColor: "#eee", paddingTop: 15 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>Tổng cộng:</Text>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#E36631" }}>{selectedOrder.total_price?.toLocaleString()}₫</Text>
                  </View>

                  <Text style={{ fontWeight: "bold", marginBottom: 10, color: "#555" }}>Cập nhật trạng thái:</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    {selectedOrder.status === 'pending' && (
                      <TouchableOpacity style={{ backgroundColor: "#2196F3", padding: 12, borderRadius: 8, flex: 1 }} onPress={() => handleUpdateStatus(selectedOrder.id, 'shipped')}>
                        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Giao hàng</Text>
                      </TouchableOpacity>
                    )}
                    {selectedOrder.status === 'shipped' && (
                      <TouchableOpacity style={{ backgroundColor: "#4CAF50", padding: 12, borderRadius: 8, flex: 1 }} onPress={() => handleUpdateStatus(selectedOrder.id, 'completed')}>
                        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Hoàn thành</Text>
                      </TouchableOpacity>
                    )}
                    {['pending', 'shipped'].includes(selectedOrder.status) && (
                      <TouchableOpacity style={{ backgroundColor: "#F44336", padding: 12, borderRadius: 8, flex: 1 }} onPress={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}>
                        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Hủy đơn</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

import { Modal } from "react-native";
export default AdminOrders;