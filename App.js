import React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "./constants/colors";
import HomeScreen from "./screens/home";
import ProfileScreen from "./screens/profile";
import MapScreen from "./screens/map";
import CommunityScreen from "./screens/community";
import VoiceRecorderScreen from "./screens/voiceRecorder";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.blue,
        tabBarInactiveTintColor: COLORS.span,
        tabBarStyle: {
          height: 65,
          paddingTop: 7,
          paddingBottom: 7,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
          <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
          <Ionicons
            name="location-outline"
            size={size}
            color={color}
          />
          ),
        }}
      />

      <Tab.Screen
        name="CommunityTab"
        component={CommunityScreen}
        options={{
          title: "Community",
          tabBarIcon: ({ color, size }) => (
        <Ionicons
          name="people-outline"
          size={size}
          color={color}
        />
      ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="VoiceRecorder"
          component={VoiceRecorderScreen}
          options={{
            title: "Voice Recording",
          }}
        />
        <Stack.Screen
  name="Profile"
  component={ProfileScreen}
  options={{ headerShown: false }}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}