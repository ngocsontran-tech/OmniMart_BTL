// screens/Checkout.jsx
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import API_URL from "../config/api"; // Đảm bảo file này tồn tại

import { useNavigation } from "@react-navigation/native"; // Chỉ dùng navigation

const SHIPPING_FEE = 10000;

const Checkout = () => {
  const navigation = useNavigation(); // Dùng navigation thay vì router

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [newAddress, setNewAddress] = useState({
    full_name: "",
    phone: "",
    address: "",
  });

  // Voucher state
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.replace("Login");
        return;
      }

      const [cartRes, addrRes] = await Promise.all([
        fetch(`${API_URL}/cart`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/addresses`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const cartData = await cartRes.json();
      const addrData = await addrRes.json();

      setCartItems(cartData || []);
      setAddresses(addrData || []);

      const defaultAddr = addrData?.find((a) => a.is_default) || addrData?.[0] || null;
      setSelectedAddress(defaultAddr);

      // Load voucher đã áp dụng từ AsyncStorage
      const storedVoucher = await AsyncStorage.getItem("applied_voucher");
      if (storedVoucher && cartData.length > 0) {
        const voucherData = JSON.parse(storedVoucher);
        const verifyRes = await fetch(`${API_URL}/vouchers/apply`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            code: voucherData.code,
            subtotal: calculateSubtotal(cartData),
          }),
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          setAppliedVoucher(verifyData.voucher);
          setDiscountAmount(verifyData.discount_amount);
        } else {
          await AsyncStorage.removeItem("applied_voucher");
        }
      }
    } catch (err) {
      console.log("Checkout load error:", err);
      Alert.alert("Lỗi", "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = (items) => {
    return items.reduce(
      (sum, item) => sum + item.product_variants.price * item.quantity,
      0
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= TÍNH TOÁN ================= */
  const subtotal = calculateSubtotal(cartItems);
  const grandTotal = subtotal + SHIPPING_FEE - discountAmount;

  /* ================= ADD ADDRESS ================= */
  const handleAddAddress = async () => {
    const { full_name, phone, address } = newAddress;
    if (!full_name || !phone || !address) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAddresses((prev) => [...prev, data]);
      setSelectedAddress(data);
      setNewAddress({ full_name: "", phone: "", address: "" });
      Alert.alert("Thành công", "Đã thêm địa chỉ mới");
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể thêm địa chỉ");
    }
  };

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    if (!selectedAddress) {
      Alert.alert("Lỗi", "Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Lỗi", "Giỏ hàng trống");
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("token");

      const body = {
        address_id: selectedAddress.id,
        payment_method: "cod",
      };

      if (appliedVoucher) {
        body.voucher_code = appliedVoucher.code;
      }

      const res = await fetch(`${API_URL}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Xóa voucher sau khi dùng thành công
      await AsyncStorage.removeItem("applied_voucher");

      Alert.alert("🎉 Thành công", "Đặt hàng thành công!", [
        {
          text: "OK",
          onPress: () => {
            // Quay về trang chủ (HomeTabs) và reset stack để không quay lại Checkout được nữa
            navigation.reset({
              index: 0,
              routes: [{ name: "HomeTabs" }], // Thay "HomeTabs" bằng tên tab chính của bạn
            });
          },
        },
      ]);
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Đặt hàng thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#E36631" />
          <Text style={{ marginTop: 10, color: "#666" }}>Đang tải...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ADDRESS */}
        <Text style={styles.title}>Địa chỉ giao hàng</Text>
        {addresses.map((addr) => (
          <TouchableOpacity
            key={addr.id}
            style={[
              styles.addressBox,
              selectedAddress?.id === addr.id && styles.activeBox,
            ]}
            onPress={() => setSelectedAddress(addr)}
          >
            <Text style={styles.addrName}>{addr.full_name}</Text>
            <Text>{addr.phone}</Text>
            <Text>{addr.address}</Text>
          </TouchableOpacity>
        ))}

        {/* ADD NEW ADDRESS */}
        <Text style={[styles.title, { marginTop: 20 }]}>Thêm địa chỉ mới</Text>
        <TextInput
          style={styles.input}
          placeholder="Họ tên"
          value={newAddress.full_name}
          onChangeText={(t) => setNewAddress({ ...newAddress, full_name: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          keyboardType="phone-pad"
          value={newAddress.phone}
          onChangeText={(t) => setNewAddress({ ...newAddress, phone: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Địa chỉ chi tiết"
          value={newAddress.address}
          onChangeText={(t) => setNewAddress({ ...newAddress, address: t })}
        />
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleAddAddress}>
          <Text style={styles.secondaryText}>Lưu địa chỉ</Text>
        </TouchableOpacity>

        {/* VOUCHER INFO */}
        {appliedVoucher && (
          <View style={styles.voucherBox}>
            <Text style={{ color: "green", fontWeight: "bold" }}>
              ✓ Voucher: {appliedVoucher.code}
            </Text>
            <Text style={{ color: "green" }}>
              Giảm: {discountAmount.toLocaleString()}₫
            </Text>
          </View>
        )}

        {/* SUMMARY */}
        <View style={styles.summary}>
          <Row label="Tạm tính" value={`${subtotal.toLocaleString()}₫`} />
          {discountAmount > 0 && (
            <Row
              label="Giảm giá"
              value={`-${discountAmount.toLocaleString()}₫`}
              color="green"
            />
          )}
          <Row label="Phí ship" value={`${SHIPPING_FEE.toLocaleString()}₫`} />
          <Row
            label="Tổng cộng"
            value={`${grandTotal.toLocaleString()}₫`}
            bold
            color="#E36631"
          />
        </View>

        {/* CONFIRM */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            { opacity: submitting ? 0.7 : 1 },
          ]}
          onPress={handleCheckout}
          disabled={submitting}
        >
          <Text style={styles.confirmText}>
            {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

const Row = ({ label, value, bold, color }) => (
  <View style={styles.rowBetween}>
    <Text style={[styles.label, bold && { fontWeight: "bold", fontSize: 18 }]}>{label}</Text>
    <Text style={[styles.value, bold && { fontWeight: "bold", fontSize: 20 }, { color: color || "#000" }]}>
      {value}
    </Text>
  </View>
);

export default Checkout;

// ================= STYLES =================
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  addressBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  activeBox: {
    borderColor: "#E36631",
    borderWidth: 2,
  },
  addrName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  secondaryBtn: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E36631",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 20,
  },
  secondaryText: {
    color: "#E36631",
    fontWeight: "bold",
    fontSize: 16,
  },
  voucherBox: {
    backgroundColor: "#f0fdf4",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  summary: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 10,
    elevation: 3,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmBtn: {
    height: 60,
    backgroundColor: "#E36631",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 20,
  },
  confirmText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});