// screens/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchUsers = async (reset = false) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/admin/users?page=${reset ? 1 : page}&limit=20&search=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { data, total } = await res.json();

      if (reset) {
        setUsers(data);
      } else {
        setUsers((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === 20);
      if (reset) setPage(1);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
  }, [search]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(page + 1);
      fetchUsers();
    }
  };

  const toggleActive = async (userId, currentActive) => {
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn ${currentActive ? "khóa" : "mở khóa"} tài khoản này?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await fetch(`${API_URL}/admin/users/${userId}/toggle-active`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
              });
              setUsers((prev) =>
                prev.map((u) =>
                  u.id === userId ? { ...u, is_active: !currentActive } : u
                )
              );
            } catch (err) {
              Alert.alert("Lỗi", "Không thể thay đổi trạng thái");
            }
          },
        },
      ]
    );
  };

  const changeRole = async (userId, newRole) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      Alert.alert("Thành công", `Đã đổi role thành ${newRole}`);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể đổi role");
    }
  };

  const renderUser = ({ item }) => (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.name || "Chưa đặt tên"}</Text>
      <Text style={{ color: "#555", marginVertical: 4 }}>{item.email}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
        <View
          style={{
            backgroundColor: item.is_active ? "#4CAF50" : "#F44336",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 12 }}>
            {item.is_active ? "Hoạt động" : "Bị khóa"}
          </Text>
        </View>
        <Text style={{ marginLeft: 10, fontWeight: "600", color: "#E36631" }}>
          {item.role.toUpperCase()}
        </Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
        <TouchableOpacity
          onPress={() => toggleActive(item.id, item.is_active)}
          style={{
            backgroundColor: item.is_active ? "#F44336" : "#4CAF50",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            marginRight: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 12 }}>
            {item.is_active ? "Khóa" : "Mở khóa"}
          </Text>
        </TouchableOpacity>

        {item.role !== "admin" && (
          <TouchableOpacity
            onPress={() =>
              changeRole(item.id, item.role === "seller" ? "customer" : "seller")
            }
            style={{
              backgroundColor: "#2196F3",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>
              {item.role === "seller" ? "→ Customer" : "→ Seller"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#E36631" }}>
        Quản lý Người dùng
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          borderRadius: 30,
          paddingHorizontal: 15,
          marginBottom: 15,
        }}
      >
        <Icon name="search" size={22} color="#999" />
        <TextInput
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1, paddingVertical: 12, marginLeft: 10 }}
        />
      </View>

      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#E36631" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 50, color: "#999" }}>
              Không tìm thấy người dùng
            </Text>
          }
        />
      )}
    </ScreenWrapper>
  );
};

export default AdminUsers;