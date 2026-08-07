import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";

export default function CommentsScreen({ navigation, route }) {
  const meetup = route.params?.meetup;

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const isSendDisabled = useMemo(
    () => newComment.trim().length === 0 || sending,
    [newComment, sending]
  );

  const formatCommentTime = (createdAt) => {
    if (!createdAt) return "";

    const createdDate = new Date(createdAt);
    const now = new Date();
    const differenceInMinutes = Math.floor(
      (now - createdDate) / (1000 * 60)
    );

    if (differenceInMinutes < 1) {
      return "Now";
    }

    if (differenceInMinutes < 60) {
      return `${differenceInMinutes}m ago`;
    }

    const differenceInHours = Math.floor(
      differenceInMinutes / 60
    );

    if (differenceInHours < 24) {
      return `${differenceInHours}h ago`;
    }

    const differenceInDays = Math.floor(
      differenceInHours / 24
    );

    return `${differenceInDays}d ago`;
  };

  const fetchComments = async () => {
    if (!meetup?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("meetup_id", meetup.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);

      Alert.alert(
        "Could not load comments",
        "Please try again."
      );

      setLoading(false);
      return;
    }

    const formattedComments = data.map((comment) => ({
      id: comment.id.toString(),
      username: comment.username,
      time: formatCommentTime(comment.created_at),
      text: comment.text,
    }));

    setComments(formattedComments);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [meetup?.id]);

  const handleSendComment = async () => {
    const trimmedComment = newComment.trim();

    if (!trimmedComment || !meetup?.id) {
      return;
    }

    setSending(true);

    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          meetup_id: meetup.id,
          username: "fartingUnicorn",
          text: trimmedComment,
        },
      ])
      .select()
      .single();

    setSending(false);

    if (error) {
      console.error("Error posting comment:", error);

      Alert.alert(
        "Could not post comment",
        "Please try again."
      );

      return;
    }

    const comment = {
      id: data.id.toString(),
      username: data.username,
      time: "Now",
      text: data.text,
    };

    setComments((currentComments) => [
      ...currentComments,
      comment,
    ]);

    setNewComment("");
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentCard}>
      <TouchableOpacity
        style={styles.avatar}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("UserProfile", {
            user: {
              username: item.username,
            },
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.username}'s profile`}
      >
        <Ionicons
          name="person"
          size={22}
          color={COLORS.blue}
        />
      </TouchableOpacity>

      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate("UserProfile", {
                user: {
                  username: item.username,
                },
              })
            }
          >
            <Text style={styles.username}>
              {item.username}
            </Text>
          </TouchableOpacity>

          <Text style={styles.commentTime}>
            {item.time}
          </Text>
        </View>

        <Text style={styles.commentText}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={29}
              color={COLORS.blue}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Comments
          </Text>

          <View style={styles.headerPlaceholder} />
        </View>

        {meetup?.title || meetup?.location ? (
          <Text style={styles.meetupTitle}>
            {meetup.title || meetup.location}
          </Text>
        ) : null}

        <Text style={styles.commentCount}>
          {comments.length} comments
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.blue}
            />

            <Text style={styles.loadingText}>
              Loading comments...
            </Text>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="chatbubble-outline"
                  size={48}
                  color={COLORS.span}
                />

                <Text style={styles.emptyTitle}>
                  No comments yet
                </Text>

                <Text style={styles.emptyText}>
                  Be the first to leave a comment.
                </Text>
              </View>
            }
          />
        )}

        <View style={styles.inputArea}>
          <View style={styles.currentUserAvatar}>
            <Ionicons
              name="person"
              size={21}
              color={COLORS.blue}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Write a comment..."
              placeholderTextColor={COLORS.span}
              multiline
              maxLength={500}
              accessibilityLabel="Write a comment"
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                isSendDisabled && styles.sendButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleSendComment}
              disabled={isSendDisabled}
              accessibilityRole="button"
              accessibilityLabel="Send comment"
            >
              {sending ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.blue}
                />
              ) : (
                <Ionicons
                  name="send-outline"
                  size={22}
                  color={
                    isSendDisabled
                      ? COLORS.span
                      : COLORS.blue
                  }
                />
              )}
            </TouchableOpacity>
          </View>
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

  header: {
    minHeight: 72,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginHorizontal: 8,
  },

  headerPlaceholder: {
    width: 44,
  },

  meetupTitle: {
    color: COLORS.span,
    fontSize: 14,
    textAlign: "center",
    marginTop: -4,
    marginBottom: 8,
  },

  commentCount: {
    color: COLORS.blue,
    fontSize: 16,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 10,
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

  list: {
    flex: 1,
  },

  listContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  commentCard: {
    minHeight: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    padding: 12,
    marginBottom: 11,
    flexDirection: "row",

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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  commentContent: {
    flex: 1,
  },

  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
  },

  username: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "700",
    marginRight: 10,
  },

  commentTime: {
    color: COLORS.span,
    fontSize: 14,
  },

  commentText: {
    color: COLORS.blue,
    fontSize: 15,
    lineHeight: 21,
  },

  emptyState: {
    flex: 1,
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 5,
  },

  emptyText: {
    color: COLORS.span,
    fontSize: 14,
    textAlign: "center",
  },

  inputArea: {
    borderTopWidth: 1,
    borderTopColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  currentUserAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginBottom: 2,
  },

  inputContainer: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    paddingLeft: 12,
    paddingRight: 5,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    color: COLORS.blue,
    fontSize: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },

  sendButton: {
    width: 40,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },
});