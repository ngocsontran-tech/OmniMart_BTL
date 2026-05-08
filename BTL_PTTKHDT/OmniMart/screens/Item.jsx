import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenWrapper from "../components/ScreenWrapper";
import { getProductDetail } from "../services/productService";
import { getReviews } from "../services/voucherService"; // reviews are currently in voucherService in my implementation
import { checkFavorite, toggleFavorite as apiToggleFavorite } from "../services/favoriteService";
import { addToCart as apiAddToCart } from "../services/cartService";
import { getProfile } from "../services/userService";
import { getOrders } from "../services/orderService";

export default function Item() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [shopName, setShopName] = useState("OmniMart Shop");

  // Load reviews
  useEffect(() => {
    const loadReviews = async () => {
      setLoadingReviews(true);
      try {
        const data = await getReviews(id);
        setReviews(data || []);
      } catch (err) {
        console.log("Load reviews error:", err);
      }
      setLoadingReviews(false);
    };
    loadReviews();
  }, [id]);

  // Load product detail
  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        const data = await getProductDetail(id);
        setProduct(data);
        setVariants(data.product_variants || []);
        setShopName(data.shop?.name || "OmniMart Shop");
      } catch (err) {
        Alert.alert("Lỗi", "Không tải được sản phẩm");
      }
      setLoading(false);
    };
    loadDetail();
  }, [id]);

  // Load favorite
  useEffect(() => {
    const loadFavorite = async () => {
      try {
        const data = await checkFavorite(id);
        setIsFavorite(data.isFavorite);
      } catch (err) {
        console.log("Load favorite error:", err);
      }
    };
    loadFavorite();
  }, [id]);

  // Toggle favorite
  const toggleFavorite = async () => {
    try {
      const data = await apiToggleFavorite(id);
      setIsFavorite(data.favorite);
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Bạn cần đăng nhập");
    }
  };

  // Add to cart
  const addToCart = async () => {
    if (!selectedVariant?.id) {
      Alert.alert("Lỗi", "Vui lòng chọn size và màu");
      return;
    }

    try {
      await apiAddToCart(selectedVariant.id, quantity);
      Alert.alert("Thành công", "Đã thêm vào giỏ hàng 🛒");
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể thêm vào giỏ hàng");
    }
  };

  // Nút Chat
  const openChat = async () => {
    if (!product.shop?.id) {
      Alert.alert("Lỗi", "Không tìm thấy cửa hàng");
      return;
    }

    try {
      const buyerProfile = await getProfile();

      navigation.navigate("ChatScreen", {
        productId: product.id,
        shopName: product.shop.name || "Cửa hàng",
        sellerId: null,
        buyerId: buyerProfile.id,
        buyerName: buyerProfile.name || "Bạn",
      });
    } catch (err) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để chat");
    }
  };

  useEffect(() => {
    if (!variants.length) return;
    const v = variants.find(
      (x) => (!selectedSize || x.size === selectedSize) && (!selectedColor || x.color === selectedColor)
    );
    setSelectedVariant(v || null);
  }, [selectedSize, selectedColor, variants]);

  const handleQuantity = (num) => {
    setQuantity((prev) => Math.max(1, prev + num));
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="large" color="#E36631" />
      </ScreenWrapper>
    );
  }

  if (!product) return null;

  const sizes = [...new Set(variants.map((v) => v.size))].filter(Boolean);
  const colors = [...new Set(variants.map((v) => v.color))].filter(Boolean);

  const rating = product.rating || 0;
  const ratingCount = product.rating_count || 0;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;

  return (
    <ScreenWrapper>
      <View style={{ flex: 1}}>
        {/* BACK */}
        <TouchableOpacity
          style={{ position: "absolute", zIndex: 10, padding: 6 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={30} />
        </TouchableOpacity>

        {/* FAVORITE */}
        <TouchableOpacity
          onPress={toggleFavorite}
          style={{ position: "absolute", right: 10, zIndex: 10 }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={30}
            color={isFavorite ? "#E36631" : "#000"}
          />
        </TouchableOpacity>

        <ScrollView >
          {/* IMAGE */}
          <View style={styles.imageBox}>
            <Image
              source={{ uri: product.image }}
              style={{ width: 240, height: 240 }}
            />
          </View>

          {/* INFO */}
          <Text style={styles.title}>{product.name}</Text>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              marginBottom: 10,
            }}
            onPress={() => {
              Alert.alert(
                "Cửa hàng",
                `Sản phẩm này được bán bởi:\n${shopName}\n\nTính năng xem chi tiết shop sẽ có trong phiên bản tiếp theo!`,
                [{ text: "OK" }]
              );
            }}
          >
            <Ionicons name="storefront-outline" size={22} color="#E36631" />
            <Text style={{ marginLeft: 10, fontSize: 16, color: "#E36631", fontWeight: "600" }}>
              Được bán bởi: {shopName}
            </Text>
            
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#E36631",
              padding: 14,
              borderRadius: 12,
              marginVertical: 15,
            }}
            onPress={async () => {
              if (!product.shop?.id) {
                Alert.alert("Lỗi", "Không tìm thấy cửa hàng");
                return;
              }

              const token = await AsyncStorage.getItem("token");
              if (!token) {
                Alert.alert("Thông báo", "Vui lòng đăng nhập để chat");
                return;
              }

              // Dùng safeFetch để tránh crash
              const buyerProfile = await safeFetch(`${API_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!buyerProfile) {
                Alert.alert("Lỗi", "Không lấy được thông tin của bạn");
                return;
              }

              // Tạm thời KHÔNG gọi API /shops/:id (vì chưa có route)
              // Chỉ cần shopName và bỏ sellerId (ChatScreen vẫn hoạt động tốt)
              navigation.navigate("ChatScreen", {
                productId: product.id,
                shopName: product.shop.name || "Cửa hàng",
                sellerId: null, // để null → ChatScreen sẽ xử lý hiển thị tên
                buyerId: buyerProfile.id,
                buyerName: buyerProfile.name || "Bạn",
              });
            }}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#fff" />
            <Text style={{ marginLeft: 10, color: "#fff", fontWeight: "600", fontSize: 16 }}>
              Chat với người bán
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {[...Array(5)].map((_, i) => (
              <MaterialIcons
                key={i}
                name={
                  i < fullStars
                    ? "star"
                    : i === fullStars && hasHalf
                    ? "star-half"
                    : "star-border"
                }
                size={24}
                color="#FFD700"
              />
            ))}
            <Text style={{ marginLeft: 6 }}>({ratingCount})</Text>
          </View>

          <Text style={styles.price}>
            {product.price?.toLocaleString()}₫
          </Text>
          {/* REVIEWS */}
          <View style={{ marginTop: 30 }}>
            <Text style={styles.section}>Reviews</Text>

            {loadingReviews ? (
              <ActivityIndicator size="small" color="#E36631" />
            ) : reviews.length === 0 ? (
              <Text style={{ marginTop: 10 }}>Chưa có đánh giá nào</Text>
            ) : (
              reviews.map((r) => (
                <View key={r.id} style={{ marginTop: 10, padding: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>{r.users?.name || "Người dùng"}</Text>
                  <View style={{ flexDirection: "row", marginVertical: 4 }}>
                    {[...Array(5)].map((_, i) => (
                      <MaterialIcons
                        key={i}
                        name={i < r.rating ? "star" : "star-border"}
                        size={18}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                  <Text>{r.comment}</Text>
                </View>
              ))
            )}
          </View>

          {sizes.length > 0 && (
            <>
              <Text style={styles.section}>Size</Text>
              <View style={styles.row}>
                {sizes.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSelectedSize(s)}
                    style={[
                      styles.option,
                      selectedSize === s && styles.optionActive,
                    ]}
                  >
                    <Text>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* COLOR */}
          {colors.length > 0 && (
            <>
              <Text style={styles.section}>Color</Text>
              <View style={styles.row}>
                {colors.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedColor(c)}
                    style={[
                      styles.option,
                      selectedColor === c && styles.optionActive,
                    ]}
                  >
                    <Text>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* QUANTITY */}
          <View style={styles.qtyBox}>
            <TouchableOpacity onPress={() => handleQuantity(-1)}>
              <Ionicons name="remove" size={22} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18 }}>{quantity}</Text>
            <TouchableOpacity onPress={() => handleQuantity(1)}>
              <Ionicons name="add" size={22} />
            </TouchableOpacity>
          </View>

          {/* VIEW ORDERS */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#555", marginTop: 20 }]}
          onPress={async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              if (!token) {
                Alert.alert("Lỗi", "Bạn cần đăng nhập để xem đơn hàng");
                return;
              }

              // 1️⃣ Lấy danh sách order chứa sản phẩm này
              const res = await fetch(`${API_URL}/orders?product_id=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();

              if (!data.length) {
                Alert.alert("Thông báo", "Sản phẩm này chưa có trong đơn hàng nào");
                return;
              }

              // 2️⃣ Chuyển sang trang OrderDetail đầu tiên
              navigation.navigate("OrderDetail", { orderId: data[0].id });
            } catch (err) {
              console.log(err);
              Alert.alert("Lỗi", "Không thể tải đơn hàng");
            }
          }}
        >
          <Text style={styles.btnText}>View Orders</Text>
        </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={addToCart}>
            <Text style={styles.btnText}>Add to cart</Text>
          </TouchableOpacity>
          
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  imageBox: {
    backgroundColor: "#eee",
    alignItems: "center",
    padding: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#E36631",
  },
  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    marginTop: 10,
  },
  option: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    marginRight: 10,
  },
  optionActive: {
    borderColor: "#E36631",
  },
  qtyBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 120,
    marginVertical: 20,
    alignItems: "center",
  },
  btn: {
    backgroundColor: "#E36631",
    height: 55,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
