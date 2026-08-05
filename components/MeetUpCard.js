import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

export default function MeetupCard({ meetup, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.indicator} />

      <View style={styles.content}>
        <View style={styles.locationRow}>
          <Ionicons
            name="location"
            size={20}
            color={COLORS.green}
          />

          <Text
            style={styles.location}
            numberOfLines={1}
          >
            {meetup.location}
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detail}>
            <Ionicons
              name="calendar-outline"
              size={17}
              color={COLORS.blue}
            />

            <Text style={styles.detailText}>
              {meetup.date}
            </Text>
          </View>

          <View style={styles.detail}>
            <Ionicons
              name="time-outline"
              size={17}
              color={COLORS.blue}
            />

            <Text style={styles.detailText}>
              {meetup.time}
            </Text>
          </View>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color={COLORS.blue}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 88,
    backgroundColor: COLORS.offWhite,
    borderRadius: 10,
    marginBottom: 11,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: COLORS.midGray,

    shadowColor: COLORS.offBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.blue,
    marginRight: 14,
  },

  content: {
    flex: 1,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  location: {
    flex: 1,
    marginLeft: 7,
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "500",
  },

  details: {
    flexDirection: "row",
  },

  detail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 28,
  },

  detailText: {
    marginLeft: 6,
    color: COLORS.blue,
    fontSize: 14,
  },
});