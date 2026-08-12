import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";

export default function ParticipantsScreen({ navigation, route }) {
  const meetupId = route.params?.meetupId;

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipants = useCallback(async () => {
    if (!meetupId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data: participantData, error: participantError } =
        await supabase
          .from("meetup_participants")
          .select("user_id")
          .eq("meetup_id", meetupId);

      if (participantError) {
        console.error(
          "Error fetching meetup participants:",
          participantError
        );
        return;
      }

      const userIds = (participantData || []).map(
        (participant) => participant.user_id
      );

      if (userIds.length === 0) {
        setParticipants([]);
        return;
      }

      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, username, is_verified")
          .in("id", userIds);

      if (profileError) {
        console.error(
          "Error fetching participant profiles:",
          profileError
        );
        return;
      }

      setParticipants(profileData || []);
    } catch (error) {
      console.error(
        "Unexpected participants error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [meetupId]);

  useFocusEffect(
    useCallback(() => {
      fetchParticipants();
    }, [fetchParticipants])
  );

  const renderParticipant = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.participantCard}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("UserProfile", {
            user: item,
          })
        }
      >
        <View style={styles.avatar}>
          <Ionicons
            name="person"
            size={24}
            color={COLORS.blue}
          />
        </View>

        <View style={styles.participantInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>
              {item.username || "Unknown user"}
            </Text>

            {item.is_verified ? (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={COLORS.green}
              />
            ) : null}
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={21}
          color={COLORS.blue}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={29}
              color={COLORS.blue}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Participants
          </Text>

          <View style={styles.headerPlaceholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.blue}
            />

            <Text style={styles.loadingText}>
              Loading participants...
            </Text>
          </View>
        ) : participants.length > 0 ? (
          <FlatList
            data={participants}
            keyExtractor={(item) => item.id}
            renderItem={renderParticipant}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={58}
              color={COLORS.span}
            />

            <Text style={styles.emptyTitle}>
              No participants yet
            </Text>

            <Text style={styles.emptyText}>
              Nobody has joined this meet-up yet.
            </Text>
          </View>
        )}
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
    height: 72,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.blue,
    fontSize: 23,
    fontWeight: "700",
  },

  headerPlaceholder: {
    width: 44,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.span,
    fontSize: 14,
    marginTop: 10,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 30,
  },

  participantCard: {
    minHeight: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  participantInfo: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  username: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
    marginRight: 6,
  },

  emptyState: {
    flex: 1,
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
    fontSize: 14,
    textAlign: "center",
  },
});