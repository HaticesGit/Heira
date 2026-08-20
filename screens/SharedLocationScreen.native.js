import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

export default function SharedLocationScreen() {
  return (
    <View style={styles.screen}>
      <Ionicons
        name="location-outline"
        size={50}
        color={COLORS.blue}
      />

      <Text style={styles.title}>
        Shared location
      </Text>

      <Text style={styles.text}>
        Open the shared Heira link in
        your browser to view this live
        location.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: 30,
  },

  title: {
    color: COLORS.blue,
    fontSize: 21,
    fontWeight: "700",
    marginTop: 15,
  },

  text: {
    color: COLORS.span,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 8,
  },
});