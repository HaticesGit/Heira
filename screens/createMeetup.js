import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";

const CATEGORIES = [
  "Festival",
  "Concert",
  "Night out",
  "Public transport",
  "Shopping",
  "Other",
];

const TIME_OPTIONS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
];

export default function CreateMeetupScreen({ navigation }) {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [isCategoryOpen, setIsCategoryOpen] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [profileImage, setProfileImage] =
    useState(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("profileIMG_url")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error(
          "Error fetching profile image:",
          error
        );
        return;
      }

      setProfileImage(
        data?.profileIMG_url || null
      );
    };

    fetchProfileImage();
  }, []);

  const getNextDates = () => {
    return Array.from(
      { length: 30 },
      (_, index) => {
        const optionDate = new Date();

        optionDate.setHours(
          0,
          0,
          0,
          0
        );

        optionDate.setDate(
          optionDate.getDate() +
            index
        );

        return optionDate;
      }
    );
  };

  const handlePostMeetup = async () => {
    const trimmedLocation =
      location.trim();

    if (
      !trimmedLocation ||
      !date ||
      !time ||
      !selectedCategory
    ) {
      Alert.alert(
        "Missing information",
        "Please fill in the location, date, time and category."
      );

      return;
    }

    const meetupDateTime =
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes()
      );

    if (
      meetupDateTime <= new Date()
    ) {
      Alert.alert(
        "Invalid time",
        "Please choose a date and time in the future."
      );

      return;
    }

    const databaseDate =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;

    const databaseTime =
      `${String(
        time.getHours()
      ).padStart(2, "0")}:${String(
        time.getMinutes()
      ).padStart(2, "0")}:00`;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigation.navigate("Login");
      return;
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(
        "username, is_verified"
      )
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      console.error(
        "Error fetching profile:",
        profileError
      );

      Alert.alert(
        "Could not create meet-up",
        "Your profile could not be loaded."
      );

      return;
    }

    if (!profile.is_verified) {
      Alert.alert(
        "Verification required",
        "Only verified members can create meet-ups. Verify your identity first.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Verify identity",
            onPress: () =>
              navigation.navigate(
                "VerifyIdentity"
              ),
          },
        ]
      );

      return;
    }

    try {
      setLoading(true);

      const { data, error } =
        await supabase
          .from("meetups")
          .insert([
            {
              creator_id:
                session.user.id,

              username:
                profile.username,

              participant_count: 0,

              location:
                trimmedLocation,

              meetup_date:
                databaseDate,

              meetup_time:
                databaseTime,

              category:
                selectedCategory,

              comment_count: 0,
            },
          ])
          .select();

      if (error) {
        console.error(
          "Error creating meetup:",
          error
        );

        Alert.alert(
          "Something went wrong",
          "Your meet-up could not be posted. Please try again."
        );

        return;
      }

      console.log(
        "Meet-up created:",
        data
      );

      Alert.alert(
        "Meet-up posted",
        "Your meet-up was posted successfully.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error(
        "Unexpected meetup error:",
        error
      );

      Alert.alert(
        "Something went wrong",
        "Your meet-up could not be posted. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <View style={styles.screen}>
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={30}
              color={COLORS.offWhite}
            />
          </TouchableOpacity>

          <Text
            style={styles.headerTitle}
          >
            Make a meet-up
          </Text>

          <TouchableOpacity
            style={
              styles.profileButton
            }
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                "Profile"
              )
            }
          >
            {profileImage ? (
              <Image
                source={{
                  uri: profileImage,
                }}
                style={
                  styles.profileImage
                }
              />
            ) : (
              <Ionicons
                name="person"
                size={22}
                color={COLORS.blue}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* FORM */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={styles.formCard}
          >
            {/* LOCATION */}

            <FormField
              label="Location"
              icon="location"
            >
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={
                  setLocation
                }
                placeholder="Destinationstreet 27, 1000 Brussels"
                placeholderTextColor={
                  COLORS.span
                }
              />
            </FormField>

            <View
              style={styles.divider}
            />

            {/* DATE */}

            <FormField
              label="Date"
              icon="calendar"
            >
              <TouchableOpacity
                style={
                  styles.pickerInput
                }
                activeOpacity={0.8}
                onPress={() => {
                  setShowDatePicker(
                    (current) =>
                      !current
                  );

                  setShowTimePicker(
                    false
                  );

                  setIsCategoryOpen(
                    false
                  );
                }}
              >
                <Text
                  style={[
                    styles.pickerText,
                    !date &&
                      styles.placeholderText,
                  ]}
                >
                  {date
                    ? date.toLocaleDateString(
                        "en-GB",
                        {
                          weekday:
                            "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "Choose a date"}
                </Text>

                <Ionicons
                  name={
                    showDatePicker
                      ? "chevron-up"
                      : "calendar-outline"
                  }
                  size={20}
                  color={COLORS.blue}
                />
              </TouchableOpacity>

              {showDatePicker ? (
                <View
                  style={
                    styles.customPicker
                  }
                >
                  <ScrollView
                    nestedScrollEnabled
                    style={
                      styles.customPickerScroll
                    }
                  >
                    {getNextDates().map(
                      (
                        optionDate
                      ) => {
                        const isSelected =
                          date &&
                          optionDate.toDateString() ===
                            date.toDateString();

                        return (
                          <TouchableOpacity
                            key={
                              optionDate.toISOString()
                            }
                            style={[
                              styles.customPickerOption,
                              isSelected &&
                                styles.customPickerOptionSelected,
                            ]}
                            activeOpacity={
                              0.7
                            }
                            onPress={() => {
                              setDate(
                                new Date(
                                  optionDate
                                )
                              );

                              setShowDatePicker(
                                false
                              );
                            }}
                          >
                            <Text
                              style={[
                                styles.customPickerOptionText,
                                isSelected &&
                                  styles.customPickerOptionTextSelected,
                              ]}
                            >
                              {optionDate.toLocaleDateString(
                                "en-GB",
                                {
                                  weekday:
                                    "long",
                                  day: "numeric",
                                  month:
                                    "long",
                                }
                              )}
                            </Text>

                            {isSelected ? (
                              <Ionicons
                                name="checkmark"
                                size={20}
                                color={
                                  COLORS.green
                                }
                              />
                            ) : null}
                          </TouchableOpacity>
                        );
                      }
                    )}
                  </ScrollView>
                </View>
              ) : null}
            </FormField>

            <View
              style={styles.divider}
            />

            {/* TIME */}

            <FormField
              label="Time"
              icon="time"
            >
              <TouchableOpacity
                style={
                  styles.pickerInput
                }
                activeOpacity={0.8}
                onPress={() => {
                  setShowTimePicker(
                    (current) =>
                      !current
                  );

                  setShowDatePicker(
                    false
                  );

                  setIsCategoryOpen(
                    false
                  );
                }}
              >
                <Text
                  style={[
                    styles.pickerText,
                    !time &&
                      styles.placeholderText,
                  ]}
                >
                  {time
                    ? time.toLocaleTimeString(
                        "en-GB",
                        {
                          hour: "2-digit",
                          minute:
                            "2-digit",
                        }
                      )
                    : "Choose a time"}
                </Text>

                <Ionicons
                  name={
                    showTimePicker
                      ? "chevron-up"
                      : "time-outline"
                  }
                  size={20}
                  color={COLORS.blue}
                />
              </TouchableOpacity>

              {showTimePicker ? (
                <View
                  style={
                    styles.customPicker
                  }
                >
                  <ScrollView
                    nestedScrollEnabled
                    style={
                      styles.customPickerScroll
                    }
                  >
                    {TIME_OPTIONS.map(
                      (
                        timeOption
                      ) => {
                        const [
                          hours,
                          minutes,
                        ] =
                          timeOption
                            .split(
                              ":"
                            )
                            .map(
                              Number
                            );

                        const isSelected =
                          time &&
                          time.getHours() ===
                            hours &&
                          time.getMinutes() ===
                            minutes;

                        return (
                          <TouchableOpacity
                            key={
                              timeOption
                            }
                            style={[
                              styles.customPickerOption,
                              isSelected &&
                                styles.customPickerOptionSelected,
                            ]}
                            activeOpacity={
                              0.7
                            }
                            onPress={() => {
                              const selectedTime =
                                new Date();

                              selectedTime.setHours(
                                hours,
                                minutes,
                                0,
                                0
                              );

                              setTime(
                                selectedTime
                              );

                              setShowTimePicker(
                                false
                              );
                            }}
                          >
                            <Text
                              style={[
                                styles.customPickerOptionText,
                                isSelected &&
                                  styles.customPickerOptionTextSelected,
                              ]}
                            >
                              {
                                timeOption
                              }
                            </Text>

                            {isSelected ? (
                              <Ionicons
                                name="checkmark"
                                size={20}
                                color={
                                  COLORS.green
                                }
                              />
                            ) : null}
                          </TouchableOpacity>
                        );
                      }
                    )}
                  </ScrollView>
                </View>
              ) : null}
            </FormField>

            <View
              style={styles.divider}
            />

            {/* CATEGORY */}

            <View
              style={styles.fieldGroup}
            >
              <View
                style={styles.labelRow}
              >
                <Ionicons
                  name="pricetag"
                  size={20}
                  color={COLORS.green}
                />

                <Text
                  style={styles.label}
                >
                  Category
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.selectInput
                }
                activeOpacity={0.8}
                onPress={() => {
                  setIsCategoryOpen(
                    (current) =>
                      !current
                  );

                  setShowDatePicker(
                    false
                  );

                  setShowTimePicker(
                    false
                  );
                }}
              >
                <Text
                  style={[
                    styles.selectText,
                    !selectedCategory &&
                      styles.placeholderText,
                  ]}
                >
                  {selectedCategory ||
                    "Choose Category"}
                </Text>

                <Ionicons
                  name={
                    isCategoryOpen
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={21}
                  color={COLORS.blue}
                />
              </TouchableOpacity>

              {isCategoryOpen ? (
                <View
                  style={
                    styles.categoryList
                  }
                >
                  {CATEGORIES.map(
                    (category) => (
                      <TouchableOpacity
                        key={category}
                        style={
                          styles.categoryOption
                        }
                        activeOpacity={
                          0.7
                        }
                        onPress={() => {
                          setSelectedCategory(
                            category
                          );

                          setIsCategoryOpen(
                            false
                          );
                        }}
                      >
                        <Text
                          style={
                            styles.categoryOptionText
                          }
                        >
                          {category}
                        </Text>

                        {selectedCategory ===
                        category ? (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={
                              COLORS.green
                            }
                          />
                        ) : null}
                      </TouchableOpacity>
                    )
                  )}
                </View>
              ) : null}

              <View
                style={styles.infoBanner}
              >
                <Ionicons
                  name="people"
                  size={25}
                  color={COLORS.green}
                />

                <Text
                  style={styles.infoText}
                >
                  Choosing a category
                  helps others find your
                  meetup easier
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* FOOTER */}

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={() =>
              navigation.goBack()
            }
            disabled={loading}
          >
            <Text
              style={
                styles.cancelButtonText
              }
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.postButton,
              loading &&
                styles.postButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handlePostMeetup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color={
                  COLORS.offWhite
                }
              />
            ) : (
              <Text
                style={
                  styles.postButtonText
                }
              >
                Post meet-up
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FormField({
  label,
  icon,
  children,
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.labelRow}>
        <Ionicons
          name={icon}
          size={20}
          color={COLORS.green}
        />

        <Text style={styles.label}>
          {label}
        </Text>
      </View>

      <View
        style={styles.inputWrapper}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.blue,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },

  header: {
    minHeight: 94,
    backgroundColor: COLORS.blue,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    color: COLORS.offWhite,
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
    marginHorizontal: 8,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.lightBlue,
    borderWidth: 2,
    borderColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },

  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 30,
  },

  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    padding: 14,

    shadowColor: COLORS.offBlack,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },

  fieldGroup: {
    marginBottom: 3,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  label: {
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },

  inputWrapper: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    justifyContent: "center",
    overflow: "hidden",
  },

  input: {
    color: COLORS.blue,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.midGray,
    marginVertical: 11,
  },

  pickerInput: {
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pickerText: {
    color: COLORS.blue,
    fontSize: 15,
  },

  placeholderText: {
    color: COLORS.span,
  },

  customPicker: {
    marginTop: 7,
    borderTopWidth: 1,
    borderTopColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    maxHeight: 240,
  },

  customPickerScroll: {
    maxHeight: 240,
  },

  customPickerOption: {
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.midGray,
  },

  customPickerOptionSelected: {
    backgroundColor: COLORS.lightgreen,
  },

  customPickerOptionText: {
    color: COLORS.blue,
    fontSize: 15,
  },

  customPickerOptionTextSelected: {
    color: COLORS.green,
    fontWeight: "700",
  },

  selectInput: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    color: COLORS.blue,
    fontSize: 15,
  },

  categoryList: {
    marginTop: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    overflow: "hidden",
  },

  categoryOption: {
    minHeight: 43,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.midGray,
  },

  categoryOptionText: {
    color: COLORS.blue,
    fontSize: 15,
  },

  infoBanner: {
    minHeight: 84,
    borderRadius: 8,
    backgroundColor: COLORS.lightgreen,
    marginTop: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    flex: 1,
    color: COLORS.green,
    fontSize: 15,
    lineHeight: 20,
    marginLeft: 13,
  },

  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: COLORS.offWhite,
    flexDirection: "row",
  },

  cancelButton: {
    flex: 0.65,
    minHeight: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cancelButtonText: {
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "700",
  },

  postButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 8,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },

  postButtonDisabled: {
    opacity: 0.65,
  },

  postButtonText: {
    color: COLORS.offWhite,
    fontSize: 17,
    fontWeight: "700",
  },
});