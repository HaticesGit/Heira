import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";

export default function VerifyIdentityScreen({ navigation }) {
  const [documentOne, setDocumentOne] = useState(null);
  const [documentTwo, setDocumentTwo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const pickDocument = async (documentNumber) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];

        if (documentNumber === 1) {
          setDocumentOne(selectedImage);
        }

        if (documentNumber === 2) {
          setDocumentTwo(selectedImage);
        }
      }
    } catch (error) {
      console.error("Error selecting document:", error);

      Alert.alert(
        "Could not select photo",
        "Please try again."
      );
    }
  };

  const uploadDocument = async (
    image,
    documentNumber,
    userId
  ) => {
    const response = await fetch(image.uri);
    const arrayBuffer = await response.arrayBuffer();

    const fileExtension =
      image.fileName?.split(".").pop() || "jpg";

    const filePath =
      `${userId}/document-${documentNumber}-${Date.now()}.${fileExtension}`;

    const { error } = await supabase.storage
      .from("identity-documents")
      .upload(filePath, arrayBuffer, {
        contentType: image.mimeType || "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    return filePath;
  };

  const handleSubmit = async () => {
    if (!documentOne) {
      Alert.alert(
        "Document required",
        "Please upload at least one document before submitting."
      );
      return;
    }

    try {
      setSubmitting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert(
          "Not logged in",
          "You need to be logged in to verify your identity."
        );
        return;
      }

      await uploadDocument(
        documentOne,
        1,
        user.id
      );

      if (documentTwo) {
        await uploadDocument(
          documentTwo,
          2,
          user.id
        );
      }

      Alert.alert(
        "Submitted",
        "Your document has been submitted for verification."
      );

      setDocumentOne(null);
      setDocumentTwo(null);
    } catch (error) {
      console.error(
        "Identity verification error:",
        error
      );

      Alert.alert(
        "Upload failed",
        "Your document could not be submitted. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderDocumentUpload = (
    document,
    documentNumber,
    setDocument,
    optional = false
  ) => {
    if (!document) {
      return (
        <TouchableOpacity
          style={styles.uploadBox}
          activeOpacity={0.8}
          onPress={() => pickDocument(documentNumber)}
        >
          <View style={styles.uploadIcon}>
            <Ionicons
              name="cloud-upload-outline"
              size={32}
              color={COLORS.green}
            />
          </View>

          <Text style={styles.uploadTitle}>
            Upload document {documentNumber}
          </Text>

          <Text style={styles.uploadText}>
            {optional
              ? "Add another document image if needed."
              : "Choose a clear photo of your document."}
          </Text>

          <View style={styles.chooseButton}>
            <Text style={styles.chooseButtonText}>
              Choose photo
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.previewCard}>
        <Image
          source={{ uri: document.uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />

        <View style={styles.previewInfo}>
          <View style={styles.selectedRow}>
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={COLORS.green}
            />

            <Text style={styles.selectedText}>
              Document {documentNumber} selected
            </Text>
          </View>

          <View style={styles.imageActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                pickDocument(documentNumber)
              }
            >
              <Text style={styles.replaceText}>
                Replace
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDocument(null)}
            >
              <Text style={styles.removeText}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const canSubmit = documentOne && !submitting;

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
            Verify identity
          </Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            Become a verified member
          </Text>

          <Text style={styles.description}>
            Upload a clear document that can help us
            verify your identity. You can add a second
            image if needed.
          </Text>

          <View style={styles.infoCard}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color={COLORS.blue}
            />

            <Text style={styles.infoCardText}>
              Your documents are only used for
              verification and will never be shown on
              your public profile.
            </Text>
          </View>

          <View style={styles.requirementCard}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={COLORS.blue}
            />

            <Text style={styles.requirementText}>
              One document image is required. A second
              image is optional. If you upload an
              identity card, please include both the
              front and back.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Verification documents
          </Text>

          <Text style={styles.documentLabel}>
            Document 1
          </Text>

          {renderDocumentUpload(
            documentOne,
            1,
            setDocumentOne
          )}

          <View style={styles.optionalLabelRow}>
            <Text style={styles.documentLabel}>
              Document 2
            </Text>

            <Text style={styles.optionalText}>
              Optional
            </Text>
          </View>

          {renderDocumentUpload(
            documentTwo,
            2,
            setDocumentTwo,
            true
          )}

          <View style={styles.notice}>
            <Ionicons
              name="eye-outline"
              size={21}
              color={COLORS.blue}
            />

            <Text style={styles.noticeText}>
              Make sure all relevant information is
              readable and the full document is visible
              in each photo.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              !canSubmit &&
                styles.submitButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Text style={styles.submitButtonText}>
              {submitting
                ? "Submitting..."
                : "Submit for verification"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.midGray,

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  headerPlaceholder: {
    width: 44,
  },

  headerTitle: {
    color: COLORS.blue,
    fontSize: 23,
    fontWeight: "700",
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 45,
  },

  title: {
    color: COLORS.blue,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  description: {
    color: COLORS.span,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 12,
    marginBottom: 24,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 10,
    backgroundColor: COLORS.lightBlue,
    marginBottom: 12,
  },

  infoCardText: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 13,
    lineHeight: 19,
    marginLeft: 9,
  },

  requirementCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    marginBottom: 26,
  },

  requirementText: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 13,
    lineHeight: 19,
    marginLeft: 9,
  },

  sectionTitle: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 18,
  },

  documentLabel: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 9,
  },

  optionalLabelRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  optionalText: {
    color: COLORS.span,
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 7,
    marginTop: 1,
  },

  uploadBox: {
    minHeight: 190,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.span,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 22,
    marginBottom: 22,
  },

  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.lightgreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  uploadTitle: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  uploadText: {
    color: COLORS.span,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },

  chooseButton: {
    minHeight: 42,
    borderRadius: 9,
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  chooseButtonText: {
    color: COLORS.offWhite,
    fontSize: 14,
    fontWeight: "700",
  },

  previewCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    overflow: "hidden",
    backgroundColor: COLORS.offWhite,
    marginBottom: 22,
  },

  previewImage: {
    width: "100%",
    height: 210,
  },

  previewInfo: {
    padding: 14,
  },

  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  selectedText: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 7,
  },

  imageActions: {
    flexDirection: "row",
    marginTop: 12,
  },

  replaceText: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: "700",
    marginRight: 22,
  },

  removeText: {
    color: COLORS.red,
    fontSize: 14,
    fontWeight: "700",
  },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
    padding: 13,
    borderRadius: 10,
    backgroundColor: COLORS.lightBlue,
  },

  noticeText: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 13,
    lineHeight: 19,
    marginLeft: 8,
  },

  submitButton: {
    minHeight: 54,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  submitButtonDisabled: {
    opacity: 0.45,
  },

  submitButtonText: {
    color: COLORS.offWhite,
    fontSize: 16,
    fontWeight: "700",
  },
});