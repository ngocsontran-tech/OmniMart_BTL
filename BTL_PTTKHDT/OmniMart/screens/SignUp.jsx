import React, { useState } from "react";
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "expo-router"; // hoặc "@react-navigation/native"
import ScreenWrapper from "../components/ScreenWrapper";
import API_URL from "../config/api"; // Dùng API_URL thay vì hardcode IP

const SignUp = () => {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSeller, setIsSeller] = useState(false);
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(false);

  const showAlert = (title, message, onPress) => {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`);
      if (onPress) onPress();
    } else {
      Alert.alert(title, message, onPress ? [{ text: "OK", onPress }] : []);
    }
  };

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      showAlert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      showAlert("Lỗi", "Email không hợp lệ");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Lỗi", "Mật khẩu không khớp");
      return;
    }

    if (password.length < 6) {
      showAlert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (isSeller && !shopName.trim()) {
      showAlert("Lỗi", "Vui lòng nhập tên cửa hàng");
      return;
    }

    setLoading(true);

    try {
      const body = {
        email: email.trim(),
        password,
        name: name.trim(),
        is_seller: isSeller,
        shop_name: isSeller ? shopName.trim() : null,
      };

      console.log("Registering with:", `${API_URL}/auth/register`);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert("Đăng ký thất bại", data.message || "Email đã tồn tại hoặc có lỗi xảy ra");
        return;
      }

      showAlert(
        "Thành công! 🎉",
        isSeller
          ? "Tài khoản Seller & Cửa hàng đã được tạo!"
          : "Tài khoản Customer đã được tạo!",
        () => navigation.replace("Login")
      );
    } catch (err) {
      showAlert("Lỗi", "Không thể kết nối server. Vui lòng kiểm tra lại kết nối mạng.");
      console.error("SignUp error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 50, // Đảm bảo nút cuối không bị che
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={{ justifyContent: "center", alignItems: "center", marginTop: 30, marginBottom: 30 }}>
            <Image source={require("../assets/images/Logo_OmniMart.png")} style={{ width: 150, height: 150 }} resizeMode="contain" />
          </View>

          <Text style={{ color: "gray", textAlign: "center", fontSize: 16, marginBottom: 30 }}>
            Đăng ký để bắt đầu bán hàng hoặc mua sắm
          </Text>

          {/* NAME */}
          <View style={styles.inputBox}>
            <View style={styles.inputRow}>
              <Icon name="person" size={28} color="#E36631" />
              <TextInput
                style={styles.input}
                placeholder="Họ và tên của bạn"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* EMAIL */}
          <View style={styles.inputBox}>
            <View style={styles.inputRow}>
              <Icon name="email" size={28} color="#E36631" />
              <TextInput
                style={styles.input}
                placeholder="Email của bạn"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* PASSWORD */}
          <View style={styles.inputBox}>
            <View style={styles.inputRow}>
              <Icon name="lock" size={28} color="#E36631" />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* CONFIRM PASSWORD */}
          <View style={styles.inputBox}>
            <View style={styles.inputRow}>
              <Icon name="lock-outline" size={28} color="#E36631" />
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          {/* CHECKBOX SELLER */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: isSeller ? "#E36631" : "#ddd",
              marginTop: 20,
            }}
            onPress={() => setIsSeller(!isSeller)}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "#E36631",
                backgroundColor: isSeller ? "#E36631" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              {isSeller && <Icon name="check" size={16} color="#fff" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", fontSize: 16 }}>
                Đăng ký làm Seller (Chủ cửa hàng)
              </Text>
              <Text style={{ color: "#666", fontSize: 14, marginTop: 2 }}>
                Tự động tạo cửa hàng riêng khi đăng ký
              </Text>
            </View>
          </TouchableOpacity>

          {/* TÊN SHOP - CHỈ HIỆN KHI CHỌN SELLER */}
          {isSeller && (
            <View style={styles.inputBox}>
              <View style={styles.inputRow}>
                <Icon name="store" size={28} color="#E36631" />
                <TextInput
                  style={styles.input}
                  placeholder="Tên cửa hàng của bạn *"
                  value={shopName}
                  onChangeText={setShopName}
                />
              </View>
            </View>
          )}

          {/* NÚT ĐĂNG KÝ */}
          <TouchableOpacity
            style={[
              styles.btn,
              {
                opacity: loading ? 0.7 : 1,
                backgroundColor: loading ? "#ccc" : "#E36631",
              },
            ]}
            disabled={loading}
            onPress={handleSignUp}
          >
            <Text style={styles.btnText}>
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </Text>
          </TouchableOpacity>

          {/* ĐĂNG NHẬP */}
          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "gray" }}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text style={{ color: "#E36631", fontWeight: "600" }}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = {
  inputBox: {
    width: "100%",
    height: 50,
    borderColor: "#E36631",
    borderWidth: 2,
    borderRadius: 15,
    marginTop: 20,
    backgroundColor: "#fff",
    shadowColor: "#E36631",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: "center",
  },
  inputRow: {
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  btn: {
    width: "100%",
    height: 60,
    marginTop: 30,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#444",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  btnText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
};

export default SignUp;