import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import MeetupCard from "../components/MeetUpCard";
import { COLORS } from "../constants/colors";
import * as Location from "expo-location";
import * as SMS from "expo-sms";

export default function HomeScreen({ navigation }) {
  const alarmSoundRef = useRef(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [meetups, setMeetups] = useState([]);
  const [currentUserImage, setCurrentUserImage] = useState(null);
  const locationWatcherRef = useRef(null);

const [isSharingLocation, setIsSharingLocation] = useState(false);
const [locationShareId, setLocationShareId] = useState(null);
  const formatDate = (date) => {
  if (!date) return "";

  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year.slice(-2)}`;
};

const formatTime = (time) => {
  if (!time) return "";

  return time.slice(0, 5);
};

const fetchFutureMeetups = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      console.log("No logged in user");

      setMeetups([]);
      setCurrentUserImage(null);
      return;
    }

    console.log(
      "HOME USER ID:",
      session.user.id
    );

    // PROFILE IMAGE
    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("profileIMG_url")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      console.log(
        "Profile image error:",
        profileError
      );
    }

    setCurrentUserImage(
      profileData?.profileIMG_url || null
    );

    // GET ALL MEETUPS THIS USER JOINED
    const {
      data: participantData,
      error: participantError,
    } = await supabase
      .from("meetup_participants")
      .select("meetup_id")
      .eq("user_id", session.user.id);

    if (participantError) {
      console.log(
        "Error fetching joined meetups:",
        participantError
      );

      setMeetups([]);
      return;
    }

    console.log(
      "JOINED MEETUPS:",
      participantData
    );

    const meetupIds = [
      ...new Set(
        (participantData || [])
          .map(
            (participant) =>
              participant.meetup_id
          )
          .filter(Boolean)
      ),
    ];

    console.log(
      "MEETUP IDS:",
      meetupIds
    );

    if (meetupIds.length === 0) {
      setMeetups([]);
      return;
    }

    // GET THE ACTUAL MEETUPS
    const {
      data: meetupData,
      error: meetupError,
    } = await supabase
      .from("meetups")
      .select("*")
      .in("id", meetupIds)
      .order("meetup_date", {
        ascending: true,
      });

    if (meetupError) {
      console.log(
        "Error fetching meetup details:",
        meetupError
      );

      setMeetups([]);
      return;
    }

    console.log(
      "FOUND MEETUPS:",
      meetupData
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureMeetups =
      (meetupData || []).filter(
        (meetup) => {
          if (!meetup.meetup_date) {
            return true;
          }

          const meetupDate =
            new Date(
              `${meetup.meetup_date}T00:00:00`
            );

          return meetupDate >= today;
        }
      );

    const formattedMeetups =
      futureMeetups.map((meetup) => ({
        id: meetup.id.toString(),
        creatorId:
          meetup.creator_id,
        username:
          meetup.username,
        title:
          meetup.title ||
          meetup.location,
        location:
          meetup.location,
        date: formatDate(
          meetup.meetup_date
        ),
        time: formatTime(
          meetup.meetup_time
        ),
        category:
          meetup.category,
      }));

    console.log(
      "FINAL HOME MEETUPS:",
      formattedMeetups
    );

    setMeetups(formattedMeetups);
  } catch (error) {
    console.log(
      "Unexpected future meetup error:",
      error
    );

    setMeetups([]);
  }
};
useFocusEffect(
  React.useCallback(() => {
    fetchFutureMeetups();
  }, [])
);

  useEffect(() => {
    return () => {
      if (alarmSoundRef.current) {
        alarmSoundRef.current.unloadAsync();
        alarmSoundRef.current = null;
      }
    };
  }, []);

  const startLocationSharing = async () => {
  try {
    // 1. Check logged-in user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      Alert.alert(
        "Not logged in",
        "You need to be logged in to share your location."
      );
      return;
    }

    // 2. Get emergency contacts FIRST
    const { data: emergencyContacts, error: contactsError } =
      await supabase
        .from("emergency_contacts")
        .select("id, name, phone_number")
        .eq("user_id", session.user.id);

    if (contactsError) {
      console.log(
        "Error fetching emergency contacts:",
        contactsError
      );

      Alert.alert(
        "Something went wrong",
        "Your emergency contacts could not be loaded."
      );

      return;
    }

    if (!emergencyContacts || emergencyContacts.length === 0) {
      Alert.alert(
        "No emergency contacts",
        "Add at least one emergency contact before sharing your location."
      );

      return;
    }

    // 3. Request location permission
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Location permission needed",
        "Heira needs access to your location to share it."
      );

      return;
    }

    // 4. Check if SMS is available
    if (Platform.OS !== "web") {
  const isSmsAvailable =
    await SMS.isAvailableAsync();

  if (!isSmsAvailable) {
    Alert.alert(
      "SMS unavailable",
      "SMS is not available on this device."
    );

    return;
  }
}

    // 5. Get current location
    const currentLocation =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

    const { latitude, longitude } =
      currentLocation.coords;

    // 6. Create unique share token
    const shareToken =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}`;

    // 7. Create location share in Supabase
    const { data, error } = await supabase
      .from("location_shares")
      .insert({
        user_id: session.user.id,
        share_token: shareToken,
        latitude,
        longitude,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    setLocationShareId(data.id);
    setIsSharingLocation(true);

    console.log("Location share created:", data);

    // 8. Create share URL
    const shareUrl =
      `https://heira-liart.vercel.app/?locationShare=${shareToken}`;

    // 9. Get all phone numbers
    const phoneNumbers = emergencyContacts
      .map((contact) => contact.phone_number)
      .filter(Boolean);

    if (phoneNumbers.length === 0) {
      Alert.alert(
        "No phone numbers",
        "Your emergency contacts do not have a phone number."
      );

      await supabase
        .from("location_shares")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      setLocationShareId(null);
      setIsSharingLocation(false);

      return;
    }

    // 10. Open SMS composer
    const message =
  `I'm sharing my live location with you through Heira. ` +
  `Follow my live location here: ${shareUrl}`;

if (Platform.OS === "web") {
  const phoneNumber =
    phoneNumbers[0];

  const smsUrl =
    `sms:${phoneNumber}?body=${encodeURIComponent(
      message
    )}`;

  if (typeof window !== "undefined") {
    window.location.href = smsUrl;
  }
} else {
  await SMS.sendSMSAsync(
    phoneNumbers,
    message
  );
}

    // 11. Start watching live location
    locationWatcherRef.current =
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (location) => {
          const {
            latitude,
            longitude,
          } = location.coords;

          console.log(
            "Updated location:",
            latitude,
            longitude
          );

          const { error: updateError } =
            await supabase
              .from("location_shares")
              .update({
                latitude,
                longitude,
                updated_at:
                  new Date().toISOString(),
              })
              .eq("id", data.id);

          if (updateError) {
            console.log(
              "Location update error:",
              updateError
            );
          }
        }
      );
  } catch (error) {
  console.log(
    "START LOCATION SHARING ERROR:",
    error
  );

  console.log(
    "ERROR MESSAGE:",
    error?.message
  );

  setIsSharingLocation(false);

  Alert.alert(
    "Something went wrong",
    error?.message ||
      "Your location could not be shared."
  );
}
};

  const toggleAlarm = async () => {
    try {
      if (isAlarmPlaying && alarmSoundRef.current) {
        await alarmSoundRef.current.stopAsync();
        await alarmSoundRef.current.unloadAsync();

        alarmSoundRef.current = null;
        setIsAlarmPlaying(false);

        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/warningAlarm.mp3"),
        {
          shouldPlay: false,
          isLooping: true,
          volume: 0.25,
        }
      );

      alarmSoundRef.current = sound;

      await sound.setVolumeAsync(0.25);
      await sound.playAsync();

      setIsAlarmPlaying(true);
    } catch (error) {
      console.log("Alarm sound error:", error);

      alarmSoundRef.current = null;
      setIsAlarmPlaying(false);

      Alert.alert(
        "Alarm error",
        "The alarm sound could not be played."
      );
    }
  };

  const callEmergencyServices = () => {
  const confirmCall = async () => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
          window.location.href = "tel:112";
        }

        return;
      }

      await Linking.openURL("tel:112");
    } catch (error) {
      console.log(
        "Emergency call error:",
        error
      );

      Alert.alert(
        "Unable to call",
        "The phone app could not be opened."
      );
    }
  };

  Alert.alert(
    "Call emergency services",
    "Are you sure you want to call 112?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Call 112",
        style: "destructive",
        onPress: confirmCall,
      },
    ]
  );
};
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>

          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Profile")}
          >
            {currentUserImage ? (
  <Image
    source={{ uri: currentUserImage }}
    style={styles.profileButtonImage}
    resizeMode="cover"
  />
) : (
  <Ionicons
    name="person"
    size={24}
    color={COLORS.blue}
  />
)}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>
            Future meet-ups
          </Text>

          {meetups.length > 0 ? (
            <View>
              {meetups.map((meetup) => (
                <MeetupCard
                  key={meetup.id}
                  meetup={meetup}
                  onPress={() =>
                    navigation.navigate("MeetupDetail", {
                      meetup,
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIllustration}>
                <Ionicons
                  name="location"
                  size={72}
                  color={COLORS.green}
                />
              </View>

              <Text style={styles.emptyTitle}>
                You have no meet-ups planned
              </Text>

              <Text style={styles.emptyText}>
                Saved meet-ups will be available here.
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.sectionTitle,
              styles.servicesTitle,
            ]}
          >
            Services
          </Text>

          <View style={styles.servicesRow}>
            <TouchableOpacity
              style={[
                styles.serviceCard,
                styles.shareLocationCard,
              ]}
              activeOpacity={0.8}
              onPress={startLocationSharing}
            >
              <Ionicons
                name="location"
                size={29}
                color={COLORS.green}
              />

              <Text
                style={[
                  styles.serviceText,
                  styles.shareLocationText,
                ]}
              >
                Share{"\n"}location
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.serviceCard,
                styles.alarmCard,
                isAlarmPlaying && styles.alarmCardActive,
              ]}
              activeOpacity={0.8}
              onPress={toggleAlarm}
            >
              <Ionicons
                name={
                  isAlarmPlaying
                    ? "stop-circle-outline"
                    : "radio-outline"
                }
                size={29}
                color={COLORS.offWhite}
              />

              <Text style={styles.serviceText}>
                {isAlarmPlaying
                  ? "Stop Siren"
                  : "Alarm Siren"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.serviceCard,
                styles.emergencyCard,
              ]}
              activeOpacity={0.8}
              onPress={callEmergencyServices}
            >
              <Ionicons
                name="alert-circle-outline"
                size={30}
                color={COLORS.offWhite}
              />

              <Text style={styles.serviceText}>
                Call 112
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.safetyMessage}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={COLORS.green}
            />

            <Text style={styles.safetyMessageText}>
              You’re safe. Help is always one tap away
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
    minHeight: 75,
    backgroundColor: COLORS.blue,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: COLORS.offWhite,
    fontSize: 28,
    fontWeight: "700",
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.lightgreen,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.offWhite,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 24,
  },

  sectionTitle: {
    color: COLORS.blue,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },

  emptyState: {
    minHeight: 340,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIllustration: {
    width: 150,
    height: 130,
    borderRadius: 75,
    backgroundColor: COLORS.lightgreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 5,
  },

  emptyText: {
    color: COLORS.span,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 240,
  },

  servicesTitle: {
    marginTop: 8,
  },

  servicesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  serviceCard: {
    width: "31.5%",
    minHeight: 140,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  shareLocationCard: {
    backgroundColor: COLORS.lightgreen,
    borderWidth: 1,
    borderColor: COLORS.midGray,
  },

  alarmCard: {
    backgroundColor: COLORS.blue,
  },

  alarmCardActive: {
    opacity: 0.8,
  },

  emergencyCard: {
    backgroundColor: COLORS.red,
  },

  serviceText: {
    color: COLORS.offWhite,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 13,
    fontWeight: "500",
  },

  shareLocationText: {
    color: COLORS.green,
  },

  safetyMessage: {
    minHeight: 45,
    backgroundColor: COLORS.lightgreen,
    borderRadius: 8,
    marginTop: 13,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  safetyMessageText: {
    flexShrink: 1,
    color: COLORS.green,
    fontSize: 14,
    marginLeft: 7,
    textAlign: "center",
  },
  profileButtonImage: {
  width: "100%",
  height: "100%",
  borderRadius: 22,
},
});