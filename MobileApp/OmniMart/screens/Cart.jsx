import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { getCart, updateCartItem, removeCartItem } from "../services/cartService";
import { applyVoucher as apiApplyVoucher } from "../services/voucherService";

const ship = 10000;

const Cart = () => {
  const navigation = useNavigation();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null); // { code, discount_percent, max_discount, min_order }
  const [discountAmount, setDiscountAmount] = useState(0); // Số tiền được giảm
  const [applying, setApplying] = useState(false);

  // ================= LOAD CART =================
  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCartItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Load cart error:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCart();
      // Nếu giỏ hàng trống → xóa voucher cũ
      if (cartItems.length === 0) {
        AsyncStorage.removeItem("applied_voucher");
        setAppliedVoucher(null);
        setDiscountAmount(0);
      }
    }, [cartItems.length])
  );

  // ================= UPDATE QTY =================
  const updateQuantity = async (cartId, delta) => {
    const item = cartItems.find((i) => i.id === cartId);
    if (!item) return;

    const newQty = item.quantity + delta;

    try {
      if (newQty <= 0) {
        await removeCartItem(cartId);
      } else {
        await updateCartItem(cartId, newQty);
      }
      loadCart();
    } catch (err) {
      Alert.alert("Lỗi", "Không thể cập nhật giỏ hàng");
    }
  };

  // ================= APPLY VOUCHER =================
  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập mã voucher");
      return;
    }

    setApplying(true);
    try {
      const data = await apiApplyVoucher(voucherCode.trim().toUpperCase(), subtotal);

      setAppliedVoucher(data.voucher);
      setDiscountAmount(data.discount_amount);

      // LƯU VOUCHER ĐÃ ÁP DỤNG VÀO STORAGE ĐỂ CHECKOUT DÙNG
      await AsyncStorage.setItem("applied_voucher", JSON.stringify({
        code: voucherCode.trim().toUpperCase(),
        discount_amount: data.discount_amount,
        voucher: data.voucher
      }));

      Alert.alert("Thành công", `Áp dụng voucher thành công! Giảm ${data.discount_amount.toLocaleString()}₫`);
      setVoucherCode("");
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Voucher không hợp lệ");
      setAppliedVoucher(null);
      setDiscountAmount(0);
    } finally {
      setApplying(false);
    }
  };

  // ================= TÍNH TOÁN TỔNG TIỀN =================
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product_variants.price * item.quantity,
    0
  );

  const grandTotal = subtotal + ship - discountAmount;

  // ================= RENDER ITEM =================
  const renderItem = ({ item }) => {
    const variant = item.product_variants;
    const product = variant.products;

    return (
      <View style={styles.rowItem}>
        <Image source={{ uri: product.image }} style={styles.image} />

        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.variant}>
            {variant.color} / Size {variant.size}
          </Text>
          <Text style={styles.price}>
            {variant.price.toLocaleString()}₫
          </Text>
        </View>

        <View style={styles.qtyBox}>
          <TouchableOpacity onPress={() => updateQuantity(item.id, -1)}>
            <Ionicons name="remove" size={20} />
          </TouchableOpacity>

          <Text style={styles.qty}>{item.quantity}</Text>

          <TouchableOpacity onPress={() => updateQuantity(item.id, 1)}>
            <Ionicons name="add" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ================= UI =================
  return (
    <ScreenWrapper>
      {loading ? (
        <ActivityIndicator size="large" color="#E36631" />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 10 }}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", marginTop: 50, fontSize: 18, color: "#666" }}>
                Giỏ hàng trống
              </Text>
            }
          />

          {/* VOUCHER INPUT */}
          <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
            <View style={styles.discountBox}>
              <TextInput
                placeholder="Nhập mã giảm giá"
                value={voucherCode}
                onChangeText={setVoucherCode}
                style={styles.discountInput}
                editable={!applying}
              />
              <TouchableOpacity onPress={applyVoucher} disabled={applying}>
                <Text style={styles.applyText}>
                  {applying ? "Đang áp dụng..." : "Áp dụng"}
                </Text>
              </TouchableOpacity>
            </View>

            {appliedVoucher && (
              <Text style={{ color: "green", marginTop: 8, fontWeight: "bold" }}>
                ✓ Đã áp dụng: {appliedVoucher.code} - Giảm {discountAmount.toLocaleString()}₫
              </Text>
            )}
          </View>

          {/* TỔNG TIỀN */}
          <View style={{ padding: 10, backgroundColor: "#f9f9f9", borderRadius: 10, margin: 10 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Tạm tính</Text>
              <Text style={styles.value}>{subtotal.toLocaleString()}₫</Text>
            </View>

            {discountAmount > 0 && (
              <View style={styles.rowBetween}>
                <Text style={{ fontSize: 16, color: "green" }}>Giảm giá</Text>
                <Text style={{ fontSize: 16, color: "green", fontWeight: "bold" }}>
                  -{discountAmount.toLocaleString()}₫
                </Text>
              </View>
            )}

            <View style={styles.rowBetween}>
              <Text style={styles.label}>Phí ship</Text>
              <Text style={styles.value}>{ship.toLocaleString()}₫</Text>
            </View>

            <View style={[styles.rowBetween, { marginTop: 10 }]}>
              <Text style={[styles.label, { fontSize: 20 }]}>Tổng cộng</Text>
              <Text style={{ fontSize: 22, fontWeight: "bold", color: "#E36631" }}>
                {grandTotal.toLocaleString()}₫
              </Text>
            </View>
          </View>

          {/* NÚT MUA HÀNG */}
          <TouchableOpacity
            style={[
              styles.buyBtn,
              { backgroundColor: cartItems.length === 0 ? "#ccc" : "#E36631" }
            ]}
            disabled={cartItems.length === 0}
            onPress={() => navigation.navigate("Checkout")}
          >
            <Text style={styles.buyText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenWrapper>
  );
};

export default Cart;

// ================= STYLES =================
const styles = StyleSheet.create({
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    marginBottom: 15,
    borderRadius: 10,
    padding: 10,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  variant: {
    fontSize: 13,
    color: "#666",
    marginVertical: 2,
  },
  price: {
    color: "#E36631",
    fontWeight: "bold",
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 6,
    gap: 8,
  },
  qty: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "center",
  },
  discountBox: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  discountInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  applyText: {
    color: "#E36631",
    fontWeight: "bold",
    fontSize: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
  buyBtn: {
    height: 60,
    margin: 10,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  buyText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});