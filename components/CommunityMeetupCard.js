import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

export default function CommunityMeetupCard({
  meetup,
  isJoined,
  onPress,
  onCommentsPress,
  onJoinPress,
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.userRow}>
        <View style={styles.avatar}>
  {meetup.profileIMG_url ? (
    <Image
      source={{ uri: meetup.profileIMG_url }}
      style={styles.avatarImage}
      resizeMode="cover"
    />
  ) : (
    <Ionicons
      name="person"
      size={23}
      color={COLORS.blue}
    />
  )}
</View>

        <Text style={styles.username}>
          {meetup.username}
        </Text>

        <View style={styles.participants}>
          <Ionicons
            name="person-outline"
            size={17}
            color={COLORS.blue}
          />

          <Text style={styles.participantCount}>
            {meetup.participantCount}
          </Text>
        </View>
      </View>

      <View style={styles.locationRow}>
        <View style={styles.contentIndent} />

        <Ionicons
          name="location"
          size={20}
          color={COLORS.green}
        />

        <Text style={styles.location}>
          {meetup.location}
        </Text>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.contentIndent} />

        <View style={styles.detailItem}>
          <Ionicons
            name="calendar-outline"
            size={17}
            color={COLORS.blue}
          />

          <Text style={styles.detailText}>
            {meetup.date}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons
            name="time-outline"
            size={17}
            color={COLORS.blue}
          />

          <Text style={styles.detailText}>
            {meetup.time}
          </Text>
        </View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {meetup.category}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={onCommentsPress}
          accessibilityRole="button"
          accessibilityLabel={`View ${meetup.commentCount} comments`}
        >
          <Ionicons
            name="chatbubble-outline"
            size={23}
            color={COLORS.blue}
          />

          <Text style={styles.actionText}>
            {meetup.commentCount} Comments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={onJoinPress}
          accessibilityRole="button"
          accessibilityLabel={
            isJoined
              ? `Leave meetup at ${meetup.location}`
              : `Join meetup at ${meetup.location}`
          }
        >
          <Text
            style={[
              styles.actionText,
              isJoined && styles.joinedText,
            ]}
          >
            {isJoined ? "Joined" : "I’ll be there"}
          </Text>

          <Ionicons
            name={
              isJoined
                ? "checkmark-circle"
                : "checkmark-circle-outline"
            }
            size={22}
            color={
              isJoined
                ? COLORS.green
                : COLORS.blue
            }
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.offWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 18,

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  username: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "700",
  },

  participants: {
    flexDirection: "row",
    alignItems: "center",
  },

  participantCount: {
    color: COLORS.blue,
    fontSize: 15,
    marginLeft: 4,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  contentIndent: {
    width: 52,
  },

  location: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 16,
    marginLeft: 7,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },

  detailText: {
    color: COLORS.blue,
    fontSize: 14,
    marginLeft: 6,
  },

  categoryBadge: {
    marginLeft: "auto",
    backgroundColor: COLORS.lightgreen,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  categoryText: {
    color: COLORS.blue,
    fontSize: 14,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.midGray,
    marginTop: 12,
    marginBottom: 10,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionText: {
    color: COLORS.blue,
    fontSize: 15,
    marginHorizontal: 7,
    fontWeight: "500",
  },

  joinedText: {
    color: COLORS.green,
    fontWeight: "700",
  },
  avatarImage: {
  width: "100%",
  height: "100%",
  borderRadius: 21,
},
});