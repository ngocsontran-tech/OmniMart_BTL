import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import API_URL from "../config/api";

const OrderDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD ORDER =================
  const loadOrder = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Cannot load order");

      const data = await res.json();
      setOrder(data.order);
      setItems(data.items);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Cannot load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, []);

  // ================= HANDLE REVIEW =================
const handleReview = (item) => {
  console.log("id order detail:"+item.product_id)
  navigation.navigate("Review", {
    product: {
      id: item.product_id, 
      product_name: item.product_name,
      price: item.price,
      size: item.size,
      color: item.color,
    },
    orderId: order.id,
  });
};





  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E36631" />
      </View>
    );

  if (!order) return null;

  return (
    <ScrollView style={styles.container}>
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#E36631" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* ORDER INFO */}
      <Text style={styles.title}>Order #{order.id}</Text>
      <Text>Status: {order.status}</Text>
      <Text>Total: {Number(order.total_price).toLocaleString()}₫</Text>
      <Text>Placed on: {new Date(order.created_at).toLocaleDateString()}</Text>

      {/* ORDER ITEMS */}
      <Text style={[styles.title, { marginTop: 20 }]}>Products</Text>
     {items.map((item) => (
        <View key={item.id} style={styles.itemBox}>
          <Text style={styles.itemName}>{item.product_name}</Text>
          <Text>Variant: {item.size || "-"} / {item.color || "-"}</Text>
          <Text>Price: {Number(item.price).toLocaleString()}₫</Text>
          <Text>Quantity: {item.quantity}</Text>

          {!item.reviewed && order.status === "completed" && (
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => handleReview(item)}
            >
              <Text style={styles.reviewText}>Write Review</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

    </ScrollView>
  );
};

export default OrderDetail;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  itemBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemName: { fontWeight: "bold", fontSize: 16 },
  reviewBtn: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#E36631",
    borderRadius: 8,
    alignItems: "center",
  },
  reviewText: { color: "#fff", fontWeight: "bold" },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { color: "#E36631", marginLeft: 5, fontWeight: "bold" },
});
