import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FilterModal from "../components/FilterModal";

import CommunityMeetupCard from "../components/CommunityMeetupCard";
import { COLORS } from "../constants/colors";

const COMMUNITY_MEETUPS = [
  {
    id: "1",
    username: "SquishyChameleon",
    participantCount: 12,
    location: "Tomorrowland",
    date: "29/07/26",
    time: "14:00",
    category: "Festival",
    commentCount: 4,
  },
  {
    id: "2",
    username: "NightOwl",
    participantCount: 8,
    location: "Brussels Central",
    date: "02/08/26",
    time: "21:30",
    category: "Night out",
    commentCount: 6,
  },
  {
    id: "3",
    username: "BraveBunny",
    participantCount: 5,
    location: "Antwerp Central Station",
    date: "05/08/26",
    time: "18:00",
    category: "Public transport",
    commentCount: 2,
  },
];

export default function CommunityScreen({ navigation }) {
const [isFilterVisible, setIsFilterVisible] = useState(false);
const [activeFilters, setActiveFilters] = useState(null);
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
            accessibilityRole="button"
            accessibilityLabel="Open profile"
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
            accessibilityRole="button"
            accessibilityLabel="Search users"
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
            accessibilityRole="button"
            accessibilityLabel="Open community filters"
          >
            <Ionicons
              name="options-outline"
              size={26}
              color={COLORS.blue}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {COMMUNITY_MEETUPS.length > 0 ? (
            COMMUNITY_MEETUPS.map((meetup) => (
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

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("CreateMeetup")}
          accessibilityRole="button"
          accessibilityLabel="Create a new meetup"
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
    backgroundColor: COLORS.lightgreen,
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