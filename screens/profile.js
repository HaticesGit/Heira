import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";
import useUserPlan from "../hooks/useUserPlan";

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { plan, isPremium, loadingPlan } = useUserPlan();

  const fetchProfile = useCallback(async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, bio, is_verified, profileIMG_url")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);

      Alert.alert(
        "Could not load profile",
        "Please try again."
      );

      setLoading(false);
      return;
    }

    const { count: followers, error: followersError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", session.user.id);

    if (followersError) {
      console.error("Error fetching followers:", followersError);
    }

    const { count: following, error: followingError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", session.user.id);

    if (followingError) {
      console.error("Error fetching following:", followingError);
    }

    setProfile(data);
    setFollowerCount(followers || 0);
    setFollowingCount(following || 0);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);

      Alert.alert(
        "Could not log out",
        "Please try again."
      );

      return;
    }

    navigation.navigate("Login");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.blue}
          />

          <Text style={styles.loadingText}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.guestContainer}>
          <Ionicons
            name="person-outline"
            size={55}
            color={COLORS.blue}
          />

          <Text style={styles.guestTitle}>
            You're using Heira as a guest
          </Text>

          <Text style={styles.guestText}>
            Sign in to view your profile and account settings.
          </Text>

          <TouchableOpacity
            style={styles.signInButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.signInButtonText}>
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons
                name="arrow-back"
                size={28}
                color={COLORS.blue}
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Profile</Text>

            <TouchableOpacity
              style={styles.headerButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Settings")}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
            >
              <Ionicons
                name="settings-outline"
                size={27}
                color={COLORS.blue}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.profileContent}>
            <View style={styles.avatarWrapper}>
  {profile?.profileIMG_url ? (
    <Image
      source={{ uri: profile.profileIMG_url }}
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
              <Text style={styles.username}>
                @{profile.username}
              </Text>

              {profile.is_verified ? (
                <Ionicons
                  name="shield-checkmark"
                  size={21}
                  color={COLORS.blue}
                />
              ) : null}
            </View>

            {profile.bio ? (
              <Text style={styles.bio}>
                {profile.bio}
              </Text>
            ) : null}

            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statItem}
                activeOpacity={0.7}
                onPress={() =>
                navigation.navigate("FollowList", {
                  userId: profile.id,
                  username: profile.username,
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
                  userId: profile.id,
                  username: profile.username,
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

            <TouchableOpacity
              style={styles.recordingsButton}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate("VoiceRecorder")
              }
            >
              <Ionicons
                name="pulse-outline"
                size={23}
                color={COLORS.offWhite}
              />

              <Text style={styles.recordingsButtonText}>
                My recordings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              activeOpacity={0.8}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={COLORS.red}
              />

              <Text style={styles.logoutButtonText}>
                Log out
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>
            Choose your plan
          </Text>

          <View style={styles.freePlanCard}>
            <View style={styles.planHeader}>
              <View style={styles.planTitleRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={21}
                  color={COLORS.blue}
                />

                <Text style={styles.freePlanTitle}>
                  Free plan
                </Text>
              </View>

              {!isPremium && (
              <View style={styles.currentPlanBadge}>
                <Text style={styles.currentPlanText}>
                  Current plan
                </Text>
              </View>
            )}
            </View>

            <Text style={styles.freePlanDescription}>
              You get access to all of our features with some limits.
            </Text>
          </View>

          <View style={styles.premiumPlanCard}>
            <View style={styles.planHeader}>
              <View style={styles.planTitleRow}>
                <Ionicons
                  name="diamond"
                  size={21}
                  color={COLORS.green}
                />

                <Text style={styles.premiumPlanTitle}>
                  Premium
                </Text>
              </View>

              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>
                  {isPremium ? "Current plan" : "Most popular"}
                </Text>
              </View>
            </View>

            <Text style={styles.premiumDescription}>
              Unlock customisation and use the app without limits.
            </Text>

            <View style={styles.featureRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.green}
              />

              <Text style={styles.featureText}>
                Unlimited access
              </Text>
            </View>

            <View style={styles.featureRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.green}
              />

              <Text style={styles.featureText}>
                Unlock customisation
              </Text>
            </View>

            <View style={styles.lastFeatureRow}>
              <View style={styles.featureLeft}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.green}
                />

                <Text style={styles.featureText}>
                  More emergency contacts
                </Text>
              </View>

              <Text style={styles.priceText}>
                €4.99/month
              </Text>
            </View>
          </View>

          {!isPremium && (
            <TouchableOpacity
              style={styles.upgradeButton}
              activeOpacity={0.8}
              onPress={() =>
                console.log("Upgrade pressed")
              }
            >
              <Ionicons
                name="diamond"
                size={21}
                color={COLORS.offWhite}
              />

              <Text style={styles.upgradeButtonText}>
                Upgrade to premium
              </Text>
            </TouchableOpacity>
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

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.span,
    fontSize: 15,
    marginTop: 10,
  },

  guestContainer: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  guestTitle: {
    color: COLORS.blue,
    fontSize: 21,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 7,
    textAlign: "center",
  },

  guestText: {
    color: COLORS.span,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 22,
  },

  signInButton: {
    width: "75%",
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  signInButtonText: {
    color: COLORS.offWhite,
    fontSize: 16,
    fontWeight: "700",
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.midGray,

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
    fontSize: 24,
    fontWeight: "700",
  },

  profileContent: {
    alignItems: "center",
    marginBottom: 32,
  },

  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.offWhite,
    marginBottom: 14,
    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.14,
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
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 18,
  },

  statsRow: {
    width: "70%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 4,
  },

  statLabel: {
    color: COLORS.blue,
    fontSize: 16,
  },

  statsDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.midGray,
  },

  recordingsButton: {
    width: "72%",
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: COLORS.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  recordingsButtonText: {
    color: COLORS.offWhite,
    fontSize: 15,
    marginLeft: 7,
  },

  logoutButton: {
    marginTop: 12,
    minHeight: 42,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutButtonText: {
    color: COLORS.red,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },

  sectionTitle: {
    color: COLORS.blue,
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 10,
  },

  freePlanCard: {
    minHeight: 95,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    padding: 12,
    marginBottom: 12,

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  premiumPlanCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.green,
    backgroundColor: COLORS.lightgreen,
    padding: 12,
    marginBottom: 28,
  },

  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  freePlanTitle: {
    color: COLORS.blue,
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 6,
  },

  premiumPlanTitle: {
    color: COLORS.green,
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 6,
  },

  currentPlanBadge: {
    backgroundColor: COLORS.lightgreen,
    borderWidth: 1,
    borderColor: COLORS.green,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  currentPlanText: {
    color: COLORS.green,
    fontSize: 13,
  },

  popularBadge: {
    backgroundColor: COLORS.green,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  popularBadgeText: {
    color: COLORS.offWhite,
    fontSize: 13,
  },

  freePlanDescription: {
    color: COLORS.span,
    fontSize: 15,
    lineHeight: 20,
    marginLeft: 27,
    maxWidth: 250,
  },

  premiumDescription: {
    color: COLORS.span,
    fontSize: 15,
    lineHeight: 20,
    marginLeft: 27,
    marginBottom: 12,
    maxWidth: 250,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  featureLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  featureText: {
    color: COLORS.span,
    fontSize: 14,
    marginLeft: 6,
  },

  lastFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priceText: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: "600",
  },

  upgradeButton: {
    minHeight: 58,
    borderRadius: 8,
    backgroundColor: COLORS.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  upgradeButtonText: {
    color: COLORS.offWhite,
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },
  profileImage: {
  width: "100%",
  height: "100%",
  borderRadius: 60,
},
});