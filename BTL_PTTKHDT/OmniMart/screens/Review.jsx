import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import API_URL from "../config/api";

const Review = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product, orderId } = route.params;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    if (!comment.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập bình luận");
      return;
    }
    console.log({
        product_id: product.id,
        order_id: orderId,
        rating,
        comment,
        });

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Bạn cần đăng nhập");
        return;
      }

      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          order_id: orderId,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Lỗi", data.message || "Không thể gửi đánh giá");
        return;
      }

      Alert.alert("Thành công", "Đã gửi đánh giá");
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
        >
            <MaterialIcons name="arrow-back" size={24} color="#E36631" />
            <Text style={styles.backText}>Thoát</Text>
        </TouchableOpacity>
      <Text style={styles.title}>Đánh giá sản phẩm</Text>
      <Text style={styles.productName}>{product.product_name}</Text>

      <Text style={styles.section}>Chọn số sao</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <MaterialIcons
              name={i <= rating ? "star" : "star-border"}
              size={40}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>Bình luận</Text>
      <TextInput
        style={styles.input}
        placeholder="Viết bình luận của bạn..."
        multiline
        numberOfLines={4}
        value={comment}
        onChangeText={setComment}
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.6 }]}
        onPress={submitReview}
        disabled={loading}
      >
        <Text style={styles.btnText}>Gửi đánh giá</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Review;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    marginBottom: 20,
  },
  section: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
  },
  btn: {
    backgroundColor: "#E36631",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backBtn: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 15,
},
backText: {
  color: "#E36631",
  marginLeft: 5,
  fontWeight: "bold",
},

});
