// screens/ChatList.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../config/api";

export default function ChatList({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChatList = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
        navigation.replace("Login");
        return;
      }

      // Gọi API lấy danh sách các product mà user đã chat (có tin nhắn)
      const res = await fetch(`${API_URL}/chat/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Không tải được danh sách chat");

      const data = await res.json();
      setChats(data);
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", "Không thể tải danh sách tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatList();
    const unsubscribe = navigation.addListener("focus", fetchChatList);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        padding: 15,
        backgroundColor: "#fff",
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 12,
        elevation: 2,
      }}
      onPress={() =>
        navigation.navigate("ChatScreen", {
          productId: item.product_id,
          shopName: item.shop_name,
          sellerId: item.seller_id,
          buyerId: item.buyer_id,
          buyerName: item.buyer_name,
        })
      }
    >
      <Image
        source={{ uri: item.product_image || "https://via.placeholder.com/60" }}
        style={{ width: 60, height: 60, borderRadius: 10 }}
      />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.product_name}</Text>
        <Text style={{ color: "#666", marginTop: 4 }}>
          Chat với: {item.partner_name}
        </Text>
        <Text style={{ color: "#999", fontSize: 12, marginTop: 4 }}>
          Tin nhắn cuối: {new Date(item.last_message_at).toLocaleString("vi-VN")}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
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
      <Text style={{ fontSize: 24, fontWeight: "bold", margin: 20, textAlign: "center" }}>
        Tin nhắn của tôi
      </Text>

      {chats.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
          <Text style={{ marginTop: 20, color: "#999", fontSize: 18 }}>
            Chưa có cuộc trò chuyện nào
          </Text>
          <Text style={{ color: "#666", marginTop: 10 }}>
            Hãy chat với người bán từ trang sản phẩm!
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => String(item.product_id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
}