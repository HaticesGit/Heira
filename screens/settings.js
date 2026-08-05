import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

export default function SettingsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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

          <Text style={styles.headerTitle}>Setting</Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.content}>
          <SettingRow
            label="Emergency contacts"
            buttonText="View"
            onPress={() => navigation.navigate("EmergencyContacts")}
          />

          <SettingRow
            label="Language"
            value="English"
            showChevron
            onPress={() => {
              console.log("Language pressed");
            }}
          />

          <SettingRow
            label="Add safespace"
            buttonText="View"
            onPress={() => {
              console.log("Add safespace pressed");
            }}
          />

          <SettingRow
            label="Account settings"
            buttonText="View"
            onPress={() => {
              console.log("Account settings pressed");
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function SettingRow({
  label,
  value,
  buttonText,
  showChevron = false,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.settingLabel}>{label}</Text>

      <View style={styles.settingAction}>
        {value ? (
          <Text style={styles.settingValue}>{value}</Text>
        ) : null}

        {buttonText ? (
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>
              {buttonText}
            </Text>
          </View>
        ) : null}

        {showChevron ? (
          <Ionicons
            name="chevron-forward"
            size={21}
            color={COLORS.blue}
          />
        ) : null}
      </View>
    </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: "700",
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 7,
  },

  settingRow: {
    minHeight: 61,
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginBottom: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  settingLabel: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
  },

  settingAction: {
    flexDirection: "row",
    alignItems: "center",
  },

  settingValue: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "600",
    marginRight: 4,
  },

  viewButton: {
    minWidth: 59,
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },

  viewButtonText: {
    color: COLORS.offWhite,
    fontSize: 15,
    fontWeight: "500",
  },
});