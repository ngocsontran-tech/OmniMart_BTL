import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../config/api";

const Favorite = () => {
  const navigation = useNavigation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD FAVORITES =================
  const loadFavorites = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.replace("Login");
        return;
      }

      const res = await fetch(`${API_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.log("Load favorites error:", err);
    } finally {
      setLoading(false);
    }
  };

 useFocusEffect(
    useCallback(() => {
      loadFavorites();

      // Optional: cleanup nếu cần (hiếm khi dùng)
      // return () => console.log("Favorite unfocused");
    }, [])
  );

  // ================= REMOVE FAVORITE =================
  const removeItem = async (product_id) => {
    try {
      const token = await AsyncStorage.getItem("token");

      await fetch(`${API_URL}/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id }),
      });

      // cập nhật UI
      setData(prev => prev.filter(item => item.id !== product_id));
    } catch (err) {
      Alert.alert("Error", "Remove failed");
    }
  };

  // ================= RENDER =================
  const renderItem = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        height: 120,
        alignItems: "center",
        backgroundColor: "#f2f2f2",
        marginBottom: 15,
        borderRadius: 12,
        padding: 10,
      }}
    >
      {/* IMAGE + NAV ITEM */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Item", {
            id: item.id,
          })
        }
      >
        <Image
          source={{ uri: item.image }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 10,
          }}
        />
      </TouchableOpacity>

      {/* INFO */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {item.name}
        </Text>
        <Text style={{ color: "#E36631", marginTop: 6 }}>
          ${item.price}
        </Text>
      </View>

      {/* ACTIONS */}
      <View>
        {/* CART */}
        <TouchableOpacity
          style={btnStyle}
          onPress={() =>
            navigation.navigate("Item", {
              id: item.id,
            })
          }
        >
          <Ionicons name="cart-outline" size={22} color="#fff" />
        </TouchableOpacity>

        {/* DELETE */}
        <TouchableOpacity
          style={[btnStyle, { marginTop: 10, backgroundColor: "#999" }]}
          onPress={() => removeItem(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ================= UI =================
  if (loading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="large" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>
        Favourite
      </Text>

      {data.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          No favorite products
        </Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
};

// ================= STYLES =================
const btnStyle = {
  backgroundColor: "#E36631",
  padding: 10,
  borderRadius: 10,
  alignItems: "center",
};

export default Favorite;
