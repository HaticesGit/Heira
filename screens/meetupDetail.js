import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

const DEFAULT_MEETUP = {
  id: "1",
  title: "Tomorrowland",
  username: "SquishyChameleon",
  location: "Tomorrowland, Boom, Belgium",
  date: "Tuesday, 29 July 2026",
  time: "14:00",
  category: "Festival",
  participantCount: 12,
  commentCount: 4,
};

export default function MeetupDetailScreen({ navigation, route }) {
  const meetup = {
    ...DEFAULT_MEETUP,
    ...route.params?.meetup,
  };

  const [isJoined, setIsJoined] = useState(false);

  const toggleJoin = () => {
    setIsJoined((currentValue) => !currentValue);
  };

  const displayedParticipantCount =
    meetup.participantCount + (isJoined ? 1 : 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.screen}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>

            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons
                name="arrow-back"
                size={29}
                color={COLORS.blue}
              />
            </TouchableOpacity>

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {meetup.category}
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={39}
                color={COLORS.blue}
              />
            </View>

            <Text style={styles.title}>
              {meetup.title || meetup.location}
            </Text>

            <View style={styles.hostRow}>
              <Text style={styles.hostLabel}>Hosted by </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate("Profile")}
              >
                <Text style={styles.hostName}>
                  {meetup.username}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsSection}>
              <DetailRow
                icon="location"
                iconColor={COLORS.green}
                text={meetup.location}
              />

              <DetailRow
                icon="calendar"
                iconColor={COLORS.blue}
                text={meetup.date}
              />

              <DetailRow
                icon="time"
                iconColor={COLORS.blue}
                text={meetup.time}
              />
            </View>

            <TouchableOpacity
              style={styles.participantsSection}
              activeOpacity={0.75}
              onPress={() =>
                console.log("Participants pressed:", meetup.id)
              }
              accessibilityRole="button"
              accessibilityLabel={`View ${displayedParticipantCount} participants`}
            >
              <View style={styles.participantTitleRow}>
                <Ionicons
                  name="people"
                  size={20}
                  color={COLORS.blue}
                />

                <Text style={styles.participantTitle}>
                  {displayedParticipantCount} people joined
                </Text>
              </View>

              <View style={styles.avatarRow}>
                {[1, 2, 3, 4, 5].map((avatar) => (
                  <View
                    key={avatar}
                    style={[
                      styles.participantAvatar,
                      { marginLeft: avatar === 1 ? 0 : -8 },
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={19}
                      color={COLORS.blue}
                    />
                  </View>
                ))}

                {displayedParticipantCount > 5 ? (
                  <View style={styles.moreParticipants}>
                    <Text style={styles.moreParticipantsText}>
                      +{displayedParticipantCount - 5}
                    </Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.commentsButton}
            activeOpacity={0.8}
            onPress={() =>
              console.log("Comments pressed:", meetup.id)
            }
            accessibilityRole="button"
            accessibilityLabel={`View ${meetup.commentCount} comments`}
          >
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={COLORS.blue}
            />

            <Text style={styles.commentsButtonText}>
              {meetup.commentCount} Comments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.joinButton,
              isJoined && styles.joinButtonActive,
            ]}
            activeOpacity={0.8}
            onPress={toggleJoin}
            accessibilityRole="button"
            accessibilityLabel={
              isJoined ? "Leave meetup" : "Join meetup"
            }
          >
            <Ionicons
              name={
                isJoined
                  ? "checkmark-circle"
                  : "checkmark-circle-outline"
              }
              size={22}
              color={COLORS.offWhite}
            />

            <Text style={styles.joinButtonText}>
              {isJoined ? "Joined" : "I’ll be there"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ icon, iconColor, text }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons
        name={icon}
        size={22}
        color={iconColor}
      />

      <Text style={styles.detailText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.blue,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 28,
  },

    hero: {
        height: 180,
        backgroundColor: COLORS.lightBlue,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },

  backButton: {
    position: "absolute",
    top: 15,
    left: 18,
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryBadge: {
    position: "absolute",
    top: 18,
    right: 18,
    borderRadius: 10,
    backgroundColor: COLORS.lightgreen,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },

  categoryText: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "600",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 42,
  },

  avatar: {
    position: "absolute",
    top: -38,
    left: 20,
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 4,
    borderColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: COLORS.blue,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },

  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 34,
  },

  hostLabel: {
    color: COLORS.span,
    fontSize: 15,
  },

  hostName: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "600",
  },

  detailsSection: {
    marginBottom: 30,
  },

  detailRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
  },

  detailText: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 16,
    marginLeft: 17,
  },

  participantsSection: {
    alignSelf: "flex-start",
  },

  participantTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  participantTitle: {
    color: COLORS.blue,
    fontSize: 16,
    marginLeft: 15,
  },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 26,
  },

  participantAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 2,
    borderColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },

  moreParticipants: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 2,
    borderColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },

  moreParticipantsText: {
    color: COLORS.span,
    fontSize: 14,
    fontWeight: "600",
  },

  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: COLORS.offWhite,
    flexDirection: "row",
  },

  commentsButton: {
    flex: 0.9,
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  commentsButtonText: {
    color: COLORS.blue,
    fontSize: 15,
    marginLeft: 7,
  },

  joinButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  joinButtonActive: {
    opacity: 0.8,
  },

  joinButtonText: {
    color: COLORS.offWhite,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 7,
  },
});