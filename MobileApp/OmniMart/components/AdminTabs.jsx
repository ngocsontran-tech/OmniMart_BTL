// components/AdminTabs.jsx
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AdminDashboard from "../screens/AdminDashboard";
import AdminUsers from "../screens/AdminUsers";
import AdminProducts from "../screens/AdminProducts";
import AdminOrders from "../screens/AdminOrders";
import AdminVouchers from "../screens/AdminVouchers"; // ← THÊM IMPORT NÀY

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#E36631",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "AdminDashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "AdminUsers") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "AdminProducts") {
            iconName = focused ? "cube" : "cube-outline";
          } else if (route.name === "AdminOrders") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "AdminVouchers") {
            iconName = focused ? "pricetag" : "pricetag-outline"; // Icon voucher đẹp
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ title: "Tổng quan" }}
      />
      <Tab.Screen
        name="AdminUsers"
        component={AdminUsers}
        options={{ title: "Người dùng" }}
      />
      <Tab.Screen
        name="AdminProducts"
        component={AdminProducts}
        options={{ title: "Sản phẩm" }}
      />
      <Tab.Screen
        name="AdminOrders"
        component={AdminOrders}
        options={{ title: "Đơn hàng" }}
      />
      {/* THÊM TAB VOUCHER */}
      <Tab.Screen
        name="AdminVouchers"
        component={AdminVouchers}
        options={{ title: "Voucher" }}
      />
    </Tab.Navigator>
  );
}