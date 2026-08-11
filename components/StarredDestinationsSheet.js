import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

export default function StarredDestinationsSheet({
  visible,
  destinations,
  onClose,
  onSelect,
  onRemove,
}) {
  if (!visible) return null;

  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Starred destinations
          </Text>

          <Text style={styles.subtitle}>
            Your saved places for quick access.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          activeOpacity={0.8}
          onPress={onClose}
        >
          <Ionicons
            name="close"
            size={25}
            color={COLORS.blue}
          />
        </TouchableOpacity>
      </View>

      {destinations.length > 0 ? (
        <ScrollView
  style={styles.scrollView}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.list}
>
          {destinations.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.destinationRow}
              activeOpacity={0.8}
              onPress={() => onSelect(place)}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={COLORS.blue}
                />
              </View>

              <View style={styles.destinationInfo}>
                <Text style={styles.destinationName}>
                  {place.name}
                </Text>

                <Text style={styles.destinationAddress}>
                  {place.address}
                </Text>
              </View>

              <TouchableOpacity
  onPress={(event) => {
    event.stopPropagation();
    onRemove(place);
  }}
  activeOpacity={0.7}
>
  <Ionicons
    name="star"
    size={22}
    color={COLORS.yellow}
  />
</TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="star-outline"
            size={60}
            color={COLORS.blue}
          />

          <Text style={styles.emptyTitle}>
            No starred destinations yet
          </Text>

          <Text style={styles.emptyText}>
            Save places you visit often so you can
            find them faster next time.
          </Text>
        </View>
      )}

      <View style={styles.tipContainer}>
        <Ionicons
          name="bulb"
          size={17}
          color={COLORS.span}
        />

        <Text style={styles.tipText}>
          Tip: long press on the map to star any place
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "43%",
    backgroundColor: COLORS.offWhite,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.lightBlue,

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 9,
  },

  handle: {
    width: 45,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.midGray,
    alignSelf: "center",
    marginTop: 9,
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },

  subtitle: {
    color: COLORS.span,
    fontSize: 14,
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },

 list: {
  paddingHorizontal: 18,
},

  destinationRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.midGray,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  destinationInfo: {
    flex: 1,
  },

  destinationName: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  destinationAddress: {
    color: COLORS.span,
    fontSize: 13,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 40,
  },

  emptyTitle: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 7,
  },

  emptyText: {
    color: COLORS.span,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

 tipContainer: {
  minHeight: 48,
  paddingHorizontal: 18,
  borderTopWidth: 1,
  borderTopColor: COLORS.midGray,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: COLORS.offWhite,
},

  tipText: {
    color: COLORS.span,
    fontSize: 13,
    marginLeft: 7,
  },
  scrollView: {
  flex: 1,
},
});