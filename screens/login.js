import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import { supabase } from "../lib/supabase";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      Alert.alert(
        "Missing information",
        "Please enter your email and password."
      );
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert(
        "Could not sign in",
        error.message
      );
      return;
    }

    console.log("Logged in user:", data.user.id);

    navigation.goBack();
  };

  const handleGuest = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <View style={styles.screen}>

        {/* TOP */}
        <View style={styles.topSection}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={29}
              color={COLORS.blue}
            />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/heira.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>
              Welcome back!
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue.
            </Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={19}
                color={COLORS.span}
              />

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.span}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={COLORS.span}
              />

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Choose your password"
                placeholderTextColor={COLORS.span}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  setShowPassword((current) => !current)
                }
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={20}
                  color={COLORS.span}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* BOTTOM BUTTONS */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color={COLORS.offWhite}
                />
              ) : (
                <Text style={styles.loginButtonText}>
                  Sign in
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("SignUp")}
            >
              <Text style={styles.signupButtonText}>
                Don’t have an account? Sign up
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />

              <Text style={styles.dividerText}>
                or
              </Text>

              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.guestButton}
              activeOpacity={0.8}
              onPress={handleGuest}
            >
              <Ionicons
                name="person-outline"
                size={19}
                color={COLORS.blue}
              />

              <Text style={styles.guestButtonText}>
                Use Heira as a Guest
              </Text>
            </TouchableOpacity>

            <Text style={styles.guestInfo}>
              Guests have limited functionality, and you{"\n"}
              can make an account at any time
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
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

  topSection: {
    height: 110,
    paddingHorizontal: 20,
    paddingTop: 6,
    position: "relative",
  },

  backButton: {
    position: "absolute",
    left: 20,
    top: 10,
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 75,
    height: 75,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  welcomeSection: {
    alignItems: "center",
    marginTop: 22,
    marginBottom: 38,
  },

  title: {
    color: COLORS.blue,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },

  subtitle: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "500",
  },

  form: {
    gap: 12,
  },

  inputContainer: {
    minHeight: 51,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    borderRadius: 9,
    paddingHorizontal: 12,
    backgroundColor: COLORS.offWhite,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  input: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 15,
    marginLeft: 9,
    paddingVertical: 12,
  },

  bottomSection: {
    marginTop: "auto",
    paddingBottom: 18,
  },

  loginButton: {
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: COLORS.offWhite,
    fontSize: 16,
    fontWeight: "700",
  },

  signupButton: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  signupButtonText: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: "500",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 19,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.midGray,
  },

  dividerText: {
    color: COLORS.blue,
    fontSize: 14,
    marginHorizontal: 12,
  },

  guestButton: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  guestButtonText: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },

  guestInfo: {
    color: COLORS.span,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 10,
  },
});