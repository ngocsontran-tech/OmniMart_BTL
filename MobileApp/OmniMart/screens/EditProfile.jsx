import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";
import ScreenWrapper from "../components/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";

import API_URL from "../config/api";

const SUPABASE_PROJECT_ID = "lcqaxixezqctnmuqcpfn";
const SUPABASE_BUCKET = "avatars";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const EditProfile = () => {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ================= LOAD PROFILE =================
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        navigation.replace("Login");
        return;
      }

      const res = await fetch(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Unauthorized");
      }

      const data = await res.json();
      setName(data.name || "");
      setPhone(data.phone || "");
      setAvatar(data.avatar || null);
    } catch (err) {
      console.log("EditProfile error:", err);
      Alert.alert("Error", "Please login again");
      await AsyncStorage.removeItem("token");
      navigation.replace("Login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ================= PICK IMAGE =================
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  // ================= UPLOAD AVATAR QUA BACKEND =================
  const uploadAvatarToServer = async (uri) => {
    try {
      const fileName = `avatar_${Date.now()}.jpg`;

      const formData = new FormData();
      formData.append('avatar', {
        uri: uri,
        name: fileName,
        type: 'image/jpeg',
      });

      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_URL}/user/upload-avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      if (!result.success || !result.avatarUrl) {
        throw new Error('Không nhận được URL avatar từ server');
      }

      console.log('Avatar uploaded:', result.avatarUrl);
      return result.avatarUrl;
    } catch (err) {
      console.error('Upload avatar error:', err);
      Alert.alert('Lỗi', 'Không thể upload avatar. Vui lòng thử lại.');
      throw err;
    }
  };

  // ================= SAVE PROFILE =================
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Tên không được để trống');
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      let avatarUrl = avatar;

      // Chỉ upload nếu là ảnh mới (local uri)
      if (avatar && (avatar.startsWith('file://') || avatar.startsWith('content://') || avatar.startsWith('blob:'))) {
        avatarUrl = await uploadAvatarToServer(avatar);
      }

      const res = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          avatar: avatarUrl,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Update failed: ${errText}`);
      }

      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công');
      navigation.goBack();
    } catch (err) {
      console.error('Save profile error:', err);
      Alert.alert('Lỗi', 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

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
      
      {/* ===== Header ===== */}
<View
  style={{
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  }}
>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back" size={28} color="#000000ff" />
  </TouchableOpacity>

  <Text
    style={{
      fontSize: 26,
      fontWeight: "bold",
      marginLeft: 15,
    }}
  >
    Edit Profile
  </Text>
</View>


      {/* Avatar */}
      <TouchableOpacity onPress={pickImage} style={{ alignItems: "center" }}>
        <Image
          source={
            avatar
              ? { uri: avatar }
              : require("../assets/images/img1.webp")
          }
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 2,
            borderColor: "#E36631",
          }}
        />
        <Text style={{ color: "#E36631", marginTop: 10 }}>
          Change avatar
        </Text>
      </TouchableOpacity>

      {/* Name */}
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={inputStyle}
      />

      {/* Phone */}
      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={inputStyle}
      />

      {/* Save */}
      <TouchableOpacity
        style={btnStyle}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={{ color: "white", fontSize: 20 }}>
          {saving ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

// ================= STYLES =================
const inputStyle = {
  borderWidth: 1,
  borderColor: "#E36631",
  borderRadius: 15,
  padding: 15,
  marginTop: 20,
  fontSize: 16,
};

const btnStyle = {
  marginTop: 30,
  backgroundColor: "#E36631",
  height: 55,
  borderRadius: 25,
  alignItems: "center",
  justifyContent: "center",
};

export default EditProfile;
