// screens/AdminVouchers.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  const [form, setForm] = useState({
    code: "",
    discount_percent: "",
    max_discount: "",
    min_order: "",
    expired_at: "",
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/vouchers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setVouchers(data);
      } else {
        Alert.alert("Lỗi", data.message || "Không thể tải voucher");
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.code || !form.discount_percent || !form.expired_at) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền mã, % giảm và ngày hết hạn");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const method = editingVoucher ? "PUT" : "POST";
      const url = editingVoucher
        ? `${API_URL}/admin/vouchers/${editingVoucher.id}`
        : `${API_URL}/admin/vouchers`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          discount_percent: parseInt(form.discount_percent),
          max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
          min_order: form.min_order ? parseFloat(form.min_order) : null,
          expired_at: form.expired_at,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Thành công", editingVoucher ? "Cập nhật thành công" : "Tạo voucher thành công");
        setModalVisible(false);
        resetForm();
        fetchVouchers();
      } else {
        Alert.alert("Lỗi", data.message || "Thao tác thất bại");
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể kết nối");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa voucher này?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${API_URL}/admin/vouchers/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              fetchVouchers();
              Alert.alert("Thành công", "Đã xóa voucher");
            }
          } catch (err) {
            Alert.alert("Lỗi", "Không thể xóa");
          }
        },
      },
    ]);
  };

  const openEdit = (voucher) => {
    setEditingVoucher(voucher);
    setForm({
      code: voucher.code,
      discount_percent: voucher.discount_percent.toString(),
      max_discount: voucher.max_discount?.toString() || "",
      min_order: voucher.min_order?.toString() || "",
      expired_at: voucher.expired_at.split("T")[0], // format YYYY-MM-DD
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingVoucher(null);
    setForm({
      code: "",
      discount_percent: "",
      max_discount: "",
      min_order: "",
      expired_at: "",
    });
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
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#E36631" }}>Quản lý Voucher</Text>
        <TouchableOpacity
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
          style={{ backgroundColor: "#E36631", padding: 12, borderRadius: 8 }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Tạo Voucher</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={vouchers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 10,
              marginVertical: 8,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.code}</Text>
                <Text>Giảm {item.discount_percent}% {item.max_discount && `(tối đa ${item.max_discount.toLocaleString()}₫)`}</Text>
                <Text>Đơn tối thiểu: {item.min_order ? item.min_order.toLocaleString() + "₫" : "Không"}</Text>
                <Text>Hết hạn: {new Date(item.expired_at).toLocaleDateString("vi-VN")}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity onPress={() => openEdit(item)}>
                  <Ionicons name="pencil" size={24} color="#E36631" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash" size={24} color="#f00" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 50 }}>Chưa có voucher nào</Text>}
      />

      {/* Modal tạo/sửa */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 15, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
              {editingVoucher ? "Sửa Voucher" : "Tạo Voucher Mới"}
            </Text>

            <TextInput
              placeholder="Mã voucher (VD: SALE50)"
              value={form.code}
              onChangeText={(t) => setForm({ ...form, code: t.toUpperCase() })}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 12 }}
            />

            <TextInput
              placeholder="Phần trăm giảm (1-100)"
              value={form.discount_percent}
              onChangeText={(t) => setForm({ ...form, discount_percent: t })}
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 12 }}
            />

            <TextInput
              placeholder="Giảm tối đa (₫, để trống nếu không giới hạn)"
              value={form.max_discount}
              onChangeText={(t) => setForm({ ...form, max_discount: t })}
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 12 }}
            />

            <TextInput
              placeholder="Đơn tối thiểu (₫, để trống nếu không yêu cầu)"
              value={form.min_order}
              onChangeText={(t) => setForm({ ...form, min_order: t })}
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 12 }}
            />

            <TextInput
              placeholder="Ngày hết hạn (YYYY-MM-DD)"
              value={form.expired_at}
              onChangeText={(t) => setForm({ ...form, expired_at: t })}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 20 }}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: "gray", fontSize: 16 }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit}>
                <Text style={{ color: "#E36631", fontWeight: "bold", fontSize: 16 }}>
                  {editingVoucher ? "Cập nhật" : "Tạo"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default AdminVouchers;