import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

export default function ReviewCard({ review, onUserPress }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.avatar}
        activeOpacity={0.8}
        onPress={onUserPress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${review.username}'s profile`}
      >
        <Ionicons name="person" size={22} color={COLORS.blue} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity activeOpacity={0.7} onPress={onUserPress}>
              <Text style={styles.username}>{review.username}</Text>
            </TouchableOpacity>

            <Text style={styles.date}>{review.date}</Text>
          </View>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= review.rating ? "star" : "star-outline"}
                size={17}
                color={star <= review.rating ? COLORS.yellow : COLORS.midGray}
              />
            ))}
          </View>
        </View>

        <Text style={styles.reviewText}>{review.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 116,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  content: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginRight: 8,
  },

  username: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "700",
    marginRight: 9,
  },

  date: {
    color: COLORS.span,
    fontSize: 13,
  },

  stars: {
    flexDirection: "row",
  },

  reviewText: {
    color: COLORS.blue,
    fontSize: 15,
    lineHeight: 21,
  },
});