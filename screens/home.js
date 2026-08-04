import React from "react";
import { COLORS } from "../constants/colors";
import { View, Text, TouchableOpacity, StyleSheet, } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Heira</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("VoiceRecorder")}
      >
        <Text style={styles.btnText}>Voice Recorder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: COLORS.offBlack,
  },
  btn: {
    backgroundColor: COLORS.blue,
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: COLORS.offWhite,
    fontSize: 16,
    fontWeight: "600",
  },
});