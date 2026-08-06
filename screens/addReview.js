import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

export default function AddReviewScreen({ navigation, route }) {
  const safespace = route.params?.safespace ?? {
    id: "1",
    name: "The Cozy Café",
  };

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleSubmitReview = () => {
    const trimmedReview = reviewText.trim();

    if (rating === 0) {
      Alert.alert(
        "Choose a rating",
        "Please select how many stars you want to give."
      );
      return;
    }

    if (!trimmedReview) {
      Alert.alert(
        "Write a review",
        "Please write something about your experience."
      );
      return;
    }

    const newReview = {
      id: Date.now().toString(),
      safespaceId: safespace.id,
      username: "fartingUnicorn",
      date: "Now",
      rating,
      text: trimmedReview,
    };

    console.log("New safespace review:", newReview);

    Alert.alert(
      "Review submitted",
      "Thank you for sharing your experience.",
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={29} color={COLORS.blue} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add review</Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.safespaceCard}>
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="storefront-outline"
                size={35}
                color={COLORS.blue}
              />
            </View>

            <View style={styles.safespaceInfo}>
              <Text style={styles.safespaceLabel}>
                You are reviewing
              </Text>

              <Text style={styles.safespaceName}>
                {safespace.name}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            How was your experience?
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                activeOpacity={0.75}
                onPress={() => setRating(star)}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={38}
                  color={
                    star <= rating
                      ? COLORS.yellow
                      : COLORS.midGray
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingText}>
            {rating === 0
              ? "Tap a star to rate this safespace"
              : `${rating} out of 5 stars`}
          </Text>

          <Text style={styles.sectionTitle}>
            Tell others more
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Describe what made you feel safe and supported..."
              placeholderTextColor={COLORS.span}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />

            <Text style={styles.characterCount}>
              {reviewText.length}/500
            </Text>
          </View>

          <View style={styles.infoBanner}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color={COLORS.green}
            />

            <Text style={styles.infoText}>
              Your review helps other users find welcoming and supportive
              places.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.8}
            onPress={handleSubmitReview}
          >
            <Text style={styles.submitButtonText}>
              Submit review
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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

  scrollView: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
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
    fontSize: 20,
    fontWeight: "700",
  },

  headerPlaceholder: {
    width: 44,
  },

  safespaceCard: {
    minHeight: 82,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    padding: 12,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
        shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  imagePlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 9,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  safespaceInfo: {
    flex: 1,
  },

  safespaceLabel: {
    color: COLORS.span,
    fontSize: 13,
    marginBottom: 4,
  },

  safespaceName: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: "700",
  },

  sectionTitle: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },

  starButton: {
    paddingHorizontal: 5,
    paddingVertical: 4,
  },

  ratingText: {
    color: COLORS.span,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },

  inputContainer: {
    minHeight: 170,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    padding: 12,
    marginBottom: 18,
  },

  input: {
    minHeight: 120,
    color: COLORS.blue,
    fontSize: 15,
    lineHeight: 21,
    padding: 0,
  },

  characterCount: {
    color: COLORS.span,
    fontSize: 12,
    textAlign: "right",
    marginTop: 8,
  },

  infoBanner: {
    minHeight: 75,
    borderRadius: 9,
    backgroundColor: COLORS.lightgreen,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  infoText: {
    flex: 1,
    color: COLORS.green,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 11,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    flexDirection: "row",
  },

  cancelButton: {
    flex: 0.75,
    minHeight: 55,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  cancelButtonText: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
  },

  submitButton: {
    flex: 1,
    minHeight: 55,
    borderRadius: 9,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },

  submitButtonText: {
    color: COLORS.offWhite,
    fontSize: 16,
    fontWeight: "700",
  },
});