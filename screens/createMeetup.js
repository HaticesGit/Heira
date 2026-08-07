import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";

const CATEGORIES = [
  "Festival",
  "Concert",
  "Night out",
  "Public transport",
  "Shopping",
  "Other",
];

export default function CreateMeetupScreen({ navigation }) {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDateForSupabase = (dateValue) => {
    const parts = dateValue.split("/");

    if (parts.length !== 3) {
      return null;
    }

    const [day, month, year] = parts;

    const fullYear =
      year.length === 2
        ? `20${year}`
        : year;

    return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const formatTimeForSupabase = (timeValue) => {
    const parts = timeValue.split(":");

    if (parts.length !== 2) {
      return null;
    }

    const [hours, minutes] = parts;

    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
  };

  const handlePostMeetup = async () => {
  const trimmedLocation = location.trim();
  const trimmedDate = date.trim();
  const trimmedTime = time.trim();

  if (
    !trimmedLocation ||
    !trimmedDate ||
    !trimmedTime ||
    !selectedCategory
  ) {
    Alert.alert(
      "Missing information",
      "Please fill in the location, date, time and category."
    );

    return;
  }

  const databaseDate =
    formatDateForSupabase(trimmedDate);

  const databaseTime =
    formatTimeForSupabase(trimmedTime);

  if (!databaseDate) {
    Alert.alert(
      "Invalid date",
      "Please enter the date as DD/MM/YY."
    );

    return;
  }

  if (!databaseTime) {
    Alert.alert(
      "Invalid time",
      "Please enter the time as HH:MM."
    );

    return;
  }

  // Check if someone is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    navigation.navigate("Login");
    return;
  }

  // Get the logged-in user's profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", session.user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);

    Alert.alert(
      "Could not create meet-up",
      "Your profile could not be loaded."
    );

    return;
  }

  setLoading(true);

  const { data, error } = await supabase
    .from("meetups")
    .insert([
      {
        creator_id: session.user.id,
        username: profile.username,
        participant_count: 0,
        location: trimmedLocation,
        meetup_date: databaseDate,
        meetup_time: databaseTime,
        category: selectedCategory,
        comment_count: 0,
      },
    ])
    .select();

  setLoading(false);

  if (error) {
    console.error("Error creating meetup:", error);

    Alert.alert(
      "Something went wrong",
      "Your meet-up could not be posted. Please try again."
    );

    return;
  }

  console.log("Meet-up created:", data);

  Alert.alert(
    "Meet-up posted",
    "Your meet-up was posted successfully.",
    [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]
  );
};

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={30}
              color={COLORS.offWhite}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Make a meet-up
          </Text>

          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons
              name="person"
              size={22}
              color={COLORS.blue}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            <FormField
              label="Location"
              icon="location"
            >
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Destinationstreet 27, 1000 Brussels"
                placeholderTextColor={COLORS.span}
              />
            </FormField>

            <View style={styles.divider} />

            <FormField
              label="Date"
              icon="calendar"
            >
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="30/03/26"
                placeholderTextColor={COLORS.span}
                keyboardType="numbers-and-punctuation"
              />
            </FormField>

            <View style={styles.divider} />

            <FormField
              label="Time"
              icon="time"
            >
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="16:00"
                placeholderTextColor={COLORS.span}
                keyboardType="numbers-and-punctuation"
              />
            </FormField>

            <View style={styles.divider} />

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Ionicons
                  name="pricetag"
                  size={20}
                  color={COLORS.green}
                />

                <Text style={styles.label}>
                  Category
                </Text>
              </View>

              <TouchableOpacity
                style={styles.selectInput}
                activeOpacity={0.8}
                onPress={() =>
                  setIsCategoryOpen(
                    (current) => !current
                  )
                }
              >
                <Text
                  style={[
                    styles.selectText,
                    !selectedCategory &&
                      styles.placeholderText,
                  ]}
                >
                  {selectedCategory ||
                    "Choose Category"}
                </Text>

                <Ionicons
                  name={
                    isCategoryOpen
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={21}
                  color={COLORS.blue}
                />
              </TouchableOpacity>

              {isCategoryOpen ? (
                <View style={styles.categoryList}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={styles.categoryOption}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedCategory(category);
                        setIsCategoryOpen(false);
                      }}
                    >
                      <Text
                        style={
                          styles.categoryOptionText
                        }
                      >
                        {category}
                      </Text>

                      {selectedCategory ===
                      category ? (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={COLORS.green}
                        />
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              <View style={styles.infoBanner}>
                <Ionicons
                  name="people"
                  size={25}
                  color={COLORS.green}
                />

                <Text style={styles.infoText}>
                  Choosing a category helps
                  others find your meetup easier
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.postButton,
              loading && styles.postButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handlePostMeetup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color={COLORS.offWhite}
              />
            ) : (
              <Text style={styles.postButtonText}>
                Post meet-up
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FormField({ label, icon, children }) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.labelRow}>
        <Ionicons
          name={icon}
          size={20}
          color={COLORS.green}
        />

        <Text style={styles.label}>
          {label}
        </Text>
      </View>

      <View style={styles.inputWrapper}>
        {children}
      </View>
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

  header: {
    minHeight: 94,
    backgroundColor: COLORS.blue,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    color: COLORS.offWhite,
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
    marginHorizontal: 8,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 2,
    borderColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 30,
  },

  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    padding: 14,
    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },

  fieldGroup: {
    marginBottom: 3,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  label: {
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },

  inputWrapper: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    justifyContent: "center",
  },

  input: {
    color: COLORS.blue,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.midGray,
    marginVertical: 11,
  },

  selectInput: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    color: COLORS.blue,
    fontSize: 15,
  },

  placeholderText: {
    color: COLORS.span,
  },

  categoryList: {
    marginTop: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    overflow: "hidden",
  },

  categoryOption: {
    minHeight: 43,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.midGray,
  },

  categoryOptionText: {
    color: COLORS.blue,
    fontSize: 15,
  },

  infoBanner: {
    minHeight: 84,
    borderRadius: 8,
    backgroundColor: COLORS.lightgreen,
    marginTop: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    flex: 1,
    color: COLORS.green,
    fontSize: 15,
    lineHeight: 20,
    marginLeft: 13,
  },

  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: COLORS.offWhite,
    flexDirection: "row",
  },

  cancelButton: {
    flex: 0.65,
    minHeight: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cancelButtonText: {
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "700",
  },

  postButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 8,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },

  postButtonDisabled: {
    opacity: 0.65,
  },

  postButtonText: {
    color: COLORS.offWhite,
    fontSize: 17,
    fontWeight: "700",
  },
});