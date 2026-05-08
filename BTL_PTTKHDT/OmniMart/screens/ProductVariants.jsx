// screens/ProductVariants.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";

const ProductVariants = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params;

  const [variants, setVariants] = useState([]);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0); // Giá chính để hiển thị thông báo
  const [loading, setLoading] = useState(true);

  // Form thêm/sửa variant
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [stock, setStock] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Load danh sách sản phẩm của seller → tìm product và lấy variants
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(`${API_URL}/seller/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không tải được sản phẩm");

        const products = await res.json();
        const currentProduct = products.find(p => p.id === productId);

        if (currentProduct) {
          setProductName(currentProduct.name);
          setProductPrice(currentProduct.price || 0);
          setVariants(currentProduct.product_variants || []);
        }
      } catch (err) {
        Alert.alert("Lỗi", "Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  // Thêm hoặc sửa variant
  const saveVariant = async () => {
    if (!size.trim() && !color.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập ít nhất Size hoặc Màu sắc");
      return;
    }
    if (!stock.trim() || isNaN(stock) || Number(stock) < 0) {
      Alert.alert("Lỗi", "Tồn kho phải là số ≥ 0");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_URL}/seller/variants/${editingId}`
        : `${API_URL}/seller/products/${productId}/variants`;

      const body = {
        size: size.trim() || null,
        color: color.trim() || null,
        stock: Number(stock),
        // KHÔNG gửi price → backend sẽ dùng giá chính của sản phẩm
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();

        if (editingId) {
          setVariants(prev => prev.map(v => v.id === editingId ? data : v));
        } else {
          setVariants(prev => [...prev, data]);
        }

        // Reset form
        resetForm();
        Alert.alert("Thành công", editingId ? "Cập nhật biến thể thành công" : "Thêm biến thể thành công");
      } else {
        const err = await res.json();
        Alert.alert("Lỗi", err.message || "Không thể lưu biến thể");
      }
    } catch (err) {
      Alert.alert("Lỗi mạng", "Vui lòng kiểm tra kết nối");
    }
  };

  const resetForm = () => {
    setSize("");
    setColor("");
    setStock("");
    setEditingId(null);
  };

  const editVariant = (variant) => {
    setSize(variant.size || "");
    setColor(variant.color || "");
    setStock(String(variant.stock));
    setEditingId(variant.id);
  };

  const deleteVariant = (id) => {
    Alert.alert("Xác nhận", "Xóa biến thể này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await fetch(`${API_URL}/seller/variants/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            setVariants(prev => prev.filter(v => v.id !== id));
          } catch (err) {
            Alert.alert("Lỗi", "Không thể xóa");
          }
        },
      },
    ]);
  };

  const renderVariant = ({ item }) => (
    <View style={{
      backgroundColor: "#fff",
      padding: 15,
      borderRadius: 12,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 2,
    }}>
      <View>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          {item.size && item.color
            ? `${item.size} • ${item.color}`
            : item.size || item.color || "Mặc định"}
        </Text>
        <Text style={{ color: "#888", marginTop: 4 }}>
          Giá bán: {productPrice.toLocaleString()}₫ (theo giá chính)
        </Text>
        <Text style={{ color: "#555" }}>
          Tồn kho: <Text style={{ fontWeight: "bold" }}>{item.stock}</Text>
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 15 }}>
        <TouchableOpacity onPress={() => editVariant(item)}>
          <Icon name="edit" size={24} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteVariant(item.id)}>
          <Icon name="delete" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="large" color="#E36631" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ padding: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={28} color="#E36631" />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginLeft: 15, flex: 1 }}>
            Phân loại: {productName}
          </Text>
        </View>

        {/* Thông báo giá */}
        <View style={{ backgroundColor: "#e3f2fd", padding: 12, borderRadius: 10, marginBottom: 20 }}>
          <Text style={{ color: "#1976d2", textAlign: "center" }}>
            💡 Giá bán của tất cả biến thể là <Text style={{ fontWeight: "bold" }}>{productPrice.toLocaleString()}₫</Text> (theo giá bạn đã nhập khi tạo sản phẩm)
          </Text>
        </View>

        {/* Form thêm/sửa */}
        <View style={{ backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 20, elevation: 3 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15, color: "#E36631" }}>
            {editingId ? "Sửa biến thể" : "Thêm biến thể mới"}
          </Text>

          <TextInput
            placeholder="Size (M, L, XL... hoặc để trống)"
            value={size}
            onChangeText={setSize}
            style={styles.input}
          />

          <TextInput
            placeholder="Màu sắc (Đen, Trắng... hoặc để trống)"
            value={color}
            onChangeText={setColor}
            style={styles.input}
          />

          <TextInput
            placeholder="Số lượng tồn kho"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            style={styles.input}
          />

          <TouchableOpacity
            onPress={saveVariant}
            style={{
              backgroundColor: "#E36631",
              padding: 14,
              borderRadius: 10,
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              {editingId ? "Cập nhật" : "Thêm biến thể"}
            </Text>
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity onPress={resetForm} style={{ marginTop: 10, alignItems: "center" }}>
              <Text style={{ color: "#666" }}>Hủy sửa</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Danh sách */}
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Danh sách phân loại ({variants.length})
        </Text>

        {variants.length === 0 ? (
          <View style={{ alignItems: "center", padding: 40 }}>
            <Text style={{ fontSize: 50 }}>📦</Text>
            <Text style={{ color: "#888", fontSize: 16, textAlign: "center", marginTop: 10 }}>
              Chưa có biến thể nào.{'\n'}Hãy thêm để khách có thể mua hàng!
            </Text>
          </View>
        ) : (
          <FlatList
            data={variants}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderVariant}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
};

export default ProductVariants;