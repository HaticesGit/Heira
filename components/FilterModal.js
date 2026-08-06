import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

const CATEGORIES = [
  "Festival",
  "Concert",
  "Night out",
  "Public transport",
  "Shopping",
  "Other",
];

const DATES = [
  "Today",
  "Tomorrow",
  "This week",
];

const TIMES = [
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
];

export default function FilterModal({ visible, onClose, onApply }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [verifiedHostsOnly, setVerifiedHostsOnly] = useState(false);

  const toggleCategory = (category) => {
    setSelectedCategories((currentCategories) => {
      const isSelected = currentCategories.includes(category);

      if (isSelected) {
        return currentCategories.filter((item) => item !== category);
      }

      return [...currentCategories, category];
    });
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedDate("");
    setSelectedTime("");
    setVerifiedHostsOnly(false);
  };

  const applyFilters = () => {
    onApply({
      categories: selectedCategories,
      date: selectedDate,
      time: selectedTime,
      verifiedHostsOnly,
    });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modal}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>

            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.8}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close filters"
            >
              <Ionicons
                name="close"
                size={25}
                color={COLORS.blue}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Category</Text>

            <View style={styles.optionsWrap}>
              {CATEGORIES.map((category) => {
                const isSelected =
                  selectedCategories.includes(category);

                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.optionChip,
                      isSelected && styles.optionChipSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        isSelected && styles.optionChipTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Date</Text>

            <View style={styles.optionsWrap}>
              {DATES.map((date) => {
                const isSelected = selectedDate === date;

                return (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.optionChip,
                      isSelected && styles.optionChipSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() =>
                      setSelectedDate(isSelected ? "" : date)
                    }
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        isSelected && styles.optionChipTextSelected,
                      ]}
                    >
                      {date}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Time</Text>

            <View style={styles.optionsWrap}>
              {TIMES.map((time) => {
                const isSelected = selectedTime === time;

                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.optionChip,
                      isSelected && styles.optionChipSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() =>
                      setSelectedTime(isSelected ? "" : time)
                    }
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        isSelected && styles.optionChipTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.toggleRow}
              activeOpacity={0.8}
              onPress={() =>
                setVerifiedHostsOnly((currentValue) => !currentValue)
              }
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: verifiedHostsOnly,
              }}
            >
              <View>
                <Text style={styles.toggleTitle}>
                  Verified hosts only
                </Text>

                <Text style={styles.toggleDescription}>
                  Only show meet-ups created by verified users.
                </Text>
              </View>

              <Ionicons
                name={
                  verifiedHostsOnly
                    ? "checkbox"
                    : "square-outline"
                }
                size={26}
                color={
                  verifiedHostsOnly
                    ? COLORS.green
                    : COLORS.span
                }
              />
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              activeOpacity={0.8}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>
                Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              activeOpacity={0.8}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>
                Apply filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },

  modal: {
    maxHeight: "85%",
    backgroundColor: COLORS.offWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    borderWidth: 1,
    borderColor: COLORS.lightBlue,

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  handle: {
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.midGray,
    alignSelf: "center",
    marginTop: 10,
  },

  header: {
    minHeight: 62,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.midGray,
  },

  title: {
    color: COLORS.blue,
    fontSize: 22,
    fontWeight: "700",
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },

  sectionTitle: {
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },

  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  optionChip: {
    minHeight: 39,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: 13,
    marginRight: 8,
    marginBottom: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  optionChipSelected: {
    backgroundColor: COLORS.lightgreen,
    borderColor: COLORS.green,
  },

  optionChipText: {
    color: COLORS.blue,
    fontSize: 14,
  },

  optionChipTextSelected: {
    color: COLORS.green,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.midGray,
    marginVertical: 18,
  },

  toggleRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  toggleTitle: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  toggleDescription: {
    maxWidth: 280,
    color: COLORS.span,
    fontSize: 13,
    lineHeight: 18,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    flexDirection: "row",
  },

  resetButton: {
    flex: 0.7,
    minHeight: 54,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  resetButtonText: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
  },

  applyButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 9,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },

  applyButtonText: {
    color: COLORS.offWhite,
    fontSize: 16,
    fontWeight: "700",
  },
});