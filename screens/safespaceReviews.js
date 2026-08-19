import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import ReviewCard from "../components/ReviewCard";
import { COLORS } from "../constants/colors";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";


export default function SafespaceReviewsScreen({ navigation, route }) {
  const safespace = route.params?.safespace;

const [reviews, setReviews] = useState([]);
const [averageRating, setAverageRating] = useState(0);
const [ratingDistribution, setRatingDistribution] = useState([
  { rating: 5, amount: 0 },
  { rating: 4, amount: 0 },
  { rating: 3, amount: 0 },
  { rating: 2, amount: 0 },
  { rating: 1, amount: 0 },
]);

useFocusEffect(
  useCallback(() => {
    if (!safespace?.id) return;

    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("safespace_reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id,
          profiles (
            username,
            profileIMG_url,
            plan
          )
        `)
        .eq("safespace_id", safespace.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        return;
      }

      const formattedReviews = (data || []).map((review) => ({
        id: review.id,
        userId: review.user_id,
        username: review.profiles?.username || "User",
        date: new Date(review.created_at).toLocaleDateString(),
        rating: review.rating,
        text: review.comment,
        profileImage: review.profiles?.profileIMG_url || null,
        plan: review.profiles?.plan || "free",
      }));

      setReviews(formattedReviews);

      if (formattedReviews.length === 0) {
        setAverageRating(0);
      } else {
        const totalRating = formattedReviews.reduce(
          (total, review) => total + review.rating,
          0
        );

        setAverageRating(
          totalRating / formattedReviews.length
        );
      }

      setRatingDistribution(
        [5, 4, 3, 2, 1].map((rating) => ({
          rating,
          amount: formattedReviews.filter(
            (review) => review.rating === rating
          ).length,
        }))
      );
    };

    fetchReviews();
  }, [safespace?.id])
);

if (!safespace) {
  return null;
}

const highestRatingAmount = Math.max(
  1,
  ...ratingDistribution.map((item) => item.amount)
);

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
            <Ionicons name="arrow-back" size={29} color={COLORS.blue} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>All reviews</Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.safespaceOverview}>
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={36} color={COLORS.span} />
            </View>

            <View style={styles.safespaceInfo}>
              <Text style={styles.safespaceName}>{safespace.name}</Text>

              <View style={styles.inlineRating}>
                <Ionicons name="star" size={20} color={COLORS.yellow} />

                <Text style={styles.inlineRatingNumber}>
                  {averageRating > 0 ? averageRating.toFixed(1) : "—"}
                </Text>

                <Text style={styles.inlineReviewCount}>
                  ({reviews.length} reviews)
                </Text>
              </View>

              <Text style={styles.openStatus}>{safespace.status}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.ratingSummary}>
            <View style={styles.averageColumn}>
             <Text style={styles.averageRating}>
              {averageRating > 0 ? averageRating.toFixed(1) : "—"}
            </Text>

              <View style={styles.averageStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(averageRating) ? "star" : "star-outline"}
                    size={18}
                    color={
                      star <= Math.round(averageRating)
                        ? COLORS.yellow
                        : COLORS.midGray
                    }
                  />
                ))}
              </View>

              <Text style={styles.averageReviewCount}>
                ({reviews.length} reviews)
              </Text>
            </View>

            <View style={styles.distributionColumn}>
              {ratingDistribution.map((item) => {
                const percentage =
                  highestRatingAmount > 0
                    ? (item.amount / highestRatingAmount) * 100
                    : 0;

                return (
                  <View key={item.rating} style={styles.distributionRow}>
                    <Text style={styles.distributionNumber}>
                      {item.rating}
                    </Text>

                    <Ionicons
                      name="star"
                      size={15}
                      color={COLORS.yellow}
                    />

                    <View style={styles.barBackground}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${percentage}%`,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.distributionAmount}>
                      {item.amount}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.reviewsList}>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onUserPress={() =>
  navigation.navigate("UserProfile", {
    user: {
      id: review.userId,
      username: review.username,
    },
  })
}
              />
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.addReviewButton}
          activeOpacity={0.85}
          onPress={() =>
  navigation.navigate("AddReview", {
    safespace,
  })
}
          accessibilityRole="button"
          accessibilityLabel="Add a review"
        >
          <Ionicons name="add" size={34} color={COLORS.offWhite} />
        </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.midGray,
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
    fontSize: 19,
    fontWeight: "700",
  },

  headerPlaceholder: {
    width: 44,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 100,
  },

  safespaceOverview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  imagePlaceholder: {
    width: 108,
    height: 82,
    borderRadius: 9,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  safespaceInfo: {
    flex: 1,
  },

  safespaceName: {
    color: COLORS.blue,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 5,
  },

  inlineRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  inlineRatingNumber: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 6,
  },

  inlineReviewCount: {
    color: COLORS.span,
    fontSize: 13,
    marginLeft: 5,
  },

  openStatus: {
    color: COLORS.green,
    fontSize: 14,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.midGray,
    marginBottom: 18,
  },

  ratingSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  averageColumn: {
    width: "32%",
    alignItems: "center",
    paddingRight: 10,
  },

  averageRating: {
    color: COLORS.blue,
    fontSize: 27,
    fontWeight: "700",
    marginBottom: 8,
  },

  averageStars: {
    flexDirection: "row",
    marginBottom: 8,
  },

  averageReviewCount: {
    color: COLORS.span,
    fontSize: 13,
  },

  distributionColumn: {
    flex: 1,
  },

  distributionRow: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
  },

  distributionNumber: {
    width: 14,
    color: COLORS.blue,
    fontSize: 13,
    textAlign: "right",
    marginRight: 4,
  },

  barBackground: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.lightBlue,
    marginHorizontal: 8,
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: COLORS.blue,
  },

  distributionAmount: {
    width: 24,
    color: COLORS.blue,
    fontSize: 13,
    textAlign: "right",
  },

  reviewsList: {
    paddingBottom: 15,
  },

  addReviewButton: {
    position: "absolute",
    right: 22,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 7,
  },
});