import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

export default function ProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
              onPress={() => console.log("Settings pressed")}
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
              <Ionicons
                name="person"
                size={62}
                color={COLORS.blue}
              />
            </View>

            <View style={styles.usernameRow}>
              <Text style={styles.username}>
                @fartingUnicorn
              </Text>

              <Ionicons
                name="shield-checkmark"
                size={21}
                color={COLORS.blue}
              />
            </View>

            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statItem}
                activeOpacity={0.7}
                onPress={() => console.log("Followers pressed")}
              >
                <Text style={styles.statNumber}>42</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>

              <View style={styles.statsDivider} />

              <TouchableOpacity
                style={styles.statItem}
                activeOpacity={0.7}
                onPress={() => console.log("Following pressed")}
              >
                <Text style={styles.statNumber}>67</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.recordingsButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("VoiceRecorder")}
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

              <View style={styles.currentPlanBadge}>
                <Text style={styles.currentPlanText}>
                  Current plan
                </Text>
              </View>
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
                  Most popular
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

          <TouchableOpacity
            style={styles.upgradeButton}
            activeOpacity={0.8}
            onPress={() => console.log("Upgrade pressed")}
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
    backgroundColor: COLORS.lightgreen,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.green,
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
    marginBottom: 18,
  },

  username: {
    color: COLORS.blue,
    fontSize: 23,
    fontWeight: "700",
    marginRight: 5,
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
});