import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialIcons";

const AddEditProduct = ({ route, navigation }) => {
  const product = route.params?.product || null;
  const isEdit = !!product;

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price ? String(product.price) : "");
  const [categoryId, setCategoryId] = useState(product?.category_id ? String(product.category_id) : "");
  const [imagePath, setImagePath] = useState(product?.image || null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCats, setFetchingCats] = useState(true);

  // Biến thể
  const [productId, setProductId] = useState(product?.id || null); // ID sản phẩm sau khi tạo
  const [variants, setVariants] = useState(product?.product_variants || []);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [stock, setStock] = useState("");
  const [editingVariantId, setEditingVariantId] = useState(null);

  const SUPABASE_IMAGE_BASE = "https://jxucfgophluykubxvphe.supabase.co/storage/v1/object/public/products/";

  // Fetch danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/home`);
        if (res.ok) {
          const data = await res.json();
          const allCats = [];
          data.categories.forEach(parent => {
            allCats.push({ id: parent.id, name: parent.name });
            if (parent.children) {
              parent.children.forEach(child => allCats.push({ id: child.id, name: `└ ${child.name}` }));
            }
          });
          setCategories(allCats);
        }
      } catch (err) {
        Alert.alert("Lỗi", "Không tải được danh mục");
      } finally {
        setFetchingCats(false);
      }
    };
    fetchCategories();
  }, []);

  // Upload ảnh
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền bị từ chối", "Vui lòng cấp quyền truy cập thư viện ảnh");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    await uploadImage(result.assets[0]);
  };

  const uploadImage = async (asset) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob, `product_${Date.now()}.jpg`);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        Alert.alert("Lỗi upload", text.substring(0, 200));
        return;
      }

      const data = await res.json();
      setImagePath(SUPABASE_IMAGE_BASE + data.path.replace(/^products\//, ""));
      Alert.alert("Thành công", "Upload ảnh thành công!");
    } catch (err) {
      Alert.alert("Lỗi", "Upload thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Lưu sản phẩm
  const saveProduct = async () => {
    if (!name.trim()) return Alert.alert("Lỗi", "Vui lòng nhập tên sản phẩm");
    if (!price.trim() || isNaN(price)) return Alert.alert("Lỗi", "Giá không hợp lệ");
    if (!categoryId) return Alert.alert("Lỗi", "Vui lòng chọn danh mục");

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const imageToSave = imagePath ? imagePath.replace(SUPABASE_IMAGE_BASE, "") : null;

      const body = {
        name: name.trim(),
        description: description.trim() || null,
        price: Number(price),
        category_id: Number(categoryId),
        image: imageToSave,
      };

      const method = isEdit ? "PUT" : "POST";
      const url = isEdit
        ? `${API_URL}/seller/products/${product.id}`
        : `${API_URL}/seller/products`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        if (!isEdit) {
          setProductId(data.id); // Lưu ID để thêm variant ngay
          Alert.alert("Thành công!", "Sản phẩm đã được tạo. Bây giờ bạn có thể thêm phân loại (Size/Màu/Tồn kho) bên dưới.");
        } else {
          Alert.alert("Thành công", "Cập nhật sản phẩm thành công!");
          navigation.goBack();
        }
      } else {
        Alert.alert("Lỗi", data.message || "Không thể lưu sản phẩm");
      }
    } catch (err) {
      Alert.alert("Lỗi", "Kết nối thất bại");
    } finally {
      setLoading(false);
    }
  };
// === CHỈ THAY PHẦN saveVariant === (từ dòng này trở xuống là phần mới)

// Thêm/Sửa biến thể (hỗ trợ nhập nhiều size/màu cùng lúc)
const saveVariant = async () => {
  // Tách size và color thành mảng
  const sizeList = size
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const colorList = color
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  if (sizeList.length === 0 && colorList.length === 0) {
    return Alert.alert("Lỗi", "Vui lòng nhập ít nhất Size hoặc Màu (cách nhau bằng dấu phẩy)");
  }

  if (!stock.trim() || isNaN(stock) || Number(stock) < 0) {
    return Alert.alert("Lỗi", "Tồn kho phải là số ≥ 0");
  }

  const stockNum = Number(stock);
  const currentPrice = Number(price || 0);

  // Tạo danh sách tất cả tổ hợp
  let combinations = [];

  if (sizeList.length > 0 && colorList.length > 0) {
    // Có cả size và màu → tạo tổ hợp chéo
    sizeList.forEach((s) => {
      colorList.forEach((c) => {
        combinations.push({ size: s, color: c });
      });
    });
  } else if (sizeList.length > 0) {
    // Chỉ có size
    sizeList.forEach((s) => combinations.push({ size: s, color: null }));
  } else if (colorList.length > 0) {
    // Chỉ có màu
    colorList.forEach((c) => combinations.push({ size: null, color: c }));
  }

  // Xác nhận số lượng sẽ tạo
  Alert.alert(
    "Xác nhận tạo biến thể",
    `Bạn sẽ tạo ${combinations.length} biến thể với tồn kho ${stockNum} mỗi cái.\n\nDanh sách:\n${combinations
      .map((c) => `• ${c.size || "—"} / ${c.color || "—"}`)
      .join("\n")}\n\nTiếp tục?`,
    [
      { text: "Hủy", style: "cancel" },
      {
        text: "Tạo ngay",
        onPress: async () => {
          try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");

            // Gửi lần lượt từng variant (đảm bảo không lỗi)
            const newVariants = [];
            for (const combo of combinations) {
              const body = {
                size: combo.size || null,
                color: combo.color || null,
                price: currentPrice,
                stock: stockNum,
              };

              const res = await fetch(
                `${API_URL}/seller/products/${productId || product.id}/variants`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(body),
                }
              );

              if (!res.ok) {
                const err = await res.json();
                Alert.alert("Lỗi khi tạo", err.message || "Một biến thể bị lỗi");
                return;
              }

              const data = await res.json();
              newVariants.push(data);
            }

            // Cập nhật danh sách
            setVariants((prev) => [...prev, ...newVariants]);

            // Reset form
            resetVariantForm();
            Alert.alert("Thành công!", `Đã tạo ${newVariants.length} biến thể mới!`);
          } catch (err) {
            Alert.alert("Lỗi mạng", "Không thể tạo biến thể");
          } finally {
            setLoading(false);
          }
        },
      },
    ]
  );
};

  const resetVariantForm = () => {
    setSize("");
    setColor("");
    setStock("");
    setEditingVariantId(null);
  };

  const editVariant = (variant) => {
    setSize(variant.size || "");
    setColor(variant.color || "");
    setStock(String(variant.stock));
    setEditingVariantId(variant.id);
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
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 2,
    }}>
      <View>
        <Text style={{ fontWeight: "bold" }}>
          {item.size && item.color ? `${item.size} • ${item.color}` : item.size || item.color || "Mặc định"}
        </Text>
        <Text style={{ color: "#888", marginTop: 4 }}>Tồn kho: {item.stock}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity onPress={() => editVariant(item)}>
          <Icon name="edit" size={22} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteVariant(item.id)}>
          <Icon name="delete" size={22} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <Icon name="arrow-back" size={28} color="#E36631" />
          <Text style={{ marginLeft: 10, fontSize: 16 }}>Quay lại</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>
          {isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
        </Text>

        {/* Form sản phẩm chính */}
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Tên sản phẩm *</Text>
        <TextInput placeholder="Nhập tên" value={name} onChangeText={setName} style={styles.input} />

        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Giá tiền (₫) *</Text>
        <TextInput placeholder="Nhập giá" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />

        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Danh mục *</Text>
        {fetchingCats ? <ActivityIndicator color="#E36631" /> : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategoryId(String(cat.id))}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: categoryId === String(cat.id) ? "#E36631" : "#ddd",
                  backgroundColor: categoryId === String(cat.id) ? "#E36631" : "#fff",
                  marginRight: 10,
                }}
              >
                <Text style={{ color: categoryId === String(cat.id) ? "#fff" : "#000" }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Mô tả</Text>
        <TextInput placeholder="Mô tả chi tiết (tùy chọn)" value={description} onChangeText={setDescription} multiline style={[styles.input, { height: 100, textAlignVertical: "top" }]} />

        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Ảnh sản phẩm</Text>
        <TouchableOpacity onPress={pickImage} disabled={loading} style={styles.imagePicker}>
          {loading ? <ActivityIndicator size="large" color="#E36631" /> : imagePath ? (
            <Image source={{ uri: imagePath }} style={{ width: "100%", height: 250, borderRadius: 12 }} resizeMode="cover" />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 50 }}>📷</Text>
              <Text style={{ color: "#666" }}>Chọn ảnh</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={saveProduct}
          disabled={loading || !name.trim() || !price.trim() || !categoryId}
          style={[styles.saveBtn, { backgroundColor: (name && price && categoryId) ? "#E36631" : "#ccc" }]}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
            {isEdit ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
          </Text>
        </TouchableOpacity>

        {/* === PHẦN BIẾN THỂ - CHỈ HIỆN KHI ĐÃ CÓ PRODUCT ID === */}
        {(productId || isEdit) && (
          <>
            <View style={{ height: 2, backgroundColor: "#eee", marginVertical: 30 }} />

            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#E36631" }}>
              Phân loại sản phẩm (Size / Màu / Tồn kho)
            </Text>

            <View style={{ backgroundColor: "#fff2e8", padding: 12, borderRadius: 10, marginBottom: 20 }}>
              <Text style={{ textAlign: "center", color: "#E36631" }}>
                💡 Giá bán của tất cả biến thể: <Text style={{ fontWeight: "bold" }}>{Number(price || 0).toLocaleString()}₫</Text>
              </Text>
            </View>

            {/* Form thêm biến thể */}
            <View style={{ backgroundColor: "#f9f9f9", padding: 15, borderRadius: 12, marginBottom: 20 }}>
              <TextInput placeholder="Size (M, L, XL...)" value={size} onChangeText={setSize} style={styles.input} />
              <TextInput placeholder="Màu sắc (Đen, Trắng...)" value={color} onChangeText={setColor} style={styles.input} />
              <TextInput placeholder="Tồn kho" value={stock} onChangeText={setStock} keyboardType="numeric" style={styles.input} />

              <TouchableOpacity onPress={saveVariant} style={styles.saveBtn}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {editingVariantId ? "Cập nhật biến thể" : "Thêm biến thể"}
                </Text>
              </TouchableOpacity>

              {editingVariantId && (
                <TouchableOpacity onPress={resetVariantForm} style={{ marginTop: 10, alignItems: "center" }}>
                  <Text style={{ color: "#666" }}>Hủy sửa</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Danh sách biến thể */}
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              Danh sách phân loại ({variants.length})
            </Text>

            {variants.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#888", fontStyle: "italic", padding: 20 }}>
                Chưa có biến thể nào. Hãy thêm để khách hàng có thể mua!
              </Text>
            ) : (
              <FlatList
                data={variants}
                keyExtractor={item => String(item.id)}
                renderItem={renderVariant}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}
      </ScrollView>
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
    backgroundColor: "#fff",
  },
  imagePicker: {
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 30,
  },
  saveBtn: {
    backgroundColor: "#E36631",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
};

export default AddEditProduct;