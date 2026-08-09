import React, { useState } from "react";
import { View, Text, TouchableOpacity,TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";

export default function AddContactScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleAddContact = async () => {
  const trimmedName = name.trim();
  const trimmedPhoneNumber = phoneNumber.trim();

  if (!trimmedName || !trimmedPhoneNumber) {
    Alert.alert(
      "Missing information",
      "Please enter both a name and phone number."
    );
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    navigation.navigate("Login");
    return;
  }

  const { error } = await supabase
    .from("emergency_contacts")
    .insert([
      {
        user_id: session.user.id,
        name: trimmedName,
        phone_number: trimmedPhoneNumber,
      },
    ]);

  if (error) {
    console.error("Error adding emergency contact:", error);

    Alert.alert(
      "Could not add contact",
      "Please try again."
    );

    return;
  }

  Alert.alert(
    "Contact added",
    `${trimmedName} was added as an emergency contact.`,
    [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]
  );
};

  const handleAddPhoto = () => {
    console.log("Add photo pressed");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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

          <Text style={styles.headerTitle}>Add Contact</Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.photoSection}
            activeOpacity={0.8}
            onPress={handleAddPhoto}
            accessibilityRole="button"
            accessibilityLabel="Add contact photo"
          >
            <View style={styles.photoCircle}>
              <Ionicons
                name="camera"
                size={56}
                color={COLORS.blue}
              />
            </View>

            <Text style={styles.addPhotoText}>Add photo</Text>
          </TouchableOpacity>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={21}
                color={COLORS.span}
              />

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Vanessa Johnson"
                placeholderTextColor={COLORS.span}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                accessibilityLabel="Contact name"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone number</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={21}
                color={COLORS.span}
              />

              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+32 4 12 34 56 78"
                placeholderTextColor={COLORS.span}
                keyboardType="phone-pad"
                autoCorrect={false}
                returnKeyType="done"
                accessibilityLabel="Contact phone number"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={handleAddContact}
            accessibilityRole="button"
            accessibilityLabel="Add emergency contact"
          >
            <Ionicons
              name="person-add-outline"
              size={24}
              color={COLORS.offWhite}
            />

            <Text style={styles.addButtonText}>
              Add Contact
            </Text>
          </TouchableOpacity>
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

  headerTitle: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginHorizontal: 8,
  },

  headerPlaceholder: {
    width: 44,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  photoSection: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 45,
  },

  photoCircle: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 4,
    borderColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },

  addPhotoText: {
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "700",
  },

  formGroup: {
    marginBottom: 22,
  },

  label: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  inputContainer: {
    minHeight: 52,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: 12,
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

  input: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 12,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: COLORS.offWhite,
  },

  addButton: {
    minHeight: 66,
    borderRadius: 9,
    backgroundColor: COLORS.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    color: COLORS.offWhite,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 9,
  },
});