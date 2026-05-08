import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

const SellerDashboard = ({ navigation }) => {
  const [shop, setShop] = useState(null);
  const [stats, setStats] = useState({ orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Lấy thông tin shop
      const shopRes = await fetch(`${API_URL}/seller/shop`, { headers });
      if (shopRes.ok) {
        const shopData = await shopRes.json();
        setShop(shopData);
      }

      // Lấy danh sách đơn hàng của seller để tính doanh thu
      const ordersRes = await fetch(`${API_URL}/seller/orders`, { headers });
      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        const completedOrders = orders.filter(o => o.status === "completed");
        const revenue = completedOrders.reduce((sum, o) => sum + o.total_price, 0);
        setStats({ orders: orders.length, revenue });
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="large" color="#E36631" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
          Cửa hàng của bạn
        </Text>

        {/* Thông tin shop */}
        <View
          style={{
            backgroundColor: "#fff",
            padding: 15,
            borderRadius: 10,
            elevation: 3,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600" }}>{shop?.name}</Text>
          <Text style={{ color: "#666", marginTop: 5 }}>{shop?.description}</Text>
          <Text style={{ marginTop: 10, fontWeight: "600" }}>
            Doanh thu: {stats.revenue.toLocaleString()}₫
          </Text>
          <Text>Số đơn hàng: {stats.orders}</Text>
        </View>

        {/* Các nút chức năng */}
        <TouchableOpacity
          style={{
            backgroundColor: "#E36631",
            padding: 15,
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 15,
          }}
          onPress={() => navigation.navigate("SellerProducts")}
        >
          <Icon name="inventory" size={24} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 10 }}>
            Quản lý sản phẩm
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#4CAF50",
            padding: 15,
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => navigation.navigate("SellerOrders")}
        >
          <Icon name="local-shipping" size={24} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 10 }}>
            Quản lý đơn hàng
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default SellerDashboard;