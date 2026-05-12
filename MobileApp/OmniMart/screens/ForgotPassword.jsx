// screens/ForgotPassword.jsx (hoặc file bạn đang dùng)
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }
    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          fullName: fullName.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Lỗi", data.message || "Có lỗi xảy ra");
        setLoading(false);
        return;
      }

      Alert.alert(
        "Yêu cầu đã được gửi thành công!",
        "Chúng tôi đã nhận thông tin của bạn.\nAdmin sẽ kiểm tra và liên hệ sớm để cấp lại mật khẩu.\nCảm ơn bạn đã kiên nhẫn!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert("Lỗi kết nối", "Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 20, marginTop: 30 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
          Quên mật khẩu
        </Text>
        <Text style={{ textAlign: "center", color: "#666", marginBottom: 30, lineHeight: 22 }}>
          Để bảo mật tài khoản, vui lòng cung cấp đầy đủ thông tin dưới đây.\nChúng tôi sẽ xác minh và hỗ trợ bạn lấy lại mật khẩu trong vòng 24h.
        </Text>

        <TextInput
          placeholder="Email đăng ký tài khoản"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={inputStyle}
        />

        <TextInput
          placeholder="Họ và tên đầy đủ"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          style={inputStyle}
        />

        <TextInput
          placeholder="Số điện thoại (ví dụ: 0901234567)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={inputStyle}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: "#E36631",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            marginTop: 20,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              Gửi yêu cầu lấy lại mật khẩu
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20, alignItems: "center" }}
        >
          <Text style={{ color: "#E36631", fontWeight: "600", fontSize: 16 }}>
            ← Quay lại đăng nhập
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

const inputStyle = {
  borderWidth: 1,
  borderColor: "#ccc",
  padding: 15,
  borderRadius: 10,
  marginBottom: 15,
  backgroundColor: "#fff",
  fontSize: 16,
};

export default ForgotPassword;