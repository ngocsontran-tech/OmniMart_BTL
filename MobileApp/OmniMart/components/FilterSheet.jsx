import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";

const FilterSheet = ({ visible, onClose, onSort }) => {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <View style={{
          backgroundColor: "#fff",
          padding: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20
        }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Sort by
          </Text>

          <TouchableOpacity onPress={() => { onSort("price_asc"); onClose(); }}>
            <Text style={{ padding: 10 }}>Price ↑</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { onSort("price_desc"); onClose(); }}>
            <Text style={{ padding: 10 }}>Price ↓</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { onSort("rating"); onClose(); }}>
            <Text style={{ padding: 10 }}>Rating</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={{ textAlign: "center", marginTop: 10, color: "red" }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FilterSheet;
