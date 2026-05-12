import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "", description: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
      } else {
        Alert.alert("Lỗi", "Không thể tải danh mục");
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên danh mục");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        Alert.alert("Thành công", "Tạo danh mục mới thành công");
        setModalVisible(false);
        setForm({ name: "", icon: "", description: "" });
        fetchCategories();
      } else {
        const data = await res.json();
        Alert.alert("Lỗi", data.message || "Không thể tạo");
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể kết nối");
    }
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
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#E36631" }}>Quản lý Danh mục</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{ backgroundColor: "#E36631", padding: 10, borderRadius: 8 }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Thêm mới</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 10,
              marginVertical: 8,
              elevation: 2,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {item.icon ? (
              <Image source={{ uri: item.icon }} style={{ width: 50, height: 50, borderRadius: 10, marginRight: 15 }} />
            ) : (
              <View style={{ width: 50, height: 50, backgroundColor: "#f0f0f0", borderRadius: 10, marginRight: 15, justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="layers" size={24} color="#ccc" />
              </View>
            )}
            
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.name}</Text>
              <Text style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                {item.description || "Không có mô tả"}
              </Text>
            </View>
            <Text style={{ color: "#aaa", fontSize: 12 }}>ID: #{item.id}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 50 }}>Chưa có danh mục nào</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 15, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>Tạo Danh mục</Text>

            <TextInput
              placeholder="Tên danh mục *"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 12 }}
            />

            <TextInput
              placeholder="Link Ảnh / Icon (URL)"
              value={form.icon}
              onChangeText={(t) => setForm({ ...form, icon: t })}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 12 }}
            />

            <TextInput
              placeholder="Mô tả"
              value={form.description}
              onChangeText={(t) => setForm({ ...form, description: t })}
              multiline
              numberOfLines={3}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 20, textAlignVertical: "top" }}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 15 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10 }}>
                <Text style={{ color: "gray", fontSize: 16 }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: "#E36631", padding: 10, borderRadius: 8 }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Lưu lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default AdminCategories;
