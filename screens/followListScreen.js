import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";

export default function FollowListScreen({ navigation, route }) {
  const userId = route.params?.userId;
  const username = route.params?.username || "";
  const initialTab = route.params?.initialTab || "followers";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data: followerRows, error: followersError } =
        await supabase
          .from("follows")
          .select("follower_id")
          .eq("following_id", userId);

      if (followersError) {
        console.error(
          "Error fetching followers:",
          followersError
        );
        return;
      }

      const followerIds = (followerRows || [])
        .map((item) => item.follower_id)
        .filter(Boolean);

      if (followerIds.length > 0) {
        const { data: followerProfiles, error } =
          await supabase
            .from("profiles")
            .select("id, username, is_verified, profileIMG_url")
            .in("id", followerIds);

        if (error) {
          console.error(
            "Error fetching follower profiles:",
            error
          );
        } else {
          setFollowers(followerProfiles || []);
        }
      } else {
        setFollowers([]);
      }

      const { data: followingRows, error: followingError } =
        await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId);

      if (followingError) {
        console.error(
          "Error fetching following:",
          followingError
        );
        return;
      }

      const followingIds = (followingRows || [])
        .map((item) => item.following_id)
        .filter(Boolean);

      if (followingIds.length > 0) {
        const { data: followingProfiles, error } =
          await supabase
            .from("profiles")
            .select("id, username, is_verified, profileIMG_url")
            .in("id", followingIds);

        if (error) {
          console.error(
            "Error fetching following profiles:",
            error
          );
        } else {
          setFollowing(followingProfiles || []);
        }
      } else {
        setFollowing([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchFollowData();
    }, [fetchFollowData])
  );

  const activeList =
    activeTab === "followers"
      ? followers
      : following;

  const renderUser = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.userRow}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("UserProfile", {
            user: item,
          })
        }
      >
        <View style={styles.avatar}>
  {item.profileIMG_url ? (
    <Image
      source={{ uri: item.profileIMG_url }}
      style={styles.profileImage}
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

        <View style={styles.userInfo}>
          <View style={styles.usernameRow}>
            <Text style={styles.username}>
              {item.username || "Unknown user"}
            </Text>

            {item.is_verified ? (
              <Ionicons
                name="shield-checkmark"
                size={17}
                color={COLORS.blue}
              />
            ) : null}
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={21}
          color={COLORS.blue}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color={COLORS.blue}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            @{username}
          </Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={styles.tab}
            activeOpacity={0.8}
            onPress={() =>
              setActiveTab("followers")
            }
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "followers" &&
                  styles.activeTabText,
              ]}
            >
              {followers.length} Followers
            </Text>

            {activeTab === "followers" ? (
              <View style={styles.activeLine} />
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            activeOpacity={0.8}
            onPress={() =>
              setActiveTab("following")
            }
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "following" &&
                  styles.activeTabText,
              ]}
            >
              {following.length} Following
            </Text>

            {activeTab === "following" ? (
              <View style={styles.activeLine} />
            ) : null}
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.blue}
            />
          </View>
        ) : activeList.length > 0 ? (
          <FlatList
            data={activeList}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={54}
              color={COLORS.span}
            />

            <Text style={styles.emptyTitle}>
              {activeTab === "followers"
                ? "No followers yet"
                : "Not following anyone yet"}
            </Text>
          </View>
        )}
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
    height: 72,
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
  },

  headerTitle: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 21,
    fontWeight: "700",
    marginLeft: 16,
  },

  headerPlaceholder: {
    width: 44,
  },

  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.midGray,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
  },

  tabText: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "600",
    paddingBottom: 12,
  },

  activeTabText: {
    fontWeight: "700",
  },

  activeLine: {
    height: 2,
    width: "100%",
    backgroundColor: COLORS.blue,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  userRow: {
    minHeight: 74,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.midGray,
    flexDirection: "row",
    alignItems: "center",
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

  userInfo: {
    flex: 1,
  },

  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  username: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
    marginRight: 5,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  profileImage: {
  width: "100%",
  height: "100%",
  borderRadius: 23,
},
});