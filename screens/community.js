import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import CommunityMeetupCard from "../components/CommunityMeetupCard";
import FilterModal from "../components/FilterModal";
import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";

export default function CommunityScreen({ navigation }) {
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);

  const formatDate = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year.slice(-2)}`;
  };

  const formatTime = (time) => {
    if (!time) return "";

    return time.slice(0, 5);
  };

  const fetchMeetups = useCallback(async () => {
  setLoading(true);

  try {
    const { data: meetupData, error: meetupError } = await supabase
      .from("meetups")
      .select("*")
      .order("created_at", { ascending: false });

    if (meetupError) {
      console.error("Error fetching meetups:", meetupError);

      Alert.alert(
        "Could not load meet-ups",
        "Please check your internet connection and try again."
      );

      return;
    }

    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select("meetup_id");

    if (commentError) {
      console.error("Error fetching comment counts:", commentError);

      Alert.alert(
        "Could not load comments",
        "Please try again."
      );

      return;
    }

    const commentCounts = {};

    commentData.forEach((comment) => {
      const meetupId = comment.meetup_id;

      commentCounts[meetupId] =
        (commentCounts[meetupId] || 0) + 1;
    });

    const formattedMeetups = meetupData.map((meetup) => ({
      id: meetup.id.toString(),
      username: meetup.username,
      participantCount: meetup.participant_count,
      location: meetup.location,
      date: formatDate(meetup.meetup_date),
      time: formatTime(meetup.meetup_time),
      category: meetup.category,

      commentCount: commentCounts[meetup.id] || 0,
    }));

    setMeetups(formattedMeetups);
  } catch (error) {
    console.error("Unexpected meetup error:", error);

    Alert.alert(
      "Something went wrong",
      "The meet-ups could not be loaded."
    );
  } finally {
    setLoading(false);
  }
}, []);

  useFocusEffect(
    useCallback(() => {
      fetchMeetups();
    }, [fetchMeetups])
  );

  const handleJoinMeetup = (meetup) => {
    console.log("Join meetup:", meetup.id);
  };

  const handleOpenComments = (meetup) => {
    navigation.navigate("Comments", {
      meetup,
    });
  };

  const handleOpenMeetup = (meetup) => {
    navigation.navigate("MeetupDetail", {
      meetup,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Community{"\n"}pinboard
          </Text>

          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons
              name="person"
              size={23}
              color={COLORS.blue}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <TouchableOpacity
            style={styles.searchContainer}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Search")}
          >
            <Text style={styles.searchPlaceholder}>
              Search users
            </Text>

            <Ionicons
              name="search"
              size={24}
              color={COLORS.blue}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.8}
            onPress={() => setIsFilterVisible(true)}
          >
            <Ionicons
              name="options-outline"
              size={26}
              color={COLORS.blue}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.blue}
            />

            <Text style={styles.loadingText}>
              Loading meet-ups...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {meetups.length > 0 ? (
              meetups.map((meetup) => (
                <CommunityMeetupCard
                  key={meetup.id}
                  meetup={meetup}
                  onPress={() => handleOpenMeetup(meetup)}
                  onCommentsPress={() => handleOpenComments(meetup)}
                  onJoinPress={() => handleJoinMeetup(meetup)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="people-outline"
                  size={58}
                  color={COLORS.span}
                />

                <Text style={styles.emptyTitle}>
                  No community meet-ups yet
                </Text>

                <Text style={styles.emptyText}>
                  Be the first to create a meet-up in your community.
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("CreateMeetup")}
        >
          <Ionicons
            name="add"
            size={38}
            color={COLORS.offWhite}
          />
        </TouchableOpacity>

        <FilterModal
          visible={isFilterVisible}
          onClose={() => setIsFilterVisible(false)}
          onApply={(filters) => {
            setActiveFilters(filters);
            console.log("Applied filters:", filters);
          }}
        />
      </View>
    </SafeAreaView>
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
    minHeight: 108,
    backgroundColor: COLORS.blue,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: COLORS.offWhite,
    fontSize: 27,
    lineHeight: 28,
    fontWeight: "700",
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

  searchSection: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  searchContainer: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },

  searchPlaceholder: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 15,
  },

  filterButton: {
    width: 42,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.span,
    fontSize: 15,
    marginTop: 12,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 95,
  },

  emptyState: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: COLORS.blue,
    fontSize: 19,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 5,
  },

  emptyText: {
    color: COLORS.span,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },

  addButton: {
    position: "absolute",
    right: 24,
    bottom: 22,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 6,
  },
});