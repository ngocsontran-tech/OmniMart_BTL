// screens/AdminProducts.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = (id, name) => {
    Alert.alert("Xác nhận xóa", `Xóa sản phẩm "${name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await fetch(`${API_URL}/admin/products/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            setProducts((prev) => prev.filter((p) => p.id !== id));
            Alert.alert("Thành công", "Sản phẩm đã bị xóa");
          } catch (err) {
            Alert.alert("Lỗi", "Không thể xóa sản phẩm");
          }
        },
      },
    ]);
  };

  const renderProduct = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 2,
      }}
    >
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/80" }}
        style={{ width: 80, height: 80, borderRadius: 8 }}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontWeight: "bold", fontSize: 16 }} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={{ color: "#E36631", fontWeight: "600", marginVertical: 4 }}>
          {item.price?.toLocaleString()}₫
        </Text>
        <Text style={{ color: "#555", fontSize: 13 }}>
          Cửa hàng: {item.shops?.name || "Không rõ"}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => deleteProduct(item.id, item.name)}
        style={{
          backgroundColor: "#F44336",
          padding: 10,
          borderRadius: 8,
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 12 }}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#E36631" }}>
        Quản lý Sản phẩm
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#E36631" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProduct}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 50, color: "#999" }}>
              Không có sản phẩm nào
            </Text>
          }
        />
      )}
    </ScreenWrapper>
  );
};

export default AdminProducts;