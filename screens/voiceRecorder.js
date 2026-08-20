import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";

const RETENTION_KEY = "heira_voice_retention";
const RECORDER_ENABLED_KEY = "heira_voice_recorder_enabled";

export default function VoiceRecordingScreen({ navigation }) {
  const recordingRef = useRef(null);
  const soundRef = useRef(null);
  const recordingStartRef = useRef(null);

  const [urgencyRecorderEnabled, setUrgencyRecorderEnabled] =
    useState(false);

  const [retentionDays, setRetentionDays] = useState(7);

  const [recordings, setRecordings] = useState([]);

  const [isRecording, setIsRecording] = useState(false);

  const [playingRecordingId, setPlayingRecordingId] =
    useState(null);

  useEffect(() => {
    loadSavedData();

    return () => {
      cleanupAudio();
    };
  }, []);

  const loadSavedData = async () => {
    try {
      const savedRetention = await AsyncStorage.getItem(
        RETENTION_KEY
      );

      const savedEnabled = await AsyncStorage.getItem(
        RECORDER_ENABLED_KEY
      );

      const days = savedRetention
        ? Number(savedRetention)
        : 7;

      setRetentionDays(days);

      setUrgencyRecorderEnabled(
        savedEnabled === "true"
      );

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setRecordings([]);
        return;
      }

      const { data, error } = await supabase
        .from("voice_recordings")
        .select(
          "id, storage_path, duration, created_at"
        )
        .eq("user_id", session.user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const loadedRecordings =
        (data || []).map((item) => ({
          id: item.id,
          storagePath:
            item.storage_path,
          duration:
            item.duration || 0,
          createdAt:
            new Date(
              item.created_at
            ).getTime(),
        }));

      await removeExpiredRecordings(
        loadedRecordings,
        days
      );
    } catch (error) {
      console.log(
        "Error loading voice recorder data:",
        error
      );

      Alert.alert(
        "Could not load recordings",
        error?.message ||
          "Please try again."
      );
    }
  };

  const cleanupAudio = async () => {
    try {
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch {
          // Recording may already be stopped.
        }

        recordingRef.current =
          null;
      }

      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch {
          // Sound may already be unloaded.
        }

        soundRef.current =
          null;
      }
    } catch (error) {
      console.log(
        "Audio cleanup error:",
        error
      );
    }
  };

  const saveRecordingList = async (
    newRecordings
  ) => {
    setRecordings(
      newRecordings
    );
  };

  const handleUrgencyToggle =
    async (value) => {
      if (value) {
        try {
          const { status } =
            await Audio.requestPermissionsAsync();

          if (
            status !== "granted"
          ) {
            Alert.alert(
              "Microphone access required",
              "Please allow microphone access to use voice recording."
            );

            return;
          }

          setUrgencyRecorderEnabled(
            true
          );

          await AsyncStorage.setItem(
            RECORDER_ENABLED_KEY,
            "true"
          );
        } catch (error) {
          console.log(
            "Microphone permission error:",
            error
          );

          Alert.alert(
            "Something went wrong",
            "Microphone access could not be enabled."
          );
        }

        return;
      }

      setUrgencyRecorderEnabled(
        false
      );

      await AsyncStorage.setItem(
        RECORDER_ENABLED_KEY,
        "false"
      );
    };

  const toggleRecording =
    async () => {
      if (isRecording) {
        await stopRecording();
      } else {
        await startRecording();
      }
    };

  const startRecording =
    async () => {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();

          soundRef.current =
            null;

          setPlayingRecordingId(
            null
          );
        }

        const { status } =
          await Audio.requestPermissionsAsync();

        console.log(
          "Microphone permission:",
          status
        );

        if (
          status !== "granted"
        ) {
          Alert.alert(
            "Microphone access required",
            "Please allow microphone access before recording."
          );

          return;
        }

        await Audio.setAudioModeAsync(
          {
            allowsRecordingIOS:
              true,

            playsInSilentModeIOS:
              true,

            shouldDuckAndroid:
              true,

            playThroughEarpieceAndroid:
              false,

            staysActiveInBackground:
              false,
          }
        );

        const recording =
          new Audio.Recording();

        await recording.prepareToRecordAsync(
          Audio
            .RecordingOptionsPresets
            .HIGH_QUALITY
        );

        await recording.startAsync();

        recordingRef.current =
          recording;

        recordingStartRef.current =
          Date.now();

        setIsRecording(true);

        console.log(
          "Recording started"
        );
      } catch (error) {
        console.log(
          "Start recording error:",
          error
        );

        Alert.alert(
          "Recording failed",
          "The recording could not be started."
        );
      }
    };

  const stopRecording =
    async () => {
      const recording =
        recordingRef.current;

      if (!recording) {
        setIsRecording(false);
        return;
      }

      try {
        const status =
          await recording.getStatusAsync();

        await recording.stopAndUnloadAsync();

        const temporaryUri =
          recording.getURI();

        recordingRef.current =
          null;

        setIsRecording(false);

        if (!temporaryUri) {
          Alert.alert(
            "Recording failed",
            "No audio file was created."
          );

          return;
        }

        const duration =
          status.durationMillis
            ? Math.max(
                1,
                Math.round(
                  status.durationMillis /
                    1000
                )
              )
            : Math.max(
                1,
                Math.round(
                  (Date.now() -
                    recordingStartRef.current) /
                    1000
                )
              );

        await saveRecording(
          temporaryUri,
          duration
        );

        recordingStartRef.current =
          null;
      } catch (error) {
        console.log(
          "Stop recording error:",
          error
        );

        recordingRef.current =
          null;

        recordingStartRef.current =
          null;

        setIsRecording(false);

        Alert.alert(
          "Recording failed",
          "The recording could not be saved."
        );
      }
    };

  const saveRecording = async (
    temporaryUri,
    duration
  ) => {
    try {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!session?.user) {
        Alert.alert(
          "Not logged in",
          "You need to be logged in to save recordings."
        );

        return;
      }

      const response =
        await fetch(
          temporaryUri
        );

      const audioData =
        await response.arrayBuffer();

      const createdAt =
        Date.now();

      const storagePath =
        `${session.user.id}/heira-recording-${createdAt}.m4a`;

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(
            "voice-recordings"
          )
          .upload(
            storagePath,
            audioData,
            {
              contentType:
                "audio/m4a",
              upsert: false,
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data:
          savedRecording,
        error:
          insertError,
      } = await supabase
        .from(
          "voice_recordings"
        )
        .insert({
          user_id:
            session.user.id,

          storage_path:
            storagePath,

          duration,
        })
        .select(
          "id, storage_path, duration, created_at"
        )
        .single();

      if (insertError) {
        await supabase.storage
          .from(
            "voice-recordings"
          )
          .remove([
            storagePath,
          ]);

        throw insertError;
      }

      const newRecording = {
        id:
          savedRecording.id,

        storagePath:
          savedRecording.storage_path,

        duration:
          savedRecording.duration ||
          duration,

        createdAt:
          new Date(
            savedRecording.created_at
          ).getTime(),
      };

      setRecordings(
        (current) => [
          newRecording,
          ...current,
        ]
      );

      Alert.alert(
        "Recording saved",
        "Your recording was saved successfully."
      );
    } catch (error) {
      console.log(
        "Save recording error:",
        error
      );

      Alert.alert(
        "Could not save recording",
        error?.message ||
          "Please try again."
      );
    }
  };

  const playRecording =
    async (recording) => {
      try {
        if (
          playingRecordingId ===
            recording.id &&
          soundRef.current
        ) {
          await soundRef.current.stopAsync();

          await soundRef.current.unloadAsync();

          soundRef.current =
            null;

          setPlayingRecordingId(
            null
          );

          return;
        }

        if (soundRef.current) {
          await soundRef.current.unloadAsync();

          soundRef.current =
            null;

          setPlayingRecordingId(
            null
          );
        }

        const {
          data,
          error,
        } =
          await supabase.storage
            .from(
              "voice-recordings"
            )
            .createSignedUrl(
              recording.storagePath,
              60 * 10
            );

        if (
          error ||
          !data?.signedUrl
        ) {
          throw (
            error ||
            new Error(
              "Recording URL could not be created."
            )
          );
        }

        await Audio.setAudioModeAsync(
          {
            allowsRecordingIOS:
              false,

            playsInSilentModeIOS:
              true,

            shouldDuckAndroid:
              true,

            playThroughEarpieceAndroid:
              false,
          }
        );

        const { sound } =
          await Audio.Sound.createAsync(
            {
              uri:
                data.signedUrl,
            },
            {
              shouldPlay:
                true,

              volume: 1,
            }
          );

        soundRef.current =
          sound;

        setPlayingRecordingId(
          recording.id
        );

        sound.setOnPlaybackStatusUpdate(
          (status) => {
            if (
              !status.isLoaded
            ) {
              return;
            }

            if (
              status.didJustFinish
            ) {
              sound.unloadAsync();

              if (
                soundRef.current ===
                sound
              ) {
                soundRef.current =
                  null;
              }

              setPlayingRecordingId(
                null
              );
            }
          }
        );
      } catch (error) {
        console.log(
          "Playback error:",
          error
        );

        setPlayingRecordingId(
          null
        );

        Alert.alert(
          "Playback failed",
          error?.message ||
            "The recording could not be played."
        );
      }
    };

  const askDeleteRecording = (
    recording
  ) => {
    Alert.alert(
      "Delete recording?",
      "This recording will be permanently removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style:
            "destructive",

          onPress: () =>
            deleteRecording(
              recording
            ),
        },
      ]
    );
  };

  const deleteRecording =
    async (recording) => {
      try {
        if (
          playingRecordingId ===
            recording.id &&
          soundRef.current
        ) {
          await soundRef.current.unloadAsync();

          soundRef.current =
            null;

          setPlayingRecordingId(
            null
          );
        }

        const {
          error:
            storageError,
        } =
          await supabase.storage
            .from(
              "voice-recordings"
            )
            .remove([
              recording.storagePath,
            ]);

        if (storageError) {
          throw storageError;
        }

        const {
          error:
            deleteError,
        } = await supabase
          .from(
            "voice_recordings"
          )
          .delete()
          .eq(
            "id",
            recording.id
          );

        if (deleteError) {
          throw deleteError;
        }

        setRecordings(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                recording.id
            )
        );
      } catch (error) {
        console.log(
          "Delete recording error:",
          error
        );

        Alert.alert(
          "Could not delete recording",
          error?.message ||
            "Please try again."
        );
      }
    };

  const openRecordingMenu = (
    recording
  ) => {
    Alert.alert(
      "Recording",
      "What would you like to do?",
      [
        {
          text:
            "Delete recording",

          style:
            "destructive",

          onPress: () =>
            askDeleteRecording(
              recording
            ),
        },
        {
          text:
            "Cancel",

          style:
            "cancel",
        },
      ]
    );
  };

  const updateRetentionDays =
    async (days) => {
      setRetentionDays(days);

      await AsyncStorage.setItem(
        RETENTION_KEY,
        String(days)
      );

      await removeExpiredRecordings(
        recordings,
        days
      );
    };

  const openRetentionOptions =
    () => {
      Alert.alert(
        "Store recordings for",
        "Choose how long recordings should remain saved.",
        [
          {
            text: "7 days",
            onPress: () =>
              updateRetentionDays(
                7
              ),
          },
          {
            text: "14 days",
            onPress: () =>
              updateRetentionDays(
                14
              ),
          },
          {
            text: "30 days",
            onPress: () =>
              updateRetentionDays(
                30
              ),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    };

  const removeExpiredRecordings =
    async (
      currentRecordings,
      days
    ) => {
      try {
        if (
          !currentRecordings.length
        ) {
          setRecordings([]);
          return;
        }

        const expirationTime =
          days *
          24 *
          60 *
          60 *
          1000;

        const now =
          Date.now();

        const expired =
          currentRecordings.filter(
            (recording) =>
              now -
                recording.createdAt >
              expirationTime
          );

        for (const recording of expired) {
          const {
            error:
              storageError,
          } =
            await supabase.storage
              .from(
                "voice-recordings"
              )
              .remove([
                recording.storagePath,
              ]);

          if (
            storageError
          ) {
            console.log(
              "Could not remove expired recording from storage:",
              storageError
            );
          }

          const {
            error:
              deleteError,
          } =
            await supabase
              .from(
                "voice_recordings"
              )
              .delete()
              .eq(
                "id",
                recording.id
              );

          if (
            deleteError
          ) {
            console.log(
              "Could not remove expired recording row:",
              deleteError
            );
          }
        }

        const remaining =
          currentRecordings.filter(
            (recording) =>
              now -
                recording.createdAt <=
              expirationTime
          );

        setRecordings(
          remaining
        );
      } catch (error) {
        console.log(
          "Retention cleanup error:",
          error
        );
      }
    };

  const formatDate = (
    timestamp
  ) => {
    return new Date(
      timestamp
    ).toLocaleDateString(
      "en-GB",
      {
        day:
          "numeric",

        month:
          "short",

        year:
          "numeric",
      }
    );
  };

  const formatDuration = (
    seconds
  ) => {
    if (
      seconds < 60
    ) {
      return `${seconds} sec`;
    }

    const minutes =
      Math.floor(
        seconds / 60
      );

    const remainingSeconds =
      seconds % 60;

    return `${minutes}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <View
        style={
          styles.screen
        }
      >
        <View
          style={
            styles.header
          }
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            activeOpacity={
              0.8
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={29}
              color={
                COLORS.blue
              }
            />
          </TouchableOpacity>

          <Text
            style={
              styles.headerTitle
            }
          >
            Voice Recording
          </Text>

          <View
            style={
              styles.headerPlaceholder
            }
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <View
            style={
              styles.infoCard
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={31}
              color={
                COLORS.blue
              }
            />

            <View
              style={
                styles.infoContent
              }
            >
              <Text
                style={
                  styles.infoText
                }
              >
                While using the app,
                allow Heira to record
                sounds and store them for
                safety purposes.
              </Text>

              <Text
                style={
                  styles.infoTextBottom
                }
              >
                This feature is disabled
                by default and requires
                microphone access.
              </Text>
            </View>
          </View>

          <View
            style={
              styles.settingRow
            }
          >
            <Text
              style={
                styles.settingLabel
              }
            >
              Enable Urgency Voice
              Recorder
            </Text>

            <Switch
              value={
                urgencyRecorderEnabled
              }
              onValueChange={
                handleUrgencyToggle
              }
              trackColor={{
                false:
                  COLORS.midGray,

                true:
                  COLORS.lightgreen,
              }}
              thumbColor={
                urgencyRecorderEnabled
                  ? COLORS.green
                  : COLORS.span
              }
            />
          </View>

          <TouchableOpacity
            style={
              styles.retentionRow
            }
            activeOpacity={
              0.8
            }
            onPress={
              openRetentionOptions
            }
          >
            <Text
              style={
                styles.settingLabel
              }
            >
              Store recordings for:
            </Text>

            <View
              style={
                styles.retentionValue
              }
            >
              <Text
                style={
                  styles.retentionText
                }
              >
                {retentionDays} days
              </Text>

              <Ionicons
                name="chevron-down"
                size={20}
                color={
                  COLORS.blue
                }
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.recordButton,

              isRecording &&
                styles.recordButtonActive,
            ]}
            activeOpacity={
              0.8
            }
            onPress={
              toggleRecording
            }
          >
            <Ionicons
              name={
                isRecording
                  ? "stop"
                  : "mic"
              }
              size={23}
              color={
                COLORS.offWhite
              }
            />

            <Text
              style={
                styles.recordButtonText
              }
            >
              {isRecording
                ? "Stop recording"
                : "Start recording"}
            </Text>
          </TouchableOpacity>

          {isRecording ? (
            <View
              style={
                styles.recordingStatus
              }
            >
              <View
                style={
                  styles.recordingDot
                }
              />

              <Text
                style={
                  styles.recordingStatusText
                }
              >
                Recording in progress...
              </Text>
            </View>
          ) : null}

          <View
            style={
              styles.divider
            }
          />

          <Text
            style={
              styles.sectionTitle
            }
          >
            Your Recordings
          </Text>

          {recordings.length ===
          0 ? (
            <View
              style={
                styles.emptyState
              }
            >
              <Ionicons
                name="mic-outline"
                size={48}
                color={
                  COLORS.span
                }
              />

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No recordings yet
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Your saved recordings
                will appear here.
              </Text>
            </View>
          ) : (
            recordings.map(
              (recording) => (
                <RecordingCard
                  key={
                    recording.id
                  }
                  recording={
                    recording
                  }
                  date={formatDate(
                    recording.createdAt
                  )}
                  duration={formatDuration(
                    recording.duration
                  )}
                  isPlaying={
                    playingRecordingId ===
                    recording.id
                  }
                  onPlay={() =>
                    playRecording(
                      recording
                    )
                  }
                  onMenu={() =>
                    openRecordingMenu(
                      recording
                    )
                  }
                />
              )
            )
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function RecordingCard({
  recording,
  date,
  duration,
  isPlaying,
  onPlay,
  onMenu,
}) {
  const waveform = [
    11,
    20,
    14,
    27,
    16,
    24,
    12,
    30,
    17,
    23,
    14,
    28,
    18,
    25,
    12,
    22,
    29,
    15,
    24,
    18,
    27,
    13,
    22,
    16,
  ];

  return (
    <View
      style={
        styles.recordingCard
      }
    >
      <View
        style={
          styles.recordingTopRow
        }
      >
        <View
          style={
            styles.recordingId
          }
        >
          <Text
            style={
              styles.recordingIdText
            }
          >
            #
            {recording.id.slice(
              -6
            )}
          </Text>
        </View>

        <Text
          style={
            styles.recordingDate
          }
        >
          {date}
        </Text>
      </View>

      <View
        style={
          styles.recordingBottomRow
        }
      >
        <Text
          style={
            styles.duration
          }
        >
          {duration}
        </Text>

        <TouchableOpacity
          style={
            styles.playButton
          }
          activeOpacity={
            0.8
          }
          onPress={
            onPlay
          }
        >
          <Ionicons
            name={
              isPlaying
                ? "stop"
                : "play"
            }
            size={16}
            color={
              COLORS.offWhite
            }
          />
        </TouchableOpacity>

        <View
          style={
            styles.waveform
          }
        >
          {waveform.map(
            (
              height,
              index
            ) => (
              <View
                key={`${recording.id}-${index}`}
                style={[
                  styles.waveBar,
                  {
                    height,
                  },
                ]}
              />
            )
          )}
        </View>

        <TouchableOpacity
          style={
            styles.menuButton
          }
          activeOpacity={
            0.7
          }
          onPress={
            onMenu
          }
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={
              COLORS.blue
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        COLORS.offWhite,
    },

    screen: {
      flex: 1,
      backgroundColor:
        COLORS.offWhite,
    },

    header: {
      height: 72,
      paddingHorizontal:
        18,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 8,
      borderWidth: 1,

      borderColor:
        COLORS.midGray,

      backgroundColor:
        COLORS.offWhite,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    headerTitle: {
      color:
        COLORS.blue,

      fontSize: 24,

      fontWeight:
        "700",
    },

    headerPlaceholder: {
      width: 44,
    },

    content: {
      paddingHorizontal:
        18,

      paddingBottom:
        35,
    },

    infoCard: {
      borderRadius: 9,
      borderWidth: 1,

      borderColor:
        COLORS.span,

      backgroundColor:
        COLORS.lightBlue,

      padding: 13,

      flexDirection:
        "row",

      marginBottom:
        24,
    },

    infoContent: {
      flex: 1,
      marginLeft: 9,
    },

    infoText: {
      color:
        COLORS.blue,

      fontSize: 15,

      lineHeight:
        22,
    },

    infoTextBottom: {
      color:
        COLORS.blue,

      fontSize: 15,

      lineHeight:
        22,

      marginTop:
        18,
    },

    settingRow: {
      minHeight:
        58,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    settingLabel: {
      flexShrink:
        1,

      color:
        COLORS.blue,

      fontSize:
        15,

      fontWeight:
        "700",

      marginRight:
        10,
    },

    retentionRow: {
      minHeight:
        54,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    retentionValue: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    retentionText: {
      color:
        COLORS.blue,

      fontSize:
        15,

      marginRight:
        5,
    },

    recordButton: {
      minHeight:
        54,

      borderRadius:
        9,

      backgroundColor:
        COLORS.blue,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        10,

      marginBottom:
        10,
    },

    recordButtonActive: {
      backgroundColor:
        COLORS.red,
    },

    recordButtonText: {
      color:
        COLORS.offWhite,

      fontSize:
        16,

      fontWeight:
        "700",

      marginLeft:
        8,
    },

    recordingStatus: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        12,
    },

    recordingDot: {
      width: 9,
      height: 9,
      borderRadius:
        5,

      backgroundColor:
        COLORS.red,

      marginRight:
        7,
    },

    recordingStatusText: {
      color:
        COLORS.red,

      fontSize:
        13,

      fontWeight:
        "600",
    },

    divider: {
      height: 1,

      backgroundColor:
        COLORS.midGray,

      marginTop:
        5,

      marginBottom:
        17,
    },

    sectionTitle: {
      color:
        COLORS.blue,

      fontSize:
        20,

      fontWeight:
        "700",

      marginBottom:
        12,
    },

    recordingCard: {
      minHeight:
        80,

      borderRadius:
        10,

      borderWidth:
        1,

      borderColor:
        COLORS.midGray,

      backgroundColor:
        COLORS.offWhite,

      padding: 9,

      marginBottom:
        10,
    },

    recordingTopRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        11,
    },

    recordingId: {
      backgroundColor:
        COLORS.blue,

      borderRadius:
        5,

      paddingHorizontal:
        8,

      paddingVertical:
        3,
    },

    recordingIdText: {
      color:
        COLORS.offWhite,

      fontSize:
        12,
    },

    recordingDate: {
      color:
        COLORS.span,

      fontSize:
        12,
    },

    recordingBottomRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    duration: {
      width:
        66,

      color:
        COLORS.blue,

      fontSize:
        14,

      fontWeight:
        "700",
    },

    playButton: {
      width:
        30,

      height:
        30,

      borderRadius:
        15,

      backgroundColor:
        COLORS.blue,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        9,
    },

    waveform: {
      flex: 1,

      height:
        34,

      flexDirection:
        "row",

      alignItems:
        "center",

      overflow:
        "hidden",
    },

    waveBar: {
      width: 2,

      backgroundColor:
        COLORS.blue,

      marginRight:
        2,

      borderRadius:
        1,
    },

    menuButton: {
      width:
        30,

      height:
        36,

      alignItems:
        "flex-end",

      justifyContent:
        "center",
    },

    emptyState: {
      alignItems:
        "center",

      justifyContent:
        "center",

      paddingVertical:
        55,

      paddingHorizontal:
        25,
    },

    emptyTitle: {
      color:
        COLORS.blue,

      fontSize:
        18,

      fontWeight:
        "700",

      marginTop:
        12,
    },

    emptyText: {
      color:
        COLORS.span,

      fontSize:
        14,

      marginTop:
        5,

      textAlign:
        "center",
    },
  });