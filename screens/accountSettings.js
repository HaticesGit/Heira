import React, { useEffect, useState } from "react";
import { View, Image, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";

export default function AccountSettingsScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
const [profileImage, setProfileImage] = useState(null);
const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigation.navigate("Login");
          return;
        }

        setEmail(user.email || "");

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("username, bio, profileIMG_url")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error loading profile:", error);

          Alert.alert(
            "Could not load account",
            "Please try again."
          );

          return;
        }

        setUsername(profile?.username || "");
        setBio(profile?.bio || "");
        setProfileImage(profile?.profileIMG_url || null);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [navigation]);

  const handleChangeProfileImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const selectedImage = result.assets[0];

    setUploadingImage(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigation.navigate("Login");
      return;
    }

    const response = await fetch(selectedImage.uri);
    const arrayBuffer = await response.arrayBuffer();

    const extension =
      selectedImage.fileName?.split(".").pop() || "jpg";

    const filePath = `${user.id}/avatar.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, arrayBuffer, {
        contentType:
          selectedImage.mimeType || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error(
        "Error uploading profile image:",
        uploadError
      );

      Alert.alert(
        "Upload failed",
        "Your profile image could not be uploaded."
      );

      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        profileIMG_url: publicUrl,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error(
        "Error saving profile image URL:",
        profileError
      );

      Alert.alert(
        "Could not save image",
        "Please try again."
      );

      return;
    }

    setProfileImage(publicUrl);

    Alert.alert(
      "Profile photo updated",
      "Your new profile photo has been saved."
    );
  } catch (error) {
    console.error(
      "Unexpected profile image error:",
      error
    );

    Alert.alert(
      "Something went wrong",
      "Please try again."
    );
  } finally {
    setUploadingImage(false);
  }
};

  const handleSaveProfile = async () => {
    const trimmedBio = bio.trim();

    try {
      setSavingProfile(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigation.navigate("Login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          bio: trimmedBio,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);

        Alert.alert(
          "Could not save changes",
          "Please try again."
        );

        return;
      }

      Alert.alert(
        "Saved",
        "Your profile has been updated."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert(
        "Password too short",
        "Your password must contain at least 6 characters."
      );
      return;
    }

    try {
      setSavingPassword(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Error updating password:", error);

        Alert.alert(
          "Could not update password",
          error.message || "Please try again."
        );

        return;
      }

      setNewPassword("");

      Alert.alert(
        "Password updated",
        "Your password has been changed."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.blue}
          />

          <Text style={styles.loadingText}>
            Loading account...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
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
            Account settings
          </Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <Text style={styles.sectionTitle}>
            Profile
          </Text>
        <View style={styles.profileImageSection}>
  <TouchableOpacity
    style={styles.profileImageButton}
    activeOpacity={0.8}
    onPress={handleChangeProfileImage}
    disabled={uploadingImage}
  >
    {profileImage ? (
      <Image
        source={{ uri: profileImage }}
        style={styles.profileImage}
      />
    ) : (
      <View style={styles.profileImagePlaceholder}>
        <Ionicons
          name="person"
          size={42}
          color={COLORS.blue}
        />
      </View>
    )}

    <View style={styles.cameraBadge}>
      {uploadingImage ? (
        <ActivityIndicator
          size="small"
          color={COLORS.offWhite}
        />
      ) : (
        <Ionicons
          name="camera"
          size={18}
          color={COLORS.offWhite}
        />
      )}
    </View>
  </TouchableOpacity>

  <Text style={styles.changePhotoText}>
    Change profile photo
  </Text>
</View>
          <View style={styles.card}>
            <Text style={styles.label}>
              Username
            </Text>

            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>
                @{username}
              </Text>
            </View>

            <Text style={styles.helperText}>
              Your username is generated automatically
              and cannot be changed.
            </Text>

            <Text style={styles.label}>
              Bio
            </Text>

            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell the community something about yourself"
              placeholderTextColor={COLORS.span}
              multiline
              maxLength={150}
            />

            <Text style={styles.characterCount}>
              {bio.length}/150
            </Text>

            <TouchableOpacity
              style={[
                styles.saveButton,
                savingProfile && styles.disabledButton,
              ]}
              activeOpacity={0.8}
              onPress={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.offWhite}
                />
              ) : (
                <Text style={styles.saveButtonText}>
                  Save changes
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>
            Login details
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>
              Email
            </Text>

            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>
                {email}
              </Text>
            </View>

            <Text style={styles.helperText}>
              Your email address cannot be changed here yet.
            </Text>

            <Text style={styles.label}>
              New password
            </Text>

            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter a new password"
              placeholderTextColor={COLORS.span}
              secureTextEntry
              returnKeyType="done"
            />

            <TouchableOpacity
              style={[
                styles.passwordButton,
                (!newPassword || savingPassword) &&
                  styles.disabledButton,
              ]}
              activeOpacity={0.8}
              onPress={handleChangePassword}
              disabled={!newPassword || savingPassword}
            >
              {savingPassword ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.offWhite}
                />
              ) : (
                <Text style={styles.passwordButtonText}>
                  Change password
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    fontSize: 22,
    fontWeight: "700",
  },

  headerPlaceholder: {
    width: 44,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 120,
  },

  sectionTitle: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 8,
  },

  card: {
    borderWidth: 1,
    borderColor: COLORS.midGray,
    borderRadius: 12,
    backgroundColor: COLORS.offWhite,
    padding: 14,
    marginBottom: 24,
  },

  label: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 7,
  },

  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    borderRadius: 9,
    color: COLORS.blue,
    fontSize: 15,
    paddingHorizontal: 12,
    marginBottom: 16,
  },

  bioInput: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: "top",
    marginBottom: 5,
  },

  characterCount: {
    color: COLORS.span,
    fontSize: 12,
    textAlign: "right",
    marginBottom: 15,
  },

  disabledInput: {
    minHeight: 46,
    borderRadius: 9,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    paddingHorizontal: 12,
    marginBottom: 7,
  },

  disabledInputText: {
    color: COLORS.span,
    fontSize: 15,
  },

  helperText: {
    color: COLORS.span,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 18,
  },

  saveButton: {
    minHeight: 50,
    borderRadius: 9,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: COLORS.offWhite,
    fontSize: 15,
    fontWeight: "700",
  },

  passwordButton: {
    minHeight: 50,
    borderRadius: 9,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  passwordButtonText: {
    color: COLORS.offWhite,
    fontSize: 15,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.45,
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
  profileImageSection: {
  alignItems: "center",
  marginBottom: 22,
},

profileImageButton: {
  width: 110,
  height: 110,
  borderRadius: 55,
  position: "relative",
},

profileImage: {
  width: 110,
  height: 110,
  borderRadius: 55,
},

profileImagePlaceholder: {
  width: 110,
  height: 110,
  borderRadius: 55,
  backgroundColor: COLORS.lightBlue,
  alignItems: "center",
  justifyContent: "center",
},

cameraBadge: {
  position: "absolute",
  right: 0,
  bottom: 3,
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: COLORS.green,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2,
  borderColor: COLORS.offWhite,
},

changePhotoText: {
  color: COLORS.green,
  fontSize: 14,
  fontWeight: "600",
  marginTop: 8,
},
});