import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import MeetupCard from "../components/MeetUpCard";
import { COLORS } from "../constants/colors";

const DEFAULT_USER = {
  id: "1",
  username: "SquishyChameleon",
  followers: 42,
  following: 67,
  isVerified: true,
  bio: "I love festivals, concerts and meeting new people.",
};

const USER_MEETUPS = [
  {
    id: "1",
    location: "Tomorrowland, Boom",
    date: "29/07/26",
    time: "14:00",
    username: "SquishyChameleon",
    category: "Festival",
    participantCount: 12,
    commentCount: 4,
  },
  {
    id: "2",
    location: "Brussels Central",
    date: "02/08/26",
    time: "21:30",
    username: "SquishyChameleon",
    category: "Night out",
    participantCount: 8,
    commentCount: 6,
  },
];

export default function UserProfileScreen({ navigation, route }) {
  const user = {
    ...DEFAULT_USER,
    ...route.params?.user,
  };

  const [isFollowing, setIsFollowing] = useState(false);

  const toggleFollow = () => {
    setIsFollowing((currentValue) => !currentValue);
  };

  const displayedFollowers = user.followers + (isFollowing ? 1 : 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.blue} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile</Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={62} color={COLORS.blue} />
            </View>

            <View style={styles.usernameRow}>
              <Text style={styles.username}>@{user.username}</Text>

              {user.isVerified ? (
                <Ionicons
                  name="shield-checkmark"
                  size={21}
                  color={COLORS.blue}
                />
              ) : null}
            </View>

            <Text style={styles.bio}>{user.bio}</Text>

            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statItem}
                activeOpacity={0.7}
                onPress={() => console.log("Followers pressed")}
              >
                <Text style={styles.statNumber}>{displayedFollowers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>

              <View style={styles.statsDivider} />

              <TouchableOpacity
                style={styles.statItem}
                activeOpacity={0.7}
                onPress={() => console.log("Following pressed")}
              >
                <Text style={styles.statNumber}>{user.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followButtonActive,
              ]}
              activeOpacity={0.8}
              onPress={toggleFollow}
              accessibilityRole="button"
              accessibilityLabel={
                isFollowing
                  ? `Unfollow ${user.username}`
                  : `Follow ${user.username}`
              }
            >
              <Ionicons
                name={isFollowing ? "checkmark" : "person-add-outline"}
                size={21}
                color={
                  isFollowing
                    ? COLORS.green
                    : COLORS.offWhite
                }
              />

              <Text
                style={[
                  styles.followButtonText,
                  isFollowing && styles.followButtonTextActive,
                ]}
              >
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Future meet-ups</Text>

          {USER_MEETUPS.length > 0 ? (
            USER_MEETUPS.map((meetup) => (
              <MeetupCard
                key={meetup.id}
                meetup={meetup}
                onPress={() =>
                  navigation.navigate("MeetupDetail", {
                    meetup,
                  })
                }
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-outline"
                size={54}
                color={COLORS.span}
              />

              <Text style={styles.emptyTitle}>
                No future meet-ups
              </Text>

              <Text style={styles.emptyText}>
                This user has no planned meet-ups yet.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },

  header: {
    minHeight: 72,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  headerTitle: {
    color: COLORS.blue,
    fontSize: 22,
    fontWeight: "700",
  },

  headerPlaceholder: {
    width: 44,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  profileSection: {
    alignItems: "center",
    paddingTop: 20,
    marginBottom: 34,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 3,
    borderColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },

  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  username: {
    color: COLORS.blue,
    fontSize: 23,
    fontWeight: "700",
    marginRight: 5,
  },

  bio: {
    maxWidth: 300,
    color: COLORS.span,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 20,
  },

  statsRow: {
    width: "72%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 3,
  },

  statLabel: {
    color: COLORS.blue,
    fontSize: 15,
  },

  statsDivider: {
    width: 1,
    height: 38,
    backgroundColor: COLORS.midGray,
  },

  followButton: {
    width: "72%",
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: COLORS.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  followButtonActive: {
    backgroundColor: COLORS.lightgreen,
    borderWidth: 1,
    borderColor: COLORS.green,
  },

  followButtonText: {
    color: COLORS.offWhite,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  followButtonTextActive: {
    color: COLORS.green,
  },

  sectionTitle: {
    color: COLORS.blue,
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 10,
  },

  emptyState: {
    minHeight: 230,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 13,
    marginBottom: 5,
  },

  emptyText: {
    color: COLORS.span,
    fontSize: 14,
    textAlign: "center",
  },
});