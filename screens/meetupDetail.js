import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";

export default function MeetupDetailScreen({ navigation, route }) {
  const meetupId = route.params?.meetup?.id;

  const [meetup, setMeetup] = useState(route.params?.meetup || null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";

    const dateObject = new Date(`${date}T00:00:00`);

    return dateObject.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";

    return time.slice(0, 5);
  };

  const fetchMeetupDetails = useCallback(async () => {
    if (!meetupId) {
      setLoading(false);
      return;
    }

    try {
      const { data: meetupData, error: meetupError } = await supabase
        .from("meetups")
        .select("*")
        .eq("id", meetupId)
        .single();

      if (meetupError) {
        console.error("Error fetching meetup:", meetupError);

        Alert.alert(
          "Could not load meet-up",
          "Please try again."
        );

        return;
      }

      let creatorUsername = meetupData.username || "Unknown user";

      if (meetupData.creator_id) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", meetupData.creator_id)
          .single();

        if (!profileError && profileData) {
          creatorUsername = profileData.username;
        }
      }

      const { count: participantCount, error: participantError } =
        await supabase
          .from("meetup_participants")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("meetup_id", meetupId);

      if (participantError) {
        console.error(
          "Error fetching participant count:",
          participantError
        );
      }

      const { count: commentCount, error: commentError } =
        await supabase
          .from("comments")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("meetup_id", meetupId);

      if (commentError) {
        console.error(
          "Error fetching comment count:",
          commentError
        );
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      let joined = false;

      if (session) {
        const { data: participant, error: joinedError } =
          await supabase
            .from("meetup_participants")
            .select("id")
            .eq("meetup_id", meetupId)
            .eq("user_id", session.user.id)
            .maybeSingle();

        if (joinedError) {
          console.error(
            "Error checking joined state:",
            joinedError
          );
        } else {
          joined = !!participant;
        }
      }

      setMeetup({
        id: meetupData.id.toString(),
        creatorId: meetupData.creator_id,
        username: creatorUsername,
        title: meetupData.location,
        location: meetupData.location,
        date: formatDate(meetupData.meetup_date),
        time: formatTime(meetupData.meetup_time),
        category: meetupData.category,
        participantCount: participantCount || 0,
        commentCount: commentCount || 0,
      });

      setIsJoined(joined);
    } catch (error) {
      console.error(
        "Unexpected meetup detail error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [meetupId]);

  useFocusEffect(
    useCallback(() => {
      fetchMeetupDetails();
    }, [fetchMeetupDetails])
  );

  const handleJoinMeetup = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigation.navigate("Login");
      return;
    }

    setJoinLoading(true);

    try {
      const { data: existingParticipant, error: checkError } =
        await supabase
          .from("meetup_participants")
          .select("id")
          .eq("meetup_id", meetupId)
          .eq("user_id", session.user.id)
          .maybeSingle();

      if (checkError) {
        console.error(
          "Error checking participant:",
          checkError
        );
        return;
      }

      if (existingParticipant) {
        const { error: deleteError } = await supabase
          .from("meetup_participants")
          .delete()
          .eq("id", existingParticipant.id);

        if (deleteError) {
          console.error(
            "Error leaving meetup:",
            deleteError
          );
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from("meetup_participants")
          .insert([
            {
              meetup_id: meetupId,
              user_id: session.user.id,
            },
          ]);

        if (insertError) {
          console.error(
            "Error joining meetup:",
            insertError
          );
          return;
        }
      }

      await fetchMeetupDetails();
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading && !meetup) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <ActivityIndicator
            size="large"
            color={COLORS.blue}
          />

          <Text style={styles.loadingText}>
            Loading meet-up...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!meetup) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <Text style={styles.loadingText}>
            Meet-up not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const visibleParticipantAvatars = Math.min(
    meetup.participantCount,
    5
  );

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
            >
              <Ionicons
                name="arrow-back"
                size={29}
                color={COLORS.blue}
              />
            </TouchableOpacity>

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {meetup.category}
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            <TouchableOpacity
              style={styles.avatar}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate("UserProfile", {
                  user: {
                    id: meetup.creatorId,
                    username: meetup.username,
                  },
                })
              }
            >
              <Ionicons
                name="person"
                size={39}
                color={COLORS.blue}
              />
            </TouchableOpacity>

            <Text style={styles.title}>
              {meetup.title || meetup.location}
            </Text>

            <View style={styles.hostRow}>
              <Text style={styles.hostLabel}>
                Hosted by{" "}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("UserProfile", {
                    user: {
                      id: meetup.creatorId,
                      username: meetup.username,
                    },
                  })
                }
              >
                <Text style={styles.hostName}>
                  {meetup.username}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsSection}>
              <DetailRow
                icon="location"
                iconColor={COLORS.green}
                text={meetup.location}
              />

              <DetailRow
                icon="calendar"
                iconColor={COLORS.blue}
                text={meetup.date}
              />

              <DetailRow
                icon="time"
                iconColor={COLORS.blue}
                text={meetup.time}
              />
            </View>

            <TouchableOpacity
              style={styles.participantsSection}
              activeOpacity={0.75}
              onPress={() =>
              navigation.navigate("Participants", {
                meetupId: meetup.id,
              })
            }
            >
              <View style={styles.participantTitleRow}>
                <Ionicons
                  name="people"
                  size={20}
                  color={COLORS.blue}
                />

                <Text style={styles.participantTitle}>
                  {meetup.participantCount}{" "}
                  {meetup.participantCount === 1
                    ? "person"
                    : "people"}{" "}
                  joined
                </Text>
              </View>

              {meetup.participantCount > 0 ? (
                <View style={styles.avatarRow}>
                  {Array.from({
                    length: visibleParticipantAvatars,
                  }).map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.participantAvatar,
                        {
                          marginLeft:
                            index === 0 ? 0 : -8,
                        },
                      ]}
                    >
                      <Ionicons
                        name="person"
                        size={19}
                        color={COLORS.blue}
                      />
                    </View>
                  ))}

                  {meetup.participantCount > 5 ? (
                    <View style={styles.moreParticipants}>
                      <Text
                        style={styles.moreParticipantsText}
                      >
                        +{meetup.participantCount - 5}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                <Text style={styles.noParticipantsText}>
                  No one has joined yet.
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.commentsButton}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("Comments", {
                meetup,
              })
            }
          >
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={COLORS.blue}
            />

            <Text style={styles.commentsButtonText}>
              {meetup.commentCount} Comments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.joinButton,
              isJoined && styles.joinButtonActive,
            ]}
            activeOpacity={0.8}
            onPress={handleJoinMeetup}
            disabled={joinLoading}
          >
            {joinLoading ? (
              <ActivityIndicator
                size="small"
                color={COLORS.offWhite}
              />
            ) : (
              <>
                <Ionicons
                  name={
                    isJoined
                      ? "checkmark-circle"
                      : "checkmark-circle-outline"
                  }
                  size={22}
                  color={COLORS.offWhite}
                />

                <Text style={styles.joinButtonText}>
                  {isJoined
                    ? "Joined"
                    : "I’ll be there"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ icon, iconColor, text }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons
        name={icon}
        size={22}
        color={iconColor}
      />

      <Text style={styles.detailText}>
        {text}
      </Text>
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

  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.span,
    fontSize: 15,
    marginTop: 10,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 28,
  },

  hero: {
    height: 180,
    backgroundColor: COLORS.lightBlue,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  backButton: {
    position: "absolute",
    top: 15,
    left: 18,
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryBadge: {
    position: "absolute",
    top: 18,
    right: 18,
    borderRadius: 10,
    backgroundColor: COLORS.lightgreen,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },

  categoryText: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "600",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 42,
  },

  avatar: {
    position: "absolute",
    top: -38,
    left: 20,
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 4,
    borderColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: COLORS.blue,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },

  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 34,
  },

  hostLabel: {
    color: COLORS.span,
    fontSize: 15,
  },

  hostName: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "600",
  },

  detailsSection: {
    marginBottom: 30,
  },

  detailRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
  },

  detailText: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 16,
    marginLeft: 17,
  },

  participantsSection: {
    alignSelf: "flex-start",
  },

  participantTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  participantTitle: {
    color: COLORS.blue,
    fontSize: 16,
    marginLeft: 15,
  },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 26,
  },

  participantAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 2,
    borderColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },

  moreParticipants: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 2,
    borderColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },

  moreParticipantsText: {
    color: COLORS.span,
    fontSize: 14,
    fontWeight: "600",
  },

  noParticipantsText: {
    color: COLORS.span,
    fontSize: 14,
    marginLeft: 35,
  },

  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: COLORS.offWhite,
    flexDirection: "row",
  },

  commentsButton: {
    flex: 0.9,
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  commentsButtonText: {
    color: COLORS.blue,
    fontSize: 15,
    marginLeft: 7,
  },

  joinButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  joinButtonActive: {
    opacity: 0.8,
  },

  joinButtonText: {
    color: COLORS.offWhite,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 7,
  },
});