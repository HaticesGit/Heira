import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import MeetupCard from "../components/MeetUpCard";
import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";

export default function UserProfileScreen({ navigation, route }) {
  const userId = route.params?.user?.id;

  const [user, setUser] = useState({
  id: userId,
  username: route.params?.user?.username || "",
  isVerified: false,
  bio: "",
  profileIMG_url: null,
});

  const [userMeetups, setUserMeetups] = useState([]);

  const [isFollowing, setIsFollowing] = useState(false);
const [currentUserId, setCurrentUserId] = useState(null);
const [followerCount, setFollowerCount] = useState(0);
const [followingCount, setFollowingCount] = useState(0);

useEffect(() => {
  const fetchUserData = async () => {
    if (!userId) {
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, bio, is_verified, profileIMG_url")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: meetupData, error: meetupError } = await supabase
      .from("meetups")
      .select("*")
      .eq("creator_id", userId)
      .gte("meetup_date", today)
      .order("meetup_date", { ascending: true });

    if (meetupError) {
      console.error("Error fetching user meetups:", meetupError);
      return;
    }

    const meetupIds = meetupData.map((meetup) => meetup.id);

    const participantCounts = {};
    const commentCounts = {};

    if (meetupIds.length > 0) {
      const { data: participantData } = await supabase
        .from("meetup_participants")
        .select("meetup_id")
        .in("meetup_id", meetupIds);

      const { data: commentData } = await supabase
        .from("comments")
        .select("meetup_id")
        .in("meetup_id", meetupIds);

      participantData?.forEach((participant) => {
        participantCounts[participant.meetup_id] =
          (participantCounts[participant.meetup_id] || 0) + 1;
      });

      commentData?.forEach((comment) => {
        commentCounts[comment.meetup_id] =
          (commentCounts[comment.meetup_id] || 0) + 1;
      });
    }

    const formattedMeetups = meetupData.map((meetup) => {
      const [year, month, day] = meetup.meetup_date.split("-");

      return {
        id: meetup.id.toString(),
        creatorId: meetup.creator_id,
        location: meetup.location,
        date: `${day}/${month}/${year.slice(-2)}`,
        time: meetup.meetup_time.slice(0, 5),
        username: profileData.username,
        category: meetup.category,
        participantCount: participantCounts[meetup.id] || 0,
        commentCount: commentCounts[meetup.id] || 0,
      };
    });

    setUser({
  id: profileData.id,
  username: profileData.username,
  isVerified: profileData.is_verified || false,
  bio: profileData.bio || "",
  profileIMG_url: profileData.profileIMG_url || null,
});

    setUserMeetups(formattedMeetups);
  };

  fetchUserData();
}, [userId]);

useEffect(() => {
  const fetchFollowData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const loggedInUserId = session?.user?.id || null;

    setCurrentUserId(loggedInUserId);

    const { count: followers } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user.id);

    const { count: following } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id);

    setFollowerCount(followers || 0);
    setFollowingCount(following || 0);

    if (!loggedInUserId || loggedInUserId === user.id) {
      setIsFollowing(false);
      return;
    }

    const { data: follow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", loggedInUserId)
      .eq("following_id", user.id)
      .maybeSingle();

    setIsFollowing(!!follow);
  };

  fetchFollowData();
}, [user.id]);


  const toggleFollow = async () => {
  if (!currentUserId) {
    navigation.navigate("Login");
    return;
  }

  if (currentUserId === user.id) {
    return;
  }

  if (isFollowing) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", currentUserId)
      .eq("following_id", user.id);

    if (error) {
      console.error("Error unfollowing user:", error);
      return;
    }

    setIsFollowing(false);
    setFollowerCount((current) => Math.max(current - 1, 0));
  } else {
    const { error } = await supabase
      .from("follows")
      .insert([
        {
          follower_id: currentUserId,
          following_id: user.id,
        },
      ]);

    if (error) {
      console.error("Error following user:", error);
      return;
    }

    setIsFollowing(true);
    setFollowerCount((current) => current + 1);
  }
};

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
  {user.profileIMG_url ? (
    <Image
      source={{ uri: user.profileIMG_url }}
      style={styles.profileImage}
      resizeMode="cover"
    />
  ) : (
    <Ionicons
      name="person"
      size={62}
      color={COLORS.blue}
    />
  )}
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
    onPress={() =>
      navigation.navigate("FollowList", {
        userId: user.id,
        username: user.username,
        initialTab: "followers",
      })
    }
  >
    <Text style={styles.statNumber}>
      {followerCount}
    </Text>

    <Text style={styles.statLabel}>
      Followers
    </Text>
  </TouchableOpacity>

  <View style={styles.statsDivider} />

  <TouchableOpacity
    style={styles.statItem}
    activeOpacity={0.7}
    onPress={() =>
      navigation.navigate("FollowList", {
        userId: user.id,
        username: user.username,
        initialTab: "following",
      })
    }
  >
    <Text style={styles.statNumber}>
      {followingCount}
    </Text>

    <Text style={styles.statLabel}>
      Following
    </Text>
  </TouchableOpacity>
</View>

            {currentUserId !== user.id ? (
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
) : null}
          </View>

          <Text style={styles.sectionTitle}>Future meet-ups</Text>

          {userMeetups.length > 0 ? (
            userMeetups.map((meetup) => (
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
  profileImage: {
  width: "100%",
  height: "100%",
  borderRadius: 60,
},
});