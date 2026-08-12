import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

const getInstructionIcon = (type) => {
  switch (type) {
    case 0:
      return "arrow-back";

    case 1:
      return "arrow-forward";

    case 2:
      return "return-up-back";

    case 3:
      return "return-up-forward";

    case 4:
      return "arrow-back";

    case 5:
      return "arrow-forward";

    case 6:
      return "arrow-up";

    case 7:
    case 8:
      return "sync";

    case 9:
      return "return-up-back";

    case 10:
      return "flag";

    case 12:
      return "arrow-back";

    case 13:
      return "arrow-forward";

    default:
      return "navigate";
  }
};

export default function NavigationInstruction({
  step,
  onCancel,
}) {
  if (!step) {
    return null;
  }

  const distance =
    step.distance >= 1000
      ? `${(step.distance / 1000).toFixed(1)} km`
      : `${Math.round(step.distance)} m`;

  return (
    <View style={styles.container}>
      <Ionicons
        name={getInstructionIcon(step.type)}
        size={38}
        color={COLORS.blue}
      />

      <View style={styles.instructionContent}>
        <Text style={styles.instruction}>
          {step.instruction}
        </Text>

        <Text style={styles.distance}>
          {distance}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCancel}
        >
          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 32,
    left: 16,
    right: 16,
    minHeight: 105,
    borderRadius: 18,
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: 18,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "flex-start",

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 6,
  },

  instructionContent: {
    flex: 1,
    marginLeft: 14,
  },

  instruction: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 3,
  },

  distance: {
    color: COLORS.blue,
    fontSize: 14,
    marginBottom: 10,
  },

  cancelText: {
    color: COLORS.red,
    fontSize: 13,
  },
});