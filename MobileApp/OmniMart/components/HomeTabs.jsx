import { Ionicons } from "@expo/vector-icons";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Cart from "../screens/Cart";
import Favorite from "../screens/Favorite";
import Home from "../screens/Home";
import Profile from "../screens/Profile";



const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
          else if (route.name === "Cart") iconName = focused ? "cart" : "cart-outline";
          else if (route.name === "Favorite") 
  iconName = focused ? "heart" : "heart-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Cart" component={Cart} />
        <Tab.Screen name="Favorite" component={Favorite} />
        <Tab.Screen name="Profile" component={Profile} />
        
   
    </Tab.Navigator>
  );
}
