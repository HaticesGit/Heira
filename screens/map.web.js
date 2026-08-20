import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { COLORS } from "../constants/colors";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Map is available in the mobile app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.offWhite,
    padding: 20,
  },

  title: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});