import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

const USERS = [
  {
    id: "1",
    username: "CrazyKoala",
    mutualFriends: 12,
  },
  {
    id: "2",
    username: "SquishyChameleon",
    mutualFriends: 8,
  },
  {
    id: "3",
    username: "NightOwl",
    mutualFriends: 5,
  },
  {
    id: "4",
    username: "BraveBunny",
    mutualFriends: 3,
  },
];

const INITIAL_RECENT_SEARCHES = [
  "SquishyChameleon",
  "NightOwl",
  "BraveBunny",
];

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(
    INITIAL_RECENT_SEARCHES
  );
  const [followedUsers, setFollowedUsers] = useState([]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return USERS.filter((user) =>
      user.username.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

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

  const toggleFollow = (userId) => {
    setFollowedUsers((currentUsers) => {
      const isAlreadyFollowing = currentUsers.includes(userId);

      if (isAlreadyFollowing) {
        return currentUsers.filter((id) => id !== userId);
      }

      return [...currentUsers, userId];
    });
  };

  const renderUser = ({ item }) => {
    const isFollowing = followedUsers.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.userCard}
        activeOpacity={0.85}
        onPress={() => {
          console.log("User selected:", item.username);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.username}'s profile`}
      >
        <View style={styles.avatar}>
          <Ionicons
            name="person"
            size={23}
            color={COLORS.blue}
          />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.username}>
            {item.username}
          </Text>

          <Text style={styles.mutualFriends}>
            {item.mutualFriends} mutual friends
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
              placeholder="Search users"
              placeholderTextColor={COLORS.blue}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search users"
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
            onPress={() => console.log("Search filters pressed")}
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
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            style={styles.resultsList}
            contentContainerStyle={styles.resultsContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="search-outline"
                  size={56}
                  color={COLORS.span}
                />

                <Text style={styles.emptyTitle}>
                  No users found
                </Text>

                <Text style={styles.emptyText}>
                  Try searching for another username.
                </Text>
              </View>
            }
          />
        ) : null}
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
});