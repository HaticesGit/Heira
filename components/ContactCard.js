import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

export default function ContactCard({
  name,
  phone,
  onPress,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Ionicons
          name="person"
          size={24}
          color={COLORS.blue}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>
          {name}
        </Text>

        <Text style={styles.phone}>
          {phone}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        activeOpacity={0.8}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${name}`}
      >
        <Ionicons
          name="create-outline"
          size={20}
          color={COLORS.blue}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,

    backgroundColor: COLORS.offWhite,

    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightBlue,

    flexDirection: "row",
    alignItems: "center",

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,

    backgroundColor: COLORS.lightBlue,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  name: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },

  phone: {
    color: COLORS.span,
    fontSize: 14,
  },

  editButton: {
    width: 38,
    height: 38,

    borderRadius: 8,

    backgroundColor: COLORS.lightBlue,

    alignItems: "center",
    justifyContent: "center",
  },
});