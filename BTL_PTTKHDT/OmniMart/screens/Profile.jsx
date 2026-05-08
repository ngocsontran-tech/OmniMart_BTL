import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "../services/userService";
import { getShop } from "../services/sellerService";
import { getOrders, cancelOrder as apiCancelOrder } from "../services/orderService";
import { logout } from "../services/authService";

const Profile = () => {
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [latestOrder, setLatestOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [shop, setShop] = useState(null);

  const fetchData = async () => {
    try {
      // 1. Lấy profile người dùng
      const userData = await getProfile();
      setUser(userData);

      // 2. Nếu là SELLER → lấy thông tin shop (có balance)
      if (userData.role === "seller") {
        try {
          const shopData = await getShop();
          setShop(shopData);
        } catch (err) {
          console.error("Lỗi lấy shop:", err);
          setShop({ balance: 0 });
        }
      }

      // 3. Nếu là CUSTOMER → lấy đơn hàng mới nhất
      if (userData.role === "customer") {
        const ordersData = await getOrders();
        const sorted = ordersData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setLatestOrder(sorted[0] || null);
      }
    } catch (err) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
      await logout();
      navigation.replace("Login");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      "Hủy đơn hàng",
      "Bạn có chắc chắn muốn hủy đơn hàng này?\nHành động này không thể hoàn tác.",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            try {
              await apiCancelOrder(orderId);
              Alert.alert("Thành công", "Đơn hàng đã được hủy");
              fetchData();
            } catch (err) {
              Alert.alert("Lỗi", err.message || "Không thể hủy đơn");
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    };

    if (Platform.OS === "web") {
      const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
      if (confirm) {
        await doLogout();
      }
    } else {
      Alert.alert(
        "Xác nhận đăng xuất",
        "Bạn có chắc chắn muốn đăng xuất không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng xuất",
            style: "destructive",
            onPress: async () => {
              await doLogout();
            },
          },
        ]
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#E36631" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* ScrollView bao quanh toàn bộ nội dung chính */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{  }}
      >
        {/* Avatar & Info */}
        <View style={{ alignItems: "center"}}>
          <Image
            source={
              user?.avatar
                ? { uri: user.avatar }
                : require("../assets/images/img1.webp")
            }
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              borderWidth: 4,
              borderColor: "#E36631",
            }}
          />

          <Text style={{ fontSize: 26, fontWeight: "bold", marginTop: 15 }}>
            {user?.name || "Người dùng"}
          </Text>
          <Text style={{ fontSize: 18, color: "#666", marginTop: 5 }}>
            {user?.email}
          </Text>
        </View>

        {/* Đơn hàng mới nhất - chỉ cho customer */}
        {user?.role === "customer" && (
          <View style={{ marginHorizontal: 20, marginTop: 30 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#E36631" }}>
              Đơn hàng gần nhất
            </Text>

            {latestOrder ? (
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 15,
                  borderRadius: 12,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: "#eee",
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontWeight: "600" }}>Đơn hàng #{latestOrder.id}</Text>
                  <Text style={{ color: "#666", fontSize: 12 }}>
                    {new Date(latestOrder.created_at).toLocaleDateString("vi-VN")}
                  </Text>
                </View>

                <Text style={{ marginTop: 8, color: "#666" }}>
                  Tổng tiền: <Text style={{ fontWeight: "bold", color: "#E36631" }}>
                    {Number(latestOrder.total_price).toLocaleString()}₫
                  </Text>
                </Text>

                <Text style={{ marginTop: 8 }}>
                  Trạng thái: {" "}
                  <Text style={{ fontWeight: "bold", color: getStatusText(latestOrder.status).color }}>
                    {getStatusText(latestOrder.status).text}
                  </Text>
                </Text>

                {(latestOrder.status === "pending" || latestOrder.status === "paid") && (
                  <TouchableOpacity
                    onPress={() => handleCancelOrder(latestOrder.id)}
                    style={{
                      backgroundColor: "#F44336",
                      padding: 10,
                      borderRadius: 8,
                      alignItems: "center",
                      marginTop: 12,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Hủy đơn hàng</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => navigation.navigate("CustomerOrders")}
                  style={{ alignItems: "center", marginTop: 10 }}
                >
                  <Text style={{ color: "#E36631", fontWeight: "600" }}>Xem tất cả đơn hàng →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems: "center", padding: 30, backgroundColor: "#f9f9f9", borderRadius: 12 }}>
                <Ionicons name="receipt-outline" size={60} color="#ccc" />
                <Text style={{ marginTop: 10, color: "#999" }}>Chưa có đơn hàng nào</Text>
              </View>
            )}
          </View>
        )}
        {user?.role === "seller" && (
          <View style={{ marginHorizontal: 20, marginTop: 30 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#E36631" }}>
              Doanh thu cửa hàng
            </Text>

            <View
              style={{
                backgroundColor: "#fff",
                padding: 20,
                borderRadius: 12,
                elevation: 4,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#eee",
              }}
            >
              <Ionicons name="wallet-outline" size={60} color="#E36631" />
              <Text style={{ fontSize: 18, marginTop: 15, color: "#666" }}>
                Số dư hiện tại
              </Text>
              <Text style={{ fontSize: 28, fontWeight: "bold", color: "#E36631", marginTop: 8 }}>
                {shop?.balance ? Number(shop.balance).toLocaleString() : 0}₫
              </Text>

              {shop?.name && (
                <Text style={{ fontSize: 16, color: "#666", marginTop: 12 }}>
                  Cửa hàng: <Text style={{ fontWeight: "600" }}>{shop.name}</Text>
                </Text>
              )}

              <TouchableOpacity
                onPress={() => navigation.navigate("SellerOrders")}
                style={{
                  marginTop: 15,
                  backgroundColor: "#E36631",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Xem chi tiết đơn hàng</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {/* Actions */}
        <View
          style={{
            marginTop: 40,
            marginHorizontal: 20,
            marginBottom: 20,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#ddd",
            overflow: "hidden",
            backgroundColor: "#fff",
            elevation: 3,
          }}
        >
          <TouchableOpacity
            style={rowStyle}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Ionicons name="person-circle-outline" size={36} color="#E36631" />
            <Text style={textStyle}>Chỉnh sửa hồ sơ</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          {/* NÚT MỚI: Tin nhắn của tôi - hiển thị cho cả customer và seller */}
          <TouchableOpacity
            style={rowStyle}
            onPress={() => navigation.navigate("ChatList")}
          >
            <Ionicons name="chatbubbles-outline" size={36} color="#E36631" />
            <Text style={textStyle}>Tin nhắn của tôi</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          {/* Chỉ seller mới thấy quản lý đơn hàng */}
          {user?.role === "seller" && (
            <TouchableOpacity
              style={rowStyle}
              onPress={() => navigation.navigate("SellerOrders")}
            >
              <Ionicons name="basket-outline" size={36} color="#E36631" />
              <Text style={textStyle}>Quản lý đơn hàng</Text>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={rowStyle} onPress={() => setShowHelp(true)}>
            <Ionicons name="help-circle-outline" size={36} color="#E36631" />
            <Text style={textStyle}>Trợ giúp & Hỗ trợ</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={rowStyle} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={36} color="red" />
            <Text style={[textStyle, { color: "red" }]}>Đăng xuất</Text>
            <View />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Help - vẫn giữ nguyên ScrollView riêng bên trong */}
      <Modal visible={showHelp} transparent animationType="slide" onRequestClose={() => setShowHelp(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%", paddingBottom: 30 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: "#eee" }}>
              <Text style={{ fontSize: 22, fontWeight: "bold" }}>Trợ giúp & Hỗ trợ</Text>
              <TouchableOpacity onPress={() => setShowHelp(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 20 }}>Câu hỏi thường gặp</Text>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>Làm sao để đặt hàng?</Text>
                <Text style={{ fontSize: 16, lineHeight: 24, marginTop: 6 }}>
                  Chọn sản phẩm → Thêm vào giỏ hàng → Vào giỏ hàng → Nhấn Thanh toán → Điền địa chỉ → Đặt hàng.
                </Text>
              </View>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>Thời gian giao hàng bao lâu?</Text>
                <Text style={{ fontSize: 16, lineHeight: 24, marginTop: 6 }}>
                  Thường từ 2-5 ngày tùy khu vực. Bạn sẽ nhận thông báo khi đơn hàng được giao.
                </Text>
              </View>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>Phương thức thanh toán?</Text>
                <Text style={{ fontSize: 16, lineHeight: 24, marginTop: 6 }}>
                  Hiện tại hỗ trợ thanh toán khi nhận hàng (COD). Sắp tới sẽ có chuyển khoản và ví điện tử.
                </Text>
              </View>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>Đổi trả hàng thế nào?</Text>
                <Text style={{ fontSize: 16, lineHeight: 24, marginTop: 6 }}>
                  Liên hệ hỗ trợ trong vòng 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả.
                </Text>
              </View>
              <View style={{ marginBottom: 30 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>Liên hệ hỗ trợ</Text>
                <Text style={{ fontSize: 16, lineHeight: 24, marginTop: 6 }}>
                  Email: support@omnismart.com
                  {"\n"}Hotline: 1900-1234 (8h-20h hàng ngày)
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: "#E36631",
                  padding: 15,
                  borderRadius: 10,
                  alignItems: "center",
                }}
                onPress={() => Linking.openURL("mailto:support@omnismart.com")}
              >
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                  Gửi email hỗ trợ
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const rowStyle = {
  height: 70,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  backgroundColor: "#fff",
  borderBottomWidth: 1,
  borderColor: "#eee",
};

const textStyle = {
  fontSize: 18,
  flex: 1,
  marginLeft: 15,
  fontWeight: "500",
};

export default Profile;