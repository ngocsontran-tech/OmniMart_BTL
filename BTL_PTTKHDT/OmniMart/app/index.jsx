// app/index.jsx
import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "../services/userService";
import { logout } from "../services/authService";

import HomeTabs from "../components/HomeTabs";
import AdminTabs from "../components/AdminTabs";

import Detail from "../screens/Detail";
import Item from "../screens/Item";
import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import ProductList from "../screens/ProductList";
import EditProfile from "../screens/EditProfile";
import Checkout from "../screens/Checkout";
import OrderDetail from "../screens/OrderDetail";
import Review from "../screens/Review";
import SellerProducts from "../screens/SellerProducts";
import SellerDashboard from "../screens/SellerDashboard";
import AddEditProduct from "../screens/AddEditProduct";
import ProductVariants from "../screens/ProductVariants";

// Admin screens
import AdminDashboard from "../screens/AdminDashboard";
import AdminUsers from "../screens/AdminUsers";
import AdminProducts from "../screens/AdminProducts";
import AdminOrders from "../screens/AdminOrders";
import ForgotPassword from "../screens/ForgotPassword";
import SellerOrders from "../screens/SellerOrders";
import CustomerOrders from "../screens/CustomerOrders";
import ChatScreen from "../screens/ChatScreen";
import ChatList from "../screens/ChatList";

const Stack = createNativeStackNavigator();

export default function Index() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setInitialRoute("Login");
          setLoading(false);
          return;
        }

        // Gọi profile để lấy role
        const user = await getProfile();
        
        if (user.role === "admin") {
          setInitialRoute("AdminTabs");
        } else {
          setInitialRoute("HomeTabs");
        }
      } catch (err) {
        console.log(err);
        await logout(); // Token expired hoặc lỗi mạng, xóa token cho chắc
        setInitialRoute("Login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#E36631" />
      </View>
    );
  }

  return (
    <Stack.Navigator
  initialRouteName={initialRoute}
  screenOptions={{ headerShown: false }}
>
  <Stack.Screen name="Login" component={Login} />
  <Stack.Screen name="SignUp" component={SignUp} />
  <Stack.Screen name="ChatScreen" component={ChatScreen} />
  <Stack.Screen name="HomeTabs" component={HomeTabs} />
  <Stack.Screen name="AdminTabs" component={AdminTabs} />
  <Stack.Screen name="ProductList" component={ProductList} />
  <Stack.Screen name="Item" component={Item} />
  <Stack.Screen name="Detail" component={Detail} />
  <Stack.Screen name="EditProfile" component={EditProfile} />
  <Stack.Screen name="Checkout" component={Checkout} />
  <Stack.Screen name="OrderDetail" component={OrderDetail} />
  <Stack.Screen name="Review" component={Review} />
  <Stack.Screen name="SellerDashboard" component={SellerDashboard} />
  <Stack.Screen name="SellerProducts" component={SellerProducts} />
  <Stack.Screen name="AddEditProduct" component={AddEditProduct} />
  <Stack.Screen name="ProductVariants" component={ProductVariants} />
  <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
  <Stack.Screen name="AdminUsers" component={AdminUsers} />
  <Stack.Screen name="AdminProducts" component={AdminProducts} />
  <Stack.Screen name="AdminOrders" component={AdminOrders} />
  <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
  <Stack.Screen name="SellerOrders" component={SellerOrders} />
  <Stack.Screen name="CustomerOrders" component={CustomerOrders} />
    <Stack.Screen name="ChatList" component={ChatList} />
</Stack.Navigator>
  );
}