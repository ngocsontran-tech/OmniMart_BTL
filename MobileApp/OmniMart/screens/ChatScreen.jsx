import React, { useState, useEffect, useCallback } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { View, ActivityIndicator, Alert } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { getProfile } from "../services/userService";
import { getMessages, sendMessage as apiSendMessage } from "../services/chatService";

export default function ChatScreen({ route }) {
  const { productId, shopName, sellerId, buyerName } = route.params;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");

  // Lấy thông tin user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const profile = await getProfile();
        setUserId(profile.id);
        setUserName(profile.name || "Bạn");
      } catch (err) {
        console.log("Load user error:", err);
        Alert.alert("Lỗi", "Không thể tải thông tin người dùng");
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Load lịch sử tin nhắn
  const fetchMessages = async () => {
    if (!userId) return;

    try {
      const data = await getMessages(productId);
      // GiftedChat yêu cầu tin mới nhất ở trên → reverse lại
      setMessages(data.reverse());
    } catch (err) {
      console.log("Fetch messages error:", err);
      Alert.alert("Lỗi", err.message || "Không tải được tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [productId, userId]);

  // Gửi tin nhắn
  const onSend = useCallback(
    async (newMessages = []) => {
      const text = newMessages[0].text.trim();
      if (!text) return;

      try {
        const { message: sentMessage } = await apiSendMessage(productId, text);
        // Thêm tin nhắn mới vào danh sách (gửi từ mình)
        setMessages((previous) => GiftedChat.append(previous, [sentMessage]));
      } catch (err) {
        console.log("Send error:", err);
        Alert.alert("Lỗi", err.message || "Không gửi được tin nhắn");
      }
    },
    [productId]
  );

  // Polling
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000); // Cập nhật mỗi 3 giây

    return () => clearInterval(interval);
  }, [userId, productId]);

  if (loading) {
  return (
    <ScreenWrapper>
      <ActivityIndicator size="large" color="#E36631" />
    </ScreenWrapper>
  );
}

return (
  <ScreenWrapper>
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: userId,
        name: userName,
      }}
      placeholder="Nhập tin nhắn..."
      textInputProps={{ autoFocus: true }}
      renderUsernameOnMessage={true}
      
      // ← DÒNG QUAN TRỌNG NHẤT – BẮT BUỘC THÊM
      isKeyboardInternallyHandled={false}
      
      // Tùy chọn thêm để đẹp hơn
      alwaysShowSend={true}
      scrollToBottom={true} // Luôn scroll xuống tin nhắn mới nhất
      scrollToBottomComponent={() => (
        <Ionicons name="arrow-down" size={24} color="#999" />
      )}
    />
  </ScreenWrapper>
);
}