import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/shops`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setShops(data);
      } else {
        Alert.alert("Lỗi", "Không thể tải cửa hàng");
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = (shop) => {
    const isActive = shop.users?.is_active;
    const actionText = isActive ? "Khóa" : "Mở khóa";
    
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn ${actionText} chủ shop "${shop.users?.name}"?\nViệc này sẽ ảnh hưởng đến hoạt động của cửa hàng "${shop.name}".`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: actionText,
          style: isActive ? "destructive" : "default",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await fetch(`${API_URL}/admin/shops/${shop.id}/toggle-active`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              if (res.ok) {
                setShops(shops.map(s => s.id === shop.id ? { ...s, users: { ...s.users, is_active: data.is_active } } : s));
              } else {
                Alert.alert("Lỗi", data.message || "Không thể cập nhật");
              }
            } catch (err) {
              Alert.alert("Lỗi", "Lỗi kết nối");
            }
          }
        }
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
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#E36631" }}>Quản lý Cửa hàng</Text>
      </View>

      <FlatList
        data={shops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isActive = item.users?.is_active;
          return (
            <View
              style={{
                backgroundColor: "#fff",
                padding: 15,
                borderRadius: 10,
                marginVertical: 8,
                elevation: 2,
                opacity: isActive ? 1 : 0.7,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  {item.logo ? (
                    <Image source={{ uri: item.logo }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
                  ) : (
                    <View style={{ width: 40, height: 40, backgroundColor: "#e0f2fe", borderRadius: 20, marginRight: 10, justifyContent: "center", alignItems: "center" }}>
                      <Ionicons name="storefront" size={20} color="#E36631" />
                    </View>
                  )}
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.name}</Text>
                    <Text style={{ color: "#666", fontSize: 12 }}>ID Shop: #{item.id}</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  onPress={() => handleToggleActive(item)}
                  style={{
                    backgroundColor: isActive ? "#ecfdf5" : "#fef2f2",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name={isActive ? "shield-checkmark" : "shield-half"} size={14} color={isActive ? "#10b981" : "#ef4444"} style={{ marginRight: 4 }} />
                  <Text style={{ color: isActive ? "#10b981" : "#ef4444", fontWeight: "bold", fontSize: 12 }}>
                    {isActive ? "Hoạt động" : "Bị khóa"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 10, marginTop: 5 }}>
                <Text style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>
                  <Ionicons name="person" size={12} /> Chủ shop: <Text style={{ fontWeight: "600", color: "#1e293b" }}>{item.users?.name}</Text>
                </Text>
                <Text style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>
                  <Ionicons name="mail" size={12} /> Email: {item.users?.email}
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <Text style={{ fontSize: 13, color: "#475569" }}>
                    <Ionicons name="calendar" size={12} /> Tham gia: {new Date(item.created_at).toLocaleDateString("vi-VN")}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#E36631" }}>
                    {item.balance?.toLocaleString()}₫
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 50 }}>Không có cửa hàng nào</Text>}
      />
    </ScreenWrapper>
  );
};

export default AdminShops;
