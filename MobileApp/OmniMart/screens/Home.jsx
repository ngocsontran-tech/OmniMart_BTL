import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ScreenWrapper from "../components/ScreenWrapper";
import { getHome } from "../services/productService";
import { getProfile } from "../services/userService";

const Home = () => {
  const navigation = useNavigation();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const loadHome = async () => {
    try {
      setLoading(true);
      const data = await getHome();
      setCategories(data.categories || []);
      setProducts(data.products || []);
    } catch (err) {
      console.log("Home error:", err);
      Alert.alert("Error", "Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const data = await getProfile();
      setUserRole(data.role);
    } catch (err) {
      console.log("Profile error:", err);
    }
  };

  // Load lần đầu
  useEffect(() => {
    loadUserProfile();
    loadHome();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadHome();
    }, [])
  );

  const onSearch = () => {
    if (!search.trim()) return;
    navigation.navigate("ProductList", { search });
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={{
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        elevation: 3,
      }}
      onPress={() => navigation.navigate("Item", { id: item.id })}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: "100%", height: 120, borderRadius: 8 }}
      />
      <Text style={{ fontWeight: "600", marginTop: 8 }} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={{ color: "#E36631", marginTop: 4, fontWeight: "600" }}>
        {item.price?.toLocaleString()}₫
      </Text>
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
      {userRole === "seller" && (
        <TouchableOpacity
          style={{
            backgroundColor: "#E36631",
            padding: 12,
            borderRadius: 10,
            marginBottom: 15,
          }}
          onPress={() => navigation.navigate("SellerProducts")}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
            Manage My Products
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={{ fontSize: 28, fontWeight: "bold", color: "#E36631" }}>
              OmniMart
            </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 30,
          paddingHorizontal: 15,
          height: 45,
          marginVertical: 15,
          backgroundColor: "#fff",
        }}
      >
        <Icon name="search" size={22} color="#999" />

        <TextInput
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={onSearch}
          style={{ marginLeft: 10, flex: 1 }}
          returnKeyType="search" 
        />


        {(search.trim().length > 0) && (
          <TouchableOpacity onPress={onSearch} style={{ padding: 5 }}>
            <Icon name="arrow-forward" size={24} color="#E36631" />
          </TouchableOpacity>
        )}
      </View>

            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
              Categories
            </Text>

            <FlatList
              data={categories}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: parent }) => (
                <View style={{ marginRight: 20 }}>
                  <Text style={{ fontWeight: "600" }}>{parent.name}</Text>
                  <View style={{ flexDirection: "row", marginTop: 6 }}>
                    {parent.children?.map((child) => (
                      <TouchableOpacity
                        key={child.id}
                        style={{
                          borderWidth: 1,
                          borderColor: "#E36631",
                          borderRadius: 20,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          marginRight: 8,
                        }}
                        onPress={() =>
                          navigation.navigate("ProductList", {
                            category_id: child.id,
                            category_name: child.name,
                          })
                        }
                      >
                        <Text style={{ color: "#E36631", fontSize: 13 }}>
                          {child.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            />

            <Text style={{ fontSize: 18, fontWeight: "600", marginVertical: 15 }}>
              New Products
            </Text>
          </>
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 30 }}>
            No products found
          </Text>
        }
      />
    </ScreenWrapper>
  );
};

export default Home;