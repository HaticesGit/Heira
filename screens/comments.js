import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

const INITIAL_COMMENTS = [
  {
    id: "1",
    username: "SquishyChameleon",
    time: "5m ago",
    text: "So excited! can’t wait to see you there!",
  },
  {
    id: "2",
    username: "SquishyChameleon",
    time: "5m ago",
    text: "So excited! can’t wait to see you there!",
  },
  {
    id: "3",
    username: "SquishyChameleon",
    time: "5m ago",
    text: "So excited! can’t wait to see you there!",
  },
  {
    id: "4",
    username: "SquishyChameleon",
    time: "5m ago",
    text: "So excited! can’t wait to see you there!",
  },
];

export default function CommentsScreen({ navigation, route }) {
  const meetup = route.params?.meetup;
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState("");

  const isSendDisabled = useMemo(
    () => newComment.trim().length === 0,
    [newComment]
  );

  const handleSendComment = () => {
    const trimmedComment = newComment.trim();

    if (!trimmedComment) return;

    const comment = {
      id: Date.now().toString(),
      username: "fartingUnicorn",
      time: "Now",
      text: trimmedComment,
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
        onPress={() => navigation.navigate("Profile")}
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
            onPress={() => navigation.navigate("Profile")}
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

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

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
              <Ionicons
                name="send-outline"
                size={22}
                color={
                  isSendDisabled
                    ? COLORS.span
                    : COLORS.blue
                }
              />
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

  list: {
    flex: 1,
  },

  listContent: {
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