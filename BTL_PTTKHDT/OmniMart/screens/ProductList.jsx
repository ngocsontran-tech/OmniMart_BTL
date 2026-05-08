import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ScreenWrapper from "../components/ScreenWrapper";
import FilterSheet from "../components/FilterSheet";
import { getProducts } from "../services/productService";
import { Ionicons } from "@expo/vector-icons";

const ProductList = ({ route, navigation }) => {
  const { category_id, search, category_name } = route.params || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(""); // "" | "price_asc" | "price_desc"
  const [showFilter, setShowFilter] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts({ category_id, search, sort });
      setProducts(data || []);
    } catch (err) {
      console.log("Fetch products error:", err);
      Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại khi thay đổi category, search hoặc sort
  useEffect(() => {
    fetchProducts();
  }, [category_id, search, sort]);

  const renderItem = ({ item }) => {
    const imageUri = item.image || null;

    return (
      <TouchableOpacity
        style={{
          flex: 1,
          marginHorizontal: 8,
          marginBottom: 16,
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 10,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        }}
        onPress={() => navigation.navigate("Item", { id: item.id })}
      >
        <Image
          source={{ uri: imageUri }}
          style={{
            width: "100%",
            height: 160,
            borderRadius: 10,
            backgroundColor: "#f0f0f0",
          }}
          resizeMode="cover"
        />
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 14,
            marginTop: 10,
            minHeight: 40,
          }}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text
          style={{
            color: "#E36631",
            fontWeight: "700",
            fontSize: 15,
            marginTop: 6,
          }}
        >
          {item.price?.toLocaleString()}₫
        </Text>
      </TouchableOpacity>
    );
  };

  const getScreenTitle = () => {
    if (search) return `Tìm kiếm: "${search}"`;
    if (category_name) return category_name;
    return "Tất cả sản phẩm";
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 12,
          paddingHorizontal: 10,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#000" />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            flex: 1,
            textAlign: "center",
            marginRight: 30, // bù cho icon filter bên phải
          }}
          numberOfLines={1}
        >
          {getScreenTitle()}
        </Text>

        <TouchableOpacity onPress={() => setShowFilter(true)}>
          <Icon name="filter-list" size={28} color="#E36631" />
        </TouchableOpacity>
      </View>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#E36631" />
        </View>
      ) : products.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#888" }}>
            Không tìm thấy sản phẩm nào
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingHorizontal: 5, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Sheet - bạn chỉ cần trong FilterSheet gọi onSort("price_asc") hoặc "price_desc" */}
      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onSort={setSort} // ví dụ: onSort("price_asc") hoặc onSort("")
        currentSort={sort} // optional: để highlight lựa chọn hiện tại
      />
    </ScreenWrapper>
  );
};

export default ProductList;