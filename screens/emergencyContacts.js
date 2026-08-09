import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import ContactCard from "../components/ContactCard";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

export default function EmergencyContactsScreen({ navigation }) {
  const [emergencyEnabled, setEmergencyEnabled] = useState(false);
  const [contacts, setContacts] = useState([]);

  const fetchContacts = useCallback(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    setContacts([]);
    return;
  }

  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("id, name, phone_number, relationship")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching emergency contacts:", error);
    return;
  }

  setContacts(data || []);
}, []);

useFocusEffect(
  useCallback(() => {
    fetchContacts();
  }, [fetchContacts])
);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color={COLORS.blue}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Emergency Contacts
          </Text>

          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.sectionTitle}>
            Your Contacts
          </Text>

          <Text style={styles.limitText}>
            This is limited to 5 people with your current plan
          </Text>

          {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            name={contact.name}
            phone={contact.phone_number}
            onPress={() =>
              navigation.navigate("EditContact", {
                contact,
              })
            }
          />
        ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddContact")}
          >
            <Ionicons
              name="person-add-outline"
              size={24}
              color={COLORS.offWhite}
            />

            <Text style={styles.addButtonText}>
              New Contact
            </Text>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="call"
                size={22}
                color={COLORS.blue}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>
                Emergency Services
              </Text>

              <Text style={styles.infoDescription}>
                Choose whether the police can respond
                to your distress calls.
              </Text>

              <Text style={styles.infoDescription}>
                This option is disabled by default.
              </Text>
            </View>
          </View>

          <View style={styles.toggleCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="car"
                size={22}
                color={COLORS.blue}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>
                Belgian emergency number
              </Text>

              <Text style={styles.phoneNumber}>
                112
              </Text>
            </View>

            <Switch
              value={emergencyEnabled}
              onValueChange={setEmergencyEnabled}
              trackColor={{
                false: COLORS.midGray,
                true: COLORS.lightBlue,
              }}
              thumbColor={
                emergencyEnabled
                  ? COLORS.blue
                  : COLORS.span
              }
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 15,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.offWhite,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.midGray,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.blue,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: COLORS.blue,
    marginBottom: 5,
  },

  limitText: {
    color: COLORS.span,
    marginBottom: 18,
  },

  addButton: {
    height: 64,
    backgroundColor: COLORS.blue,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 6,
    marginBottom: 20,
  },

  addButtonText: {
    color: COLORS.offWhite,
    fontWeight: "700",
    fontSize: 17,
    marginLeft: 8,
  },

  infoCard: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 10,
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    marginBottom: 12,
  },

  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.midGray,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoTitle: {
    color: COLORS.blue,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },

  infoDescription: {
    color: COLORS.span,
    fontSize: 14,
    lineHeight: 20,
  },

  phoneNumber: {
    color: COLORS.span,
    marginTop: 3,
  },
});