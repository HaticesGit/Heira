import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import MeetupCard from "../components/MeetUpCard";
import { COLORS } from "../constants/colors";

export default function HomeScreen({ navigation }) {
  const alarmSoundRef = useRef(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [meetups, setMeetups] = useState([]);
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
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    setMeetups([]);
    return;
  }

  const { data: participantData, error: participantError } = await supabase
    .from("meetup_participants")
    .select("meetup_id")
    .eq("user_id", session.user.id);

  if (participantError) {
    console.error("Error fetching joined meetups:", participantError);
    return;
  }

  const meetupIds = participantData.map(
    (participant) => participant.meetup_id
  );

  if (meetupIds.length === 0) {
    setMeetups([]);
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: meetupData, error: meetupError } = await supabase
    .from("meetups")
    .select("*")
    .in("id", meetupIds)
    .gte("meetup_date", today)
    .order("meetup_date", { ascending: true });

  if (meetupError) {
    console.error("Error fetching future meetups:", meetupError);
    return;
  }

  const formattedMeetups = meetupData.map((meetup) => ({
    id: meetup.id.toString(),
    creatorId: meetup.creator_id,
    username: meetup.username,
    location: meetup.location,
    date: formatDate(meetup.meetup_date),
    time: formatTime(meetup.meetup_time),
    category: meetup.category,
  }));

  setMeetups(formattedMeetups);
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
          onPress: () => Linking.openURL("tel:112"),
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
            <Ionicons
              name="person"
              size={24}
              color={COLORS.blue}
            />
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
              onPress={() => navigation.navigate("MapTab")}
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
});