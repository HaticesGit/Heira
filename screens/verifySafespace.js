import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";

export default function VerifySafespaceScreen({ navigation }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [availableHours, setAvailableHours] = useState("");
  const [type, setType] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [staffTrained, setStaffTrained] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [extraImages, setExtraImages] = useState([]);
  const [ownershipDocument, setOwnershipDocument] = useState(null);

  const pickProfileImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
    base64: true,
  });

  if (!result.canceled) {
    setProfileImage(result.assets[0]);
  }
};
const pickExtraImages = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    selectionLimit: 4,
    quality: 0.8,
    base64: true,
  });

  if (!result.canceled) {
    setExtraImages(result.assets.slice(0, 4));
  }
};
const pickOwnershipDocument = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.8,
    base64: true,
  });

  if (!result.canceled) {
    setOwnershipDocument(result.assets[0]);
  }
};


  const geocodeAddress = async (location) => {
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          location
        )}&bbox=2.3,49.5,6.4,51.6`,
        {
          headers: {
            "User-Agent": "Heira/1.0",
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (!data.features?.[0]) {
        return null;
      }

      const coordinates =
        data.features[0].geometry.coordinates;

      return {
        latitude: coordinates[1],
        longitude: coordinates[0],
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const handleSaveSafespace = async () => {
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedPhone = phoneNumber.trim();

    if (
  !trimmedName ||
  !trimmedAddress ||
  !type ||
  !trimmedPhone ||
  !ownershipDocument
) {
      Alert.alert(
        "Missing information",
        "Please complete all required fields."
      );
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(
        "Terms required",
        "Please agree to the Terms of Use and Privacy Policy."
      );
      return;
    }

    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      navigation.navigate("Login");
      return;
    }

    const coordinates =
      await geocodeAddress(trimmedAddress);

    if (!coordinates) {
      setLoading(false);

      Alert.alert(
        "Location not found",
        "Please enter a more specific address."
      );

      return;
    }

    const { data: newSafespace, error } = await supabase
  .from("safespaces")
  .insert([
    {
      creator_id: session.user.id,
      name: trimmedName,
      address: trimmedAddress,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      available_hours: availableHours.trim() || null,
      type,
      phone_number: trimmedPhone,
      safety_measure: staffTrained
        ? "Staff trained to help"
        : null,
      is_verified: false,
    },
  ])
  .select()
  .single();

    setLoading(false);

    if (error) {
      console.error(
        "Error creating safespace:",
        error
      );

      Alert.alert(
        "Could not save Safespace",
        "Please try again."
      );

      return;
    }

    if (profileImage?.base64) {
  const extension =
    profileImage.fileName?.split(".").pop() || "jpg";

  const filePath =
    `${newSafespace.id}/profile.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("safespace-images")
    .upload(
      filePath,
      decode(profileImage.base64),
      {
        contentType:
          profileImage.mimeType || "image/jpeg",
      }
    );

  if (uploadError) {
    console.error(
      "Error uploading safespace image:",
      uploadError
    );

    Alert.alert(
      "Safespace saved",
      "The Safespace was saved, but the photo could not be uploaded."
    );

    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("safespace-images")
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("safespaces")
    .update({
      profile_image_url: publicUrl,
    })
    .eq("id", newSafespace.id);

  if (updateError) {
    console.error(
      "Error saving image URL:",
      updateError
    );
  }
}
if (extraImages.length > 0) {
  for (let index = 0; index < extraImages.length; index++) {
    const image = extraImages[index];

    if (!image.base64) {
      continue;
    }

    const extension =
      image.fileName?.split(".").pop() || "jpg";

    const filePath =
      `${newSafespace.id}/extra-${index + 1}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("safespace-images")
      .upload(
        filePath,
        decode(image.base64),
        {
          contentType:
            image.mimeType || "image/jpeg",
        }
      );

    if (uploadError) {
      console.error(
        "Error uploading extra image:",
        uploadError
      );

      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("safespace-images")
      .getPublicUrl(filePath);

    const { error: imageError } = await supabase
      .from("safespace_images")
      .insert([
        {
          safespace_id: newSafespace.id,
          image_url: publicUrl,
        },
      ]);

    if (imageError) {
      console.error(
        "Error saving extra image:",
        imageError
      );
    }
  }
}

if (ownershipDocument?.base64) {
  const extension =
    ownershipDocument.fileName?.split(".").pop() || "jpg";

  const documentPath =
    `${newSafespace.id}/ownership.${extension}`;

  const { error: documentUploadError } = await supabase.storage
    .from("safespace-verification")
    .upload(
      documentPath,
      decode(ownershipDocument.base64),
      {
        contentType:
          ownershipDocument.mimeType || "image/jpeg",
      }
    );

  if (documentUploadError) {
    console.error(
      "Error uploading verification document:",
      documentUploadError
    );

    Alert.alert(
      "Document upload failed",
      "The verification document could not be uploaded."
    );

    return;
  }

  const { error: documentDatabaseError } = await supabase
    .from("safespace_verification_documents")
    .insert([
      {
        safespace_id: newSafespace.id,
        document_url: documentPath,
        document_type: "ownership",
      },
    ]);

  if (documentDatabaseError) {
    console.error(
      "Error saving verification document:",
      documentDatabaseError
    );

    return;
  }
}

Alert.alert(
  "Safespace submitted",
      "Your Safespace was submitted for verification.",
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color={COLORS.blue}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Verify Safespace
          </Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoCard}>
            <Ionicons
              name="people"
              size={28}
              color={COLORS.green}
            />

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>
                Help people find a safe space when they need it most.
              </Text>

              <Text style={styles.infoText}>
                Register your location as a safe space where people can go if they feel unsafe.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Location Details
          </Text>

<TextInput
  style={styles.input}
  value={name}
  onChangeText={setName}
  placeholder="Safespace name"
  placeholderTextColor={COLORS.span}
/>

<View style={styles.documentContainer}>
  <View>
    <Text style={styles.documentLabel}>
      Safespace photo
    </Text>

    <Text style={styles.documentPlaceholder}>
      {profileImage
        ? profileImage.fileName || "Photo selected"
        : "No photo selected"}
    </Text>
  </View>

  <TouchableOpacity
    style={styles.uploadButton}
    onPress={pickProfileImage}
  >
    <Ionicons
      name="image-outline"
      size={18}
      color={COLORS.blue}
    />

    <Text style={styles.uploadText}>
      Upload
    </Text>
  </TouchableOpacity>
</View>

<View style={styles.documentContainer}>
  <View>
    <Text style={styles.documentLabel}>
      Extra photos
    </Text>

    <Text style={styles.documentPlaceholder}>
      {extraImages.length > 0
        ? `${extraImages.length} photo${
            extraImages.length === 1 ? "" : "s"
          } selected`
        : "No extra photos selected"}
    </Text>
  </View>

  <TouchableOpacity
    style={styles.uploadButton}
    onPress={pickExtraImages}
  >
    <Ionicons
      name="images-outline"
      size={18}
      color={COLORS.blue}
    />

    <Text style={styles.uploadText}>
      Upload
    </Text>
  </TouchableOpacity>
</View>

<View style={styles.documentContainer}>
  <View>
    <Text style={styles.documentLabel}>
      Photo of ownership document
    </Text>

    <Text style={styles.documentPlaceholder}>
      {ownershipDocument
        ? ownershipDocument.fileName || "Document selected"
        : "No document selected"}
    </Text>
  </View>

  <TouchableOpacity
    style={styles.uploadButton}
    onPress={pickOwnershipDocument}
  >
    <Ionicons
      name="cloud-upload-outline"
      size={18}
      color={COLORS.blue}
    />

    <Text style={styles.uploadText}>
      Upload
    </Text>
  </TouchableOpacity>
</View>
          <View style={styles.locationContainer}>
            <Ionicons
              name="location"
              size={21}
              color={COLORS.span}
            />

            <TextInput
              style={styles.locationInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter location"
              placeholderTextColor={COLORS.span}
            />
          </View>

          <TextInput
            style={styles.input}
            value={availableHours}
            onChangeText={setAvailableHours}
            placeholder="Available hours, e.g. 16:00 - 04:00"
            placeholderTextColor={COLORS.span}
          />

          <Text style={styles.sectionTitle}>
            Type
          </Text>

          <View style={styles.typeRow}>
            {["Café", "Restaurant", "Bar"].map(
              (option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.typeButton,
                    type === option &&
                      styles.typeButtonActive,
                  ]}
                  onPress={() => setType(option)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === option &&
                        styles.typeButtonTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <View style={styles.locationContainer}>
            <Ionicons
              name="call"
              size={20}
              color={COLORS.span}
            />

            <TextInput
              style={styles.locationInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+32 9 123 45 67"
              placeholderTextColor={COLORS.span}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.sectionTitle}>
            Safety measures
          </Text>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() =>
              setStaffTrained((current) => !current)
            }
          >
            <Ionicons
              name={
                staffTrained
                  ? "checkbox"
                  : "square-outline"
              }
              size={22}
              color={COLORS.blue}
            />

            <Text style={styles.checkboxText}>
              Staff trained to help
            </Text>
          </TouchableOpacity>

          <Text style={styles.reviewText}>
            All safespaces are reviewed before becoming visible.
          </Text>

          <TouchableOpacity
            style={styles.termsRow}
            onPress={() =>
              setAcceptedTerms(
                (current) => !current
              )
            }
          >
            <Ionicons
              name={
                acceptedTerms
                  ? "checkbox"
                  : "square-outline"
              }
              size={20}
              color={COLORS.blue}
            />

            <Text style={styles.termsText}>
              I agree with Terms of Use and Privacy policy.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              loading && styles.saveButtonDisabled,
            ]}
            disabled={loading}
            onPress={handleSaveSafespace}
          >
            <Text style={styles.saveButtonText}>
              {loading
                ? "Saving..."
                : "Save Safespace"}
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
    minHeight: 70,
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
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.blue,
    fontSize: 21,
    fontWeight: "700",
  },

  headerPlaceholder: {
    width: 44,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  infoCard: {
    backgroundColor: COLORS.lightgreen,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    marginBottom: 18,
  },

  infoTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  infoTitle: {
    color: COLORS.green,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 5,
  },

  infoText: {
    color: COLORS.blue,
    fontSize: 13,
    lineHeight: 18,
  },

  sectionTitle: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 8,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: COLORS.blue,
    marginBottom: 10,
  },

  documentContainer: {
    minHeight: 65,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  documentLabel: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },

  documentPlaceholder: {
    color: COLORS.span,
    fontSize: 12,
  },

  uploadButton: {
    minHeight: 36,
    borderWidth: 1,
    borderColor: COLORS.blue,
    borderRadius: 7,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  uploadText: {
    color: COLORS.blue,
    fontSize: 13,
    marginLeft: 5,
  },

  locationContainer: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  locationInput: {
    flex: 1,
    color: COLORS.blue,
    marginLeft: 8,
  },

  typeRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  typeButton: {
    borderWidth: 1,
    borderColor: COLORS.midGray,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
  },

  typeButtonActive: {
    backgroundColor: COLORS.lightgreen,
    borderColor: COLORS.green,
  },

  typeButtonText: {
    color: COLORS.blue,
  },

  typeButtonTextActive: {
    color: COLORS.green,
    fontWeight: "700",
  },

  checkboxRow: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  checkboxText: {
    color: COLORS.blue,
    marginLeft: 8,
  },

  reviewText: {
    color: COLORS.span,
    fontSize: 12,
    marginBottom: 14,
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  termsText: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 12,
    marginLeft: 8,
  },

  saveButton: {
    minHeight: 58,
    borderRadius: 8,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: COLORS.offWhite,
    fontSize: 17,
    fontWeight: "700",
  },
});