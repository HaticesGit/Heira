import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, ScrollView, KeyboardAvoidingView, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";
import FilterModal from "../components/FilterModal";

const INITIAL_RECENT_SEARCHES = [];

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(
    INITIAL_RECENT_SEARCHES
  );
  const [followedUsers, setFollowedUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [meetupResults, setMeetupResults] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

const [filters, setFilters] = useState({
  categories: [],
  date: "",
  time: "",
  verifiedHostsOnly: false,
});

  const normalizedQuery = searchQuery.trim().toLowerCase();
  useFocusEffect(
  React.useCallback(() => {
    const fetchFollowing = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setCurrentUserId(null);
        setFollowedUsers([]);
        return;
      }

      setCurrentUserId(session.user.id);

      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", session.user.id);

      if (error) {
        console.error("Error fetching followed users:", error);
        return;
      }

      setFollowedUsers(
        (data || []).map((follow) => follow.following_id)
      );
    };

    fetchFollowing();
  }, [])
);

  useEffect(() => {
  const searchSupabase = async () => {
    if (!normalizedQuery) {
      setUserResults([]);
      setMeetupResults([]);
      return;
    }

    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, username, is_verified, profileIMG_url")
      .ilike("username", `%${normalizedQuery}%`)
      .limit(10);

    if (usersError) {
      console.error("Error searching users:", usersError);
    } else {
      setUserResults(users || []);
    }

    const { data: meetups, error: meetupsError } = await supabase
      .from("meetups")
      .select("*")
      .or(
        `location.ilike.%${normalizedQuery}%,category.ilike.%${normalizedQuery}%`
      )
      .order("meetup_date", { ascending: true })
      .limit(10);

    if (meetupsError) {
      console.error("Error searching meetups:", meetupsError);
    } else {
      let verifiedCreatorIds = [];

if (filters.verifiedHostsOnly && meetups?.length > 0) {
  const creatorIds = [
    ...new Set(
      meetups
        .map((meetup) => meetup.creator_id)
        .filter(Boolean)
    ),
  ];

  const { data: verifiedProfiles, error: verifiedError } =
    await supabase
      .from("profiles")
      .select("id")
      .in("id", creatorIds)
      .eq("is_verified", true);

  if (verifiedError) {
    console.error(
      "Error fetching verified hosts:",
      verifiedError
    );
  } else {
    verifiedCreatorIds = (verifiedProfiles || []).map(
      (profile) => profile.id
    );
  }
}
      const formattedMeetups = (meetups || []).map((meetup) => {
  const [year, month, day] = meetup.meetup_date.split("-");

  return {
    id: meetup.id.toString(),
    creatorId: meetup.creator_id,
    username: meetup.username,
    location: meetup.location,
    date: `${day}/${month}/${year.slice(-2)}`,
    time: meetup.meetup_time.slice(0, 5),
    category: meetup.category,
  };
});

let filteredMeetups = formattedMeetups;

if (filters.categories.length > 0) {
  filteredMeetups = filteredMeetups.filter((meetup) =>
    filters.categories.includes(meetup.category)
  );
}
if (filters.date) {
  const today = new Date();
  const tomorrow = new Date();

  tomorrow.setDate(today.getDate() + 1);

  filteredMeetups = filteredMeetups.filter((meetup) => {
    const [day, month, year] = meetup.date.split("/");

    const meetupDate = new Date(
      2000 + Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (filters.date === "Today") {
      return meetupDate.toDateString() === today.toDateString();
    }

    if (filters.date === "Tomorrow") {
      return meetupDate.toDateString() === tomorrow.toDateString();
    }

    if (filters.date === "This week") {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);

      return meetupDate >= today && meetupDate <= endOfWeek;
    }

    return true;
  });
}
if (filters.time) {
  filteredMeetups = filteredMeetups.filter((meetup) => {
    const hour = Number(meetup.time.split(":")[0]);

    if (filters.time === "Morning") {
      return hour >= 6 && hour < 12;
    }

    if (filters.time === "Afternoon") {
      return hour >= 12 && hour < 18;
    }

    if (filters.time === "Evening") {
      return hour >= 18 && hour < 22;
    }

    if (filters.time === "Night") {
      return hour >= 22 || hour < 6;
    }

    return true;
  });
}
if (filters.verifiedHostsOnly) {
  filteredMeetups = filteredMeetups.filter((meetup) =>
    verifiedCreatorIds.includes(meetup.creatorId)
  );
}
setMeetupResults(filteredMeetups);
    }
  };

  searchSupabase();
}, [normalizedQuery, filters]);

  const removeRecentSearch = (search) => {
    setRecentSearches((currentSearches) =>
      currentSearches.filter((item) => item !== search)
    );
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const selectRecentSearch = (search) => {
    setSearchQuery(search);
  };
  const addRecentSearch = (search) => {
  const trimmedSearch = search.trim();

  if (!trimmedSearch) {
    return;
  }

  setRecentSearches((currentSearches) => {
    const withoutDuplicate = currentSearches.filter(
      (item) =>
        item.toLowerCase() !== trimmedSearch.toLowerCase()
    );

    return [
      trimmedSearch,
      ...withoutDuplicate,
    ].slice(0, 5);
  });
};

const toggleFollow = async (userId) => {
  if (!currentUserId) {
    navigation.navigate("Login");
    return;
  }

  if (currentUserId === userId) {
    return;
  }

  const isAlreadyFollowing = followedUsers.includes(userId);

  if (isAlreadyFollowing) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", currentUserId)
      .eq("following_id", userId);

    if (error) {
      console.error("Error unfollowing user:", error);
      return;
    }

    setFollowedUsers((currentUsers) =>
      currentUsers.filter((id) => id !== userId)
    );
  } else {
    const { error } = await supabase
      .from("follows")
      .insert([
        {
          follower_id: currentUserId,
          following_id: userId,
        },
      ]);

    if (error) {
      console.error("Error following user:", error);
      return;
    }

    setFollowedUsers((currentUsers) => [
      ...currentUsers,
      userId,
    ]);
  }
};

  const renderUser = ({ item }) => {
    const isFollowing = followedUsers.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.userCard}
        activeOpacity={0.85}
        onPress={() => {
  addRecentSearch(searchQuery);

  navigation.navigate("UserProfile", {
    user: item,
  });
}}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.username}'s profile`}
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
          <Text style={styles.username}>
            {item.username}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing && styles.followButtonActive,
          ]}
          activeOpacity={0.8}
          onPress={() => toggleFollow(item.id)}
          accessibilityRole="button"
          accessibilityLabel={
            isFollowing
              ? `Unfollow ${item.username}`
              : `Follow ${item.username}`
          }
        >
          <Ionicons
            name={
              isFollowing
                ? "checkmark"
                : "person-add-outline"
            }
            size={21}
            color={
              isFollowing
                ? COLORS.offWhite
                : COLORS.green
            }
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  const renderMeetup = ({ item }) => {
  return (
    <TouchableOpacity
      style={styles.userCard}
      activeOpacity={0.85}
      onPress={() => {
  addRecentSearch(searchQuery);

  navigation.navigate("MeetupDetail", {
    meetup: item,
  });
}}
    >
      <View style={styles.meetupIcon}>
        <Ionicons
          name="location"
          size={23}
          color={COLORS.green}
        />
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.username}>
          {item.location}
        </Text>

        <Text style={styles.meetupDetails}>
          {item.date} · {item.time} · {item.category}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color={COLORS.blue}
      />
    </TouchableOpacity>
  );
};

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <View style={styles.headerPlaceholder} />

          <Text style={styles.headerTitle}>
            Search
          </Text>

          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Close search"
          >
            <Ionicons
              name="close"
              size={24}
              color={COLORS.blue}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search users or meet-ups"
              placeholderTextColor={COLORS.blue}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search users or meet-ups"
            />

            {searchQuery.length > 0 ? (
              <TouchableOpacity
                style={styles.clearInputButton}
                activeOpacity={0.8}
                onPress={() => setSearchQuery("")}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={COLORS.span}
                />
              </TouchableOpacity>
            ) : null}

            <Ionicons
              name="search"
              size={23}
              color={COLORS.blue}
            />
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.8}
            onPress={() => setFilterModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open search filters"
          >
            <Ionicons
              name="options-outline"
              size={25}
              color={COLORS.blue}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>
            Recent searches
          </Text>

          {recentSearches.length > 0 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={clearRecentSearches}
              accessibilityRole="button"
              accessibilityLabel="Clear all recent searches"
            >
              <Text style={styles.clearAllText}>
                Clear all
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {recentSearches.length > 0 ? (
          <View style={styles.recentSearches}>
            {recentSearches.map((search) => (
              <TouchableOpacity
                key={search}
                style={styles.recentChip}
                activeOpacity={0.8}
                onPress={() => selectRecentSearch(search)}
                accessibilityRole="button"
                accessibilityLabel={`Search for ${search}`}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={COLORS.blue}
                />

                <Text style={styles.recentChipText}>
                  {search}
                </Text>

                <TouchableOpacity
                  style={styles.removeChipButton}
                  activeOpacity={0.8}
                  onPress={() => removeRecentSearch(search)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${search} from recent searches`}
                >
                  <Ionicons
                    name="close"
                    size={19}
                    color={COLORS.blue}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noRecentText}>
            No recent searches yet.
          </Text>
        )}

        {normalizedQuery ? (
  <ScrollView
    style={styles.resultsList}
    contentContainerStyle={styles.resultsContent}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
  >
    {userResults.length > 0 ? (
      <>
        <Text style={styles.resultSectionTitle}>
          Users
        </Text>

        {userResults.map((user) => (
          <View key={`user-${user.id}`}>
            {renderUser({ item: user })}
          </View>
        ))}
      </>
    ) : null}

    {meetupResults.length > 0 ? (
      <>
        <Text style={styles.resultSectionTitle}>
          Meet-ups
        </Text>

        {meetupResults.map((meetup) => (
          <View key={`meetup-${meetup.id}`}>
            {renderMeetup({ item: meetup })}
          </View>
        ))}
      </>
    ) : null}

    {userResults.length === 0 &&
    meetupResults.length === 0 ? (
      <View style={styles.emptyState}>
        <Ionicons
          name="search-outline"
          size={56}
          color={COLORS.span}
        />

        <Text style={styles.emptyTitle}>
          No results found
        </Text>

        <Text style={styles.emptyText}>
          Try searching for another user or meet-up.
        </Text>
      </View>
    ) : null}
  </ScrollView>
) : null}
      </KeyboardAvoidingView>
      <FilterModal
  visible={filterModalVisible}
  onClose={() => setFilterModalVisible(false)}
  onApply={(selectedFilters) => {
    setFilters(selectedFilters);
  }}
/>
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
    minHeight: 68,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerPlaceholder: {
    width: 40,
  },

  headerTitle: {
    color: COLORS.blue,
    fontSize: 20,
    fontWeight: "700",
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  searchRow: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  searchContainer: {
    flex: 1,
    minHeight: 46,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: 13,
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

  searchInput: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 15,
    paddingVertical: 10,
  },

  clearInputButton: {
    width: 30,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  filterButton: {
    width: 42,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 3,
  },

  recentHeader: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
  },

  clearAllText: {
    color: COLORS.green,
    fontSize: 15,
  },

  recentSearches: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  recentChip: {
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    paddingLeft: 10,
    paddingRight: 4,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  recentChipText: {
    color: COLORS.blue,
    fontSize: 14,
    marginLeft: 6,
  },

  removeChipButton: {
    width: 32,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  noRecentText: {
    color: COLORS.span,
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  resultsList: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: COLORS.midGray,
  },

  resultsContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 25,
  },

  userCard: {
    minHeight: 70,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginBottom: 10,
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

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  userInfo: {
    flex: 1,
  },

  username: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },

  mutualFriends: {
    color: COLORS.span,
    fontSize: 13,
  },

  followButton: {
    width: 42,
    height: 42,
    borderRadius: 7,
    backgroundColor: COLORS.lightgreen,
    alignItems: "center",
    justifyContent: "center",
  },

  followButtonActive: {
    backgroundColor: COLORS.green,
  },

  emptyState: {
    minHeight: 280,
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
  resultSectionTitle: {
  color: COLORS.blue,
  fontSize: 17,
  fontWeight: "700",
  marginBottom: 10,
  marginTop: 4,
},

meetupIcon: {
  width: 43,
  height: 43,
  borderRadius: 22,
  backgroundColor: COLORS.lightgreen,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 11,
},

meetupDetails: {
  color: COLORS.span,
  fontSize: 13,
},
profileImage: {
  width: "100%",
  height: "100%",
  borderRadius: 22,
},
});