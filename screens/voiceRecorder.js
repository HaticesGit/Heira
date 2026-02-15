import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Audio } from "expo-av";

export default function VoiceRecordingScreen() {
  const recordingRef = useRef(null);
  const soundRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        console.log("Mic permission:", status);

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });

        console.log("Audio mode");
      } catch (e) {
        console.log("errorr:", e);
      }
    })();

    return () => {
      (async () => {
        try {
          if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
        } catch {
        }
      })();
    };
  }, []);

  const startRecording = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsPlaying(false);
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingUri(null);
      console.log("Recording startedddd");
    } catch (e) {
      console.log("Start error:", e);
      Alert.alert("Start opname mislukt", String(e));
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      recordingRef.current = null;
      setIsRecording(false);
      setRecordingUri(uri);

      console.log("Recorded URI:", uri);
    } catch (e) {
      console.log("Stop error:", e);
      setIsRecording(false);
      Alert.alert("Stop opname mislukt", String(e));
    }
  };

  const playRecording = async () => {
    try {
      if (!recordingUri) return;

      // if already playing -> stop
      if (isPlaying && soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsPlaying(false);
        return;
      }

      // unload previous sound if any
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: false }
      );

      soundRef.current = sound;

      await sound.setVolumeAsync(1.0);
      setIsPlaying(true);
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;

        if (status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
          setIsPlaying(false);
        }
      });
    } catch (e) {
      console.log("Play error:", e);
      setIsPlaying(false);
      Alert.alert("Afspelen mislukt", String(e));
    }
  };

  const clearRecording = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsPlaying(false);
      setRecordingUri(null);
    } catch {
      setIsPlaying(false);
      setRecordingUri(null);
    }
  };

  const playDisabled = !recordingUri || isRecording;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Recorder</Text>

      <Text style={styles.status}>
        {isRecording
          ? "Recording..."
          : isPlaying
          ? "Playing..."
          : recordingUri
          ? "Recording ready!"
          : "No recording yet"}
      </Text>
      <TouchableOpacity
        style={[styles.button, isRecording ? styles.stop : styles.start]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>
          {isRecording ? "Stop" : "Start opname"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          playDisabled ? styles.disabled : styles.play,
        ]}
        onPress={playRecording}
        disabled={playDisabled}
      >
        <Text style={styles.buttonText}>
          {isPlaying ? "Stop playback" : "Play"}
        </Text>
      </TouchableOpacity>

      {/* WISSEN */}
      <TouchableOpacity
        style={[styles.linkBtn, !recordingUri && styles.linkDisabled]}
        onPress={clearRecording}
        disabled={!recordingUri}
      >
        <Text style={styles.linkText}>Delete recording</Text>
      </TouchableOpacity>

      <Text style={styles.saved} numberOfLines={2}>
        Saved voice recording 1
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: "center", 
        padding: 20 
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 10,
    },
    status: { 
        textAlign: "center", 
        marginBottom: 20, 
        color: "#444" 
    },
    button: {
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 12,
    },
    start: { 
        backgroundColor: "#0066FF"
    },
    stop: { 
        backgroundColor: "#b00020" 
    },
    play: { 
        backgroundColor: "#0066FF"
    },
    disabled: { 
        backgroundColor: "#999" 
    },
    buttonText: { 
        color: "white", 
        fontSize: 16, 
        fontWeight: "600"
    },
    linkBtn: { 
        paddingVertical: 8, 
        alignItems: "center"
    },
    linkDisabled: { 
        opacity: 0.4
    },
    linkText: { 
        fontSize: 14, 
        textDecorationLine: "underline"
    },
    saved: { 
        marginTop: 12, 
        fontSize: 12, 
        textAlign: "center", 
        color: "#555" 
    }
});
