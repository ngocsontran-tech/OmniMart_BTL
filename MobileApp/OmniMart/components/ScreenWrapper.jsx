import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, useWindowDimensions, StyleSheet } from "react-native";

const ScreenWrapper = ({ children, style }) => {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  return (
    <SafeAreaView style={[styles.container, style]} edges={['left', 'right', 'top']}>
      <View style={[
        styles.content,
        isWeb && styles.webContent
      ]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  webContent: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#eee",
  }
});

export default ScreenWrapper;