import React, { useState, useEffect } from "react";
import { Image, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "expo-router";
import ScreenWrapper from "../components/ScreenWrapper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../services/authService";

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");

      if (token && user) {
        navigation.replace("HomeTabs");
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);

      if (data.user.role === "admin") {
        navigation.replace("AdminTabs");
      } else {
        navigation.replace("HomeTabs");
      }
    } catch (err) {
      Alert.alert("Login Failed", err.message || "Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };





  return (
    <ScreenWrapper>
      <View style = {{justifyContent:"center",alignItems:"center", marginTop:50}}>
        <Image style = {{justifyContent:"center",alignItems:"center"}} source={require("../assets/images/Logo_OmniMart.png")} />
      </View>
      <View style = {{marginTop:50}}>
        <Text style = {{color:"gray"}}>Please login to continue</Text>
       <View style={{
          width: "100%",
          height: 50,
          borderColor: "#E36631",
          borderWidth: 2,
          borderRadius: 15,
          marginTop: 30,
          backgroundColor: "#fff",   
          
          // iOS shadow
          shadowColor: "#E36631",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.4,
          shadowRadius: 4,

          elevation: 4,
          justifyContent:"center",
          
        }}>
          <View style = {{marginLeft:10,flexDirection:"row", alignItems:"center"}}>
            <Icon name="email" size={30} color="gray" />
        <TextInput
          style={{ marginLeft:10, flex: 1, fontSize:15 }}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />



          </View>

        </View>
        <View style={{
          width: "100%",
          height: 50,
          borderColor: "#E36631",
          borderWidth: 2,
          borderRadius: 15,
          marginTop: 10,
          backgroundColor: "#fff",   
          
      
          shadowColor: "#E36631",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.4,
          shadowRadius: 4,

          elevation: 4,
          justifyContent:"center",
          
        }}>
          <View style = {{marginLeft:10,flexDirection:"row", alignItems:"center"}}>
            <Icon name="key" size={30} color="gray" />
            <TextInput
              style={{ marginLeft:10, flex: 1, fontSize:15 }}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />


            <TouchableOpacity style = {{marginRight:10}} onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "visibility" : "visibility-off"} size={24} />
            </TouchableOpacity>


          </View>
          
        </View>
        <TouchableOpacity 
            style={{ marginTop: 10, alignSelf: "flex-end" }}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={{ color: "#E36631", fontWeight: "600" }}>
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>
        <TouchableOpacity style = {{
          width:"100%",
          height:60,
          backgroundColor:"#E36631",
          marginTop:20, 
          borderRadius:25,
          shadowColor: "#444444ff",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.4,
          shadowRadius: 4,
          elevation: 4,
             opacity: loading ? 0.7 : 1,
          justifyContent:"center",
          alignItems:"center"
          }}
          disabled={loading} 
           onPress={handleLogin}
          >
          <Text style = {{fontSize:24,color:"white",fontWeight:"bold"}}>{loading ? "Logging in..." : "Login"}</Text>
        </TouchableOpacity>
         <View style = {{marginTop:20,justifyContent:"flex-end",flexDirection:"row"}}>
            <Text>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={{ color: "#E36631" }}>Sign Up</Text>
            </TouchableOpacity>

        </View>
      </View>
     
    </ScreenWrapper>
  )
}

export default Login