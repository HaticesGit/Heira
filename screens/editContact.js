import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

export default function EditContactScreen({ navigation, route }) {
  const contact = route.params?.contact ?? {
    id: "1",
    name: "Vanessa Johnson",
    phone: "+32 4 12 34 56 78",
  };

  const [name, setName] = useState(contact.name);
  const [phoneNumber, setPhoneNumber] = useState(contact.phone);

  const handleConfirm = () => {
    const trimmedName = name.trim();
    const trimmedPhoneNumber = phoneNumber.trim();

    if (!trimmedName || !trimmedPhoneNumber) {
      Alert.alert(
        "Missing information",
        "Please enter both a name and phone number."
      );
      return;
    }

    const updatedContact = {
      ...contact,
      name: trimmedName,
      phone: trimmedPhoneNumber,
    };

    console.log("Updated contact:", updatedContact);

    Alert.alert(
      "Contact updated",
      `${trimmedName} was updated successfully.`,
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete contact",
      `Are you sure you want to delete ${contact.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log("Deleted contact:", contact.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleChangePhoto = () => {
    console.log("Change photo pressed");
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

          <Text style={styles.headerTitle}>Edit Contact</Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <Ionicons
                name="person"
                size={62}
                color={COLORS.blue}
              />

              <TouchableOpacity
                style={styles.cameraButton}
                activeOpacity={0.8}
                onPress={handleChangePhoto}
                accessibilityRole="button"
                accessibilityLabel="Change contact photo"
              >
                <Ionicons
                  name="camera"
                  size={20}
                  color={COLORS.offWhite}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.contactName}>
              {name || contact.name}
            </Text>
          </View>

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
                accessibilityLabel="Contact phone number"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            activeOpacity={0.8}
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${contact.name}`}
          >
            <Ionicons
              name="trash"
              size={20}
              color={COLORS.red}
            />

            <Text style={styles.deleteButtonText}>
              Delete contact
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            activeOpacity={0.8}
            onPress={handleConfirm}
            accessibilityRole="button"
            accessibilityLabel="Confirm contact changes"
          >
            <Text style={styles.confirmButtonText}>
              Confirm
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

  profileSection: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 42,
  },

  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightgreen,
    borderWidth: 3,
    borderColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 3,
  },

  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.offWhite,
  },

  contactName: {
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

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
  },

  deleteButtonText: {
    color: COLORS.red,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: COLORS.offWhite,
  },

  confirmButton: {
    minHeight: 66,
    borderRadius: 9,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  confirmButtonText: {
    color: COLORS.offWhite,
    fontSize: 17,
    fontWeight: "700",
  },
});