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
  TextInput,
  ScrollView,
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

  // Variant Modal State
  const [variantsModalVisible, setVariantsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  
  // Variant Form
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [stock, setStock] = useState("");
  const [editingVariantId, setEditingVariantId] = useState(null);

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

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchProducts);
    fetchProducts();
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

  // --- Variant Logic ---
  const openVariantsModal = (product) => {
    setSelectedProduct(product);
    setVariants(product.product_variants || []);
    resetVariantForm();
    setVariantsModalVisible(true);
  };

  const resetVariantForm = () => {
    setSize("");
    setColor("");
    setStock("");
    setEditingVariantId(null);
  };

  const saveVariant = async () => {
    if (!size.trim() && !color.trim()) {
      alert("Vui lòng nhập ít nhất Size hoặc Màu sắc");
      return;
    }
    if (!stock.trim() || isNaN(stock) || Number(stock) < 0) {
      alert("Tồn kho phải là số ≥ 0");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const method = editingVariantId ? "PUT" : "POST";
      const url = editingVariantId
        ? `${API_URL}/seller/variants/${editingVariantId}`
        : `${API_URL}/seller/products/${selectedProduct.id}/variants`;

      const body = {
        size: size.trim() || null,
        color: color.trim() || null,
        stock: Number(stock),
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
        let newVariants = [];
        if (editingVariantId) {
          newVariants = variants.map(v => v.id === editingVariantId ? data : v);
        } else {
          newVariants = [...variants, data];
        }
        setVariants(newVariants);
        
        // Cập nhật lại list sản phẩm chính để khi đóng modal mở lại ko bị mất
        setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, product_variants: newVariants } : p));
        
        resetVariantForm();
      } else {
        const err = await res.json();
        alert(err.message || "Không thể lưu biến thể");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  const editVariant = (variant) => {
    setSize(variant.size || "");
    setColor(variant.color || "");
    setStock(String(variant.stock));
    setEditingVariantId(variant.id);
  };

  const deleteVariant = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/seller/variants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const newVariants = variants.filter(v => v.id !== id);
        setVariants(newVariants);
        setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, product_variants: newVariants } : p));
      }
    } catch (err) {
      alert("Không thể xóa biến thể");
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
        <View style={{ flexDirection: "row", marginTop: 10, justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("AddEditProduct", { product: item })}
              style={{ marginRight: 15 }}
            >
              <Icon name="edit" size={24} color="#E36631" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openDeleteConfirm(item.id)}>
              <Icon name="delete" size={24} color="#f44336" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            onPress={() => openVariantsModal(item)}
            style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}
          >
            <Icon name="layers" size={16} color="#64748b" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: "#475569", fontWeight: "600" }}>Biến thể</Text>
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
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Icon name="arrow-back" size={28} color="#E36631" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("AddEditProduct")}
          style={{ backgroundColor: "#E36631", padding: 10, borderRadius: 30 }}
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

      {/* Modal Quản lý Biến thể */}
      <Modal visible={variantsModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: "85%" }}>
            {selectedProduct && (
              <>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", flex: 1 }} numberOfLines={1}>Phân loại: {selectedProduct.name}</Text>
                  <TouchableOpacity onPress={() => setVariantsModalVisible(false)}>
                    <Icon name="close" size={28} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ backgroundColor: "#f8fafc", padding: 15, borderRadius: 12, marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#E36631" }}>
                      {editingVariantId ? "Sửa phân loại" : "Thêm phân loại mới"}
                    </Text>

                    <TextInput placeholder="Size (VD: XL, 42)" value={size} onChangeText={setSize} style={styles.input} />
                    <TextInput placeholder="Màu sắc (VD: Đen, Trắng)" value={color} onChangeText={setColor} style={styles.input} />
                    <TextInput placeholder="Số lượng tồn kho" value={stock} onChangeText={setStock} keyboardType="numeric" style={styles.input} />

                    <TouchableOpacity onPress={saveVariant} style={{ backgroundColor: "#E36631", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 5 }}>
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>{editingVariantId ? "Cập nhật" : "Lưu biến thể"}</Text>
                    </TouchableOpacity>
                    {editingVariantId && (
                      <TouchableOpacity onPress={resetVariantForm} style={{ padding: 10, alignItems: "center" }}>
                        <Text style={{ color: "#666" }}>Hủy sửa</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Các biến thể hiện tại ({variants.length})</Text>
                  
                  {variants.length === 0 ? (
                    <Text style={{ textAlign: "center", color: "#999", padding: 20 }}>Chưa có biến thể nào</Text>
                  ) : (
                    variants.map(v => (
                      <View key={v.id} style={{ flexDirection: "row", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", padding: 15, borderRadius: 10, marginBottom: 10, alignItems: "center" }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                            {v.size && v.color ? `${v.size} - ${v.color}` : v.size || v.color || "Mặc định"}
                          </Text>
                          <Text style={{ color: "#64748b", marginTop: 4 }}>Tồn kho: <Text style={{ fontWeight: "bold", color: "#E36631" }}>{v.stock}</Text></Text>
                        </View>
                        <TouchableOpacity onPress={() => editVariant(v)} style={{ padding: 8, marginRight: 5 }}>
                          <Icon name="edit" size={22} color="#3b82f6" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteVariant(v.id)} style={{ padding: 8 }}>
                          <Icon name="delete" size={22} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal xác nhận xóa Sản phẩm chính */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 12, width: "80%" }}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>Xác nhận xóa</Text>
            <Text style={{ marginBottom: 20 }}>Bạn có chắc muốn xóa sản phẩm này? Không thể hoàn tác!</Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <Pressable onPress={() => setDeleteModalVisible(false)} style={{ padding: 10 }}><Text style={{ color: "#666", fontWeight: "600" }}>Hủy</Text></Pressable>
              <Pressable onPress={confirmDelete} style={{ padding: 10 }}><Text style={{ color: "#f44336", fontWeight: "600" }}>Xóa</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = {
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  }
};

export default SellerProducts;