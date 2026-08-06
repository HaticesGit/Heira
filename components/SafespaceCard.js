import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

export default function SafespaceCard({ safespace, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open details for ${safespace.name}`}
    >
      <View style={styles.imagePlaceholder}>
        <Ionicons
          name="storefront-outline"
          size={38}
          color={COLORS.blue}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{safespace.name}</Text>

        <Text style={styles.distance}>
          {safespace.distance} away
        </Text>

        <View style={styles.detailRow}>
          <Ionicons
            name="location"
            size={17}
            color={COLORS.blue}
          />

          <Text style={styles.detailText}>
            {safespace.address}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="shield-checkmark"
            size={17}
            color={COLORS.blue}
          />

          <Text style={styles.detailText}>
            {safespace.safetyMeasure}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="time"
            size={17}
            color={COLORS.blue}
          />

          <Text style={styles.detailText}>
            {safespace.openingHours}
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={21}
        color={COLORS.blue}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 145,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.midGray,
    flexDirection: "row",
    alignItems: "center",
  },

  imagePlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 10,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  name: {
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 3,
  },

  distance: {
    color: COLORS.span,
    fontSize: 14,
    marginBottom: 8,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  detailText: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 13,
    marginLeft: 7,
  },
});