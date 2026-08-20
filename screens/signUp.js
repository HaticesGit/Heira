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

const ADJECTIVES = [
  "Brave",
  "Calm",
  "Clever",
  "Cozy",
  "Curious",
  "Gentle",
  "Happy",
  "Kind",
  "Lucky",
  "Sunny",
  "Quiet",
  "Bright",
  "Swift",
  "Friendly",
  "Bold",
  "Soft",
  "Playful",
  "Mellow",
  "Chill",
  "Witty",
];

const ANIMALS = [
  "Bunny",
  "Chameleon",
  "Dolphin",
  "Fox",
  "Koala",
  "Otter",
  "Panda",
  "Penguin",
  "Turtle",
  "Wolf",
  "Hedgehog",
  "Cat",
  "Owl",
  "Deer",
  "Seal",
  "Swan",
  "Tiger",
  "Rabbit",
  "Falcon",
  "Bear",
];

const generateUsername = () => {
  const adjective =
    ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];

  const animal =
    ANIMALS[Math.floor(Math.random() * ANIMALS.length)];

  return `${adjective}${animal}`;
};

const showFeedback = (title, message) => {
  if (
    typeof window !== "undefined"
  ) {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState(generateUsername());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateUniqueUsername = async () => {
    let newUsername = generateUsername();
    let attempts = 0;

    while (attempts < 10) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", newUsername)
        .maybeSingle();

      if (error) {
        console.error("Error checking username:", error);
        return;
      }

      if (!data) {
        setUsername(newUsername);
        return;
      }

      newUsername = generateUsername();
      attempts += 1;
    }

    Alert.alert(
      "Could not generate username",
      "Please try again."
    );
  };

  const handleSignUp = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      showFeedback(
        "Missing information",
        "Please enter your email and password."
      );  
      return;
    }

    if (password.length < 6) {
      showFeedback(
        "Password too short",
        "Your password must contain at least 6 characters."
      );
      return;
    }

    if (!acceptedTerms) {
      showFeedback(
        "Terms required",
        "Please agree to the Terms of Use and Privacy Policy."
      );
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    setLoading(false);

    if (error) {
        showFeedback(
          "Could not create account",
          error.message
        );

        return;
      }

    if (!data.session) {
  if (typeof window !== "undefined") {
    window.alert(
      "Check your email\n\nWe sent you a confirmation email. Confirm your email before signing in."
    );

    navigation.navigate("Login");
  } else {
    Alert.alert(
      "Check your email",
      "We sent you a confirmation email. Confirm your email before signing in.",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]
    );
  }

  return;
}

    if (typeof window !== "undefined") {
  window.alert(
    `Account created\n\nWelcome to Heira, ${username}!`
  );

  navigation.goBack();
} else {
  Alert.alert(
    "Account created",
    `Welcome to Heira, ${username}!`,
    [
      {
        text: "Continue",
        onPress: () => navigation.goBack(),
      },
    ]
  );
}
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <View style={styles.screen}>
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

          <Image
            source={require("../assets/heira.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <View style={styles.headingSection}>
            <Text style={styles.title}>
              Create your account
            </Text>

            <Text style={styles.subtitle}>
              It’s free and only takes a minute.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={18}
                color={COLORS.span}
              />

              <TextInput
                style={styles.input}
                value={username}
                editable={false}
                placeholder="Username"
                placeholderTextColor={COLORS.span}
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={generateUniqueUsername}
                accessibilityRole="button"
                accessibilityLabel="Generate another username"
              >
                <Ionicons
                  name="dice-outline"
                  size={21}
                  color={COLORS.span}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={18}
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
                size={18}
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

            <TouchableOpacity
              style={styles.termsRow}
              activeOpacity={0.8}
              onPress={() =>
                setAcceptedTerms((current) => !current)
              }
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxSelected,
                ]}
              >
                {acceptedTerms ? (
                  <Ionicons
                    name="checkmark"
                    size={15}
                    color={COLORS.offWhite}
                  />
                ) : null}
              </View>

              <Text style={styles.termsText}>
                I agree with{" "}
                <Text style={styles.linkText}>
                  Terms of Use
                </Text>{" "}
                and{" "}
                <Text style={styles.linkText}>
                  Privacy policy
                </Text>
                .
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.signupButton,
                loading && styles.signupButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color={COLORS.offWhite}
                />
              ) : (
                <Text style={styles.signupButtonText}>
                  Sign up
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />

              <Text style={styles.dividerText}>
                or
              </Text>

              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginButtonText}>
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
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
    height: 105,
    paddingHorizontal: 20,
    paddingTop: 6,
    position: "relative",
    alignItems: "center",
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

  logo: {
    width: 75,
    height: 75,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  headingSection: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 22,
  },

  title: {
    color: COLORS.blue,
    fontSize: 25,
    fontWeight: "700",
    marginBottom: 6,
  },

  subtitle: {
    color: COLORS.span,
    fontSize: 14,
  },

  form: {
    gap: 10,
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

  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 3,
    paddingHorizontal: 4,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 1,
  },

  checkboxSelected: {
    backgroundColor: COLORS.blue,
  },

  termsText: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 12,
    lineHeight: 17,
  },

  linkText: {
    textDecorationLine: "underline",
    fontWeight: "600",
  },

  bottomSection: {
    marginTop: "auto",
    paddingBottom: 18,
  },

  signupButton: {
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  signupButtonDisabled: {
    opacity: 0.6,
  },

  signupButtonText: {
    color: COLORS.offWhite,
    fontSize: 16,
    fontWeight: "700",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
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

  loginButton: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  loginButtonText: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: "700",
  },
});