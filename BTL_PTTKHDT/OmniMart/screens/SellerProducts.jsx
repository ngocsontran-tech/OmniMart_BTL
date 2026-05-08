import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

const SellerProducts = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/seller/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        alert("Không thể tải sản phẩm");
      }
    } catch (err) {
      alert("Kết nối thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Tự động refresh khi màn hình được focus (quay lại từ AddEditProduct, xóa, v.v.)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchProducts);
    fetchProducts(); // Load lần đầu
    return unsubscribe;
  }, [navigation]);

  const openDeleteConfirm = (id) => {
    setDeletingId(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/seller/products/${deletingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== deletingId));
        alert("Đã xóa sản phẩm thành công!");
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert("Lỗi: " + (errorData.message || "Không thể xóa"));
      }
    } catch (err) {
      alert("Kết nối thất bại");
    } finally {
      setDeleteModalVisible(false);
      setDeletingId(null);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        elevation: 3,
        flexDirection: "row",
      }}
    >
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/80" }}
        style={{ width: 80, height: 80, borderRadius: 8 }}
      />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontWeight: "600" }} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={{ color: "#E36631", fontWeight: "600", marginTop: 5 }}>
          {item.price?.toLocaleString()}₫
        </Text>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddEditProduct", { product: item })}
            style={{ marginRight: 20 }}
          >
            <Icon name="edit" size={26} color="#E36631" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openDeleteConfirm(item.id)}>
            <Icon name="delete" size={26} color="#f44336" />
          </TouchableOpacity>
        </View>
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
      {/* Header với nút quay lại Home */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 8,
          }}
        >
          <Icon name="arrow-back" size={28} color="#E36631" />

        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("AddEditProduct")}
          style={{
            backgroundColor: "#E36631",
            padding: 10,
            borderRadius: 30,
          }}
        >
          <Icon name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Sản phẩm của bạn ({products.length})
      </Text>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 50 }}>
            Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Modal xác nhận xóa */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 12,
              width: "80%",
              maxWidth: 400,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
              Xác nhận xóa
            </Text>
            <Text style={{ marginBottom: 20 }}>
              Bạn có chắc muốn xóa sản phẩm này? Không thể hoàn tác!
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <Pressable
                onPress={() => setDeleteModalVisible(false)}
                style={{ padding: 10 }}
              >
                <Text style={{ color: "#666", fontWeight: "600" }}>Hủy</Text>
              </Pressable>
              <Pressable onPress={confirmDelete} style={{ padding: 10 }}>
                <Text style={{ color: "#f44336", fontWeight: "600" }}>Xóa</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default SellerProducts;