import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

export default function SafespaceDetailScreen({ navigation, route }) {
  const safespace = route.params?.safespace;
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  if (!safespace) {
    return null;
  }
  useFocusEffect(
  useCallback(() => {
    const fetchReviewSummary = async () => {
      const { data, error } = await supabase
        .from("safespace_reviews")
        .select("rating")
        .eq("safespace_id", safespace.id);

      if (error) {
        console.error("Error fetching review summary:", error);
        return;
      }

      const reviews = data || [];

      setReviewCount(reviews.length);

      if (reviews.length === 0) {
        setAverageRating(0);
        return;
      }

      const totalRating = reviews.reduce(
        (total, review) => total + review.rating,
        0
      );

      setAverageRating(totalRating / reviews.length);
    };

    fetchReviewSummary();
  }, [safespace.id])
);

  const handleGetDirections = () => {
    navigation.navigate("MainTabs", {
      screen: "MapTab",
      params: {
        destination: safespace.address,
      },
    });
  };

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
              <Ionicons name="arrow-back" size={29} color={COLORS.blue} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Safespace details</Text>

            <View style={styles.headerPlaceholder} />

            <View style={styles.heroIcon}>
              <Ionicons name="storefront-outline" size={72} color={COLORS.blue} />
            </View>
          </View>

          <View style={styles.contentCard}>
            <View style={styles.titleRow}>
              <View style={styles.titleContent}>
                <Text style={styles.title}>{safespace.name}</Text>

                <View style={styles.statusRow}>
                  <Text style={styles.openStatus}>
                    {safespace.type}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.directionsButton}
                activeOpacity={0.8}
                onPress={handleGetDirections}
                accessibilityRole="button"
                accessibilityLabel={`Get directions to ${safespace.name}`}
              >
                <Text style={styles.directionsButtonText}>
                  Get directions
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.addressRow}>
              <Ionicons name="location" size={21} color={COLORS.blue} />

              <Text style={styles.addressText}>
                {safespace.address}
              </Text>
            </View>

            <View style={styles.safetyBadge}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={COLORS.offWhite}
              />

              <Text style={styles.safetyBadgeText}>
                {safespace.safetyMeasure}
              </Text>
            </View>

            <View style={styles.reviewsRow}>
              <View style={styles.ratingContainer}>
                <Ionicons
                  name={reviewCount > 0 ? "star" : "star-outline"}
                  size={21}
                  color={
                    reviewCount > 0
                      ? COLORS.yellow
                      : COLORS.midGray
                  }
                />

                {reviewCount > 0 ? (
                  <>
                    <Text style={styles.rating}>
                      {averageRating.toFixed(1)}
                    </Text>

                    <Text style={styles.reviewCount}>
                      ({reviewCount} reviews)
                    </Text>
                  </>
                ) : (
                  <Text style={styles.reviewCount}>
                    No reviews yet
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.allReviewsButton}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("SafespaceReviews", {
                    safespace,
                  })
                }
                accessibilityRole="button"
                accessibilityLabel="See all reviews"
              >
                <Text style={styles.allReviewsText}>
                  See all reviews
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={COLORS.blue}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <View style={styles.sectionTitleRow}>
                <Ionicons
                  name="time"
                  size={18}
                  color={COLORS.blue}
                />

                <Text style={styles.sectionTitle}>
                  Opening hours
                </Text>
              </View>

              <Text style={styles.sectionValue}>
                {safespace.openingHours}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <View style={styles.sectionTitleRow}>
                <Ionicons
                  name="images-outline"
                  size={18}
                  color={COLORS.blue}
                />

                <Text style={styles.sectionTitle}>
                  Photos
                </Text>
              </View>

              <View style={styles.photosRow}>
                {[1, 2, 3, 4].map((photo) => (
                  <View key={photo} style={styles.photoPlaceholder}>
                    <Ionicons
                      name="image-outline"
                      size={25}
                      color={COLORS.span}
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lightBlue,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  hero: {
    height: 190,
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 18,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    position: "relative",
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
    flex: 1,
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 13,
    marginHorizontal: 8,
  },

  headerPlaceholder: {
    width: 44,
  },

  heroIcon: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 26,
    alignItems: "center",
    opacity: 0.45,
  },

  contentCard: {
    flex: 1,
    minHeight: 500,
    backgroundColor: COLORS.offWhite,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: -18,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  titleContent: {
    flex: 1,
    marginRight: 12,
  },

  title: {
    color: COLORS.blue,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  distance: {
    color: COLORS.green,
    fontSize: 13,
    marginRight: 12,
  },

  openStatus: {
    color: COLORS.green,
    fontSize: 13,
  },

  directionsButton: {
    minHeight: 39,
    borderRadius: 10,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  directionsButtonText: {
    color: COLORS.offWhite,
    fontSize: 14,
    fontWeight: "500",
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  addressText: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 15,
    marginLeft: 9,
  },

  safetyBadge: {
    alignSelf: "flex-start",
    minHeight: 36,
    borderRadius: 9,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  safetyBadgeText: {
    color: COLORS.offWhite,
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },

  reviewsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  rating: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 7,
  },

  reviewCount: {
    color: COLORS.span,
    fontSize: 14,
    marginLeft: 5,
  },

  allReviewsButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  allReviewsText: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: "500",
    marginRight: 5,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.midGray,
    marginBottom: 18,
  },

  infoSection: {
    marginBottom: 18,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  sectionTitle: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 9,
  },

  sectionValue: {
    color: COLORS.blue,
    fontSize: 14,
    marginLeft: 27,
  },

  photosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  photoPlaceholder: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },
});