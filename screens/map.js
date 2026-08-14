import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Dimensions, TextInput, TouchableOpacity, Text, ScrollView, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import SafespaceCard from "../components/SafespaceCard";
import { COLORS } from "../constants/colors";
import { useFocusEffect } from "@react-navigation/native";
import NavigationInstruction from "../components/NavigationInstruction";
import * as Location from "expo-location";
import StarredDestinationsSheet from "../components/StarredDestinationsSheet";
export default function MapScreen({ navigation, route }) {
  const mapRef = useRef(null);
  const [safespaces, setSafespaces] = useState([]);
  useFocusEffect(
  React.useCallback(() => {
    const fetchSafespaces = async () => {
      const { data, error } = await supabase
        .from("safespaces")
        .select(
          "id, name, address, latitude, longitude, available_hours, type, phone_number, safety_measure, is_verified, profile_image_url"
        )
        .eq("is_verified", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching safespaces:", error);
        return;
      }

      const formattedSafespaces = (data || []).map((safespace) => ({
        id: safespace.id,
        name: safespace.name,
        address: safespace.address,
        latitude: safespace.latitude,
        longitude: safespace.longitude,
        openingHours: safespace.available_hours || "",
        type: safespace.type,
        phoneNumber: safespace.phone_number,
        profileImageUrl: safespace.profile_image_url,
        safetyMeasure:
          safespace.safety_measure ||
          (safespace.is_verified
            ? "Verified safespace"
            : "Pending verification"),
        isVerified: safespace.is_verified,
      }));

      setSafespaces(formattedSafespaces);
    };

    fetchSafespaces();
  }, [])
);

  const [region, setRegion] = useState({
    latitude: 51.0259,
    longitude: 4.4775,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeSteps, setRouteSteps] = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);
const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSafespaces, setShowSafespaces] = useState(true);
  const [showStarredDestinations, setShowStarredDestinations] = useState(false);
const [starredDestinations, setStarredDestinations] = useState([]);
const [currentLocationCoords, setCurrentLocationCoords] = useState(null);
const [locationLoading, setLocationLoading] = useState(false);

useFocusEffect(
  React.useCallback(() => {
    const incomingDestination = route.params?.destination;

    if (incomingDestination) {
      setDestination(incomingDestination);
      setShowSafespaces(false);

      navigation.setParams({
        destination: undefined,
      });
    }
  }, [route.params?.destination])
);

  const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY;

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          address
        )}&bbox=2.3,49.5,6.4,51.6`,
        {
          headers: {
            "User-Agent": "Heira/1.0",
          },
        }
      );

      if (!response.ok) {
        console.error("Photon API error:", response.status);
        return null;
      }

      const data = await response.json();

      if (data.features && data.features[0]) {
        const coords = data.features[0].geometry.coordinates;

        return {
          latitude: coords[1],
          longitude: coords[0],
        };
      }

      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const getCurrentLocation = async () => {
  try {
    setLocationLoading(true);

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Location permission needed",
        "Please allow location access to use your current location."
      );
      return null;
    }

    const location =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    setCurrentLocationCoords(coords);
    setOrigin("Current Location");

    mapRef.current?.animateToRegion(
      {
        ...coords,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      500
    );

    return coords;
  } catch (error) {
    console.error("Location error:", error);

    Alert.alert(
      "Location error",
      "Your current location could not be found."
    );

    return null;
  } finally {
    setLocationLoading(false);
  }
};

  const getRoute = async () => {
    if (!origin.trim() || !destination.trim()) {
      Alert.alert(
        "Error",
        "Please enter both origin and destination"
      );
      return;
    }

    setLoading(true);

    try {
      let originCoords;

if (origin === "Current Location" && currentLocationCoords) {
  originCoords = currentLocationCoords;
} else {
  originCoords = await geocodeAddress(origin);
}

const destCoords = await geocodeAddress(destination);

      if (!originCoords || !destCoords) {
        Alert.alert(
          "Error",
          "Could not find address. Try a more specific location."
        );

        setLoading(false);
        return;
      }

      const response = await fetch(
  `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${ORS_API_KEY}&start=${originCoords.longitude},${originCoords.latitude}&end=${destCoords.longitude},${destCoords.latitude}`,
  {
    headers: {
      Accept: "application/geo+json",
    },
  }
);

      const data = await response.json();

      if (data.features && data.features[0]) {
        const coords =
          data.features[0].geometry.coordinates.map(
            ([longitude, latitude]) => ({
              latitude,
              longitude,
            })
          );

        setRouteCoords(coords);

        const segment =
          data.features[0].properties.segments[0];

        const steps = segment.steps || [];
          setRouteSteps(steps);

          console.log("Route steps:", steps);

        const distance = (
          segment.distance / 1000
        ).toFixed(2);

        const duration = Math.round(
          segment.duration / 60
        );

        setRouteInfo({
          distance,
          duration,
          originCoords,
          destCoords,
        });

        if (coords.length > 0) {
          const latitudes = coords.map(
            (coordinate) => coordinate.latitude
          );

          const longitudes = coords.map(
            (coordinate) => coordinate.longitude
          );

          const minLatitude = Math.min(...latitudes);
          const maxLatitude = Math.max(...latitudes);
          const minLongitude = Math.min(...longitudes);
          const maxLongitude = Math.max(...longitudes);

          const centerLatitude =
            (minLatitude + maxLatitude) / 2;

          const centerLongitude =
            (minLongitude + maxLongitude) / 2;

          const routeLatitudeDelta =
            maxLatitude - minLatitude;

          const routeLongitudeDelta =
            maxLongitude - minLongitude;

          const padding = 1.5;
          const menuFactor = 1.67;

          const latitudeDelta =
            routeLatitudeDelta *
            padding *
            menuFactor;

          const longitudeDelta =
            routeLongitudeDelta *
            padding *
            menuFactor;

          const offsetLatitude =
            routeLatitudeDelta * 0.35;

          const newRegion = {
            latitude:
              centerLatitude + offsetLatitude,
            longitude: centerLongitude,
            latitudeDelta: Math.max(
              latitudeDelta,
              0.02
            ),
            longitudeDelta: Math.max(
              longitudeDelta,
              0.02
            ),
          };

          mapRef.current?.animateToRegion(
            newRegion,
            500
          );
        }
      } else {
        Alert.alert(
          "Error",
          "No route found. Try different locations."
        );
      }
    } catch (error) {
      console.error("Route error:", error);

      Alert.alert(
        "Error",
        "Failed to fetch route. Check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearRoute = () => {
    setRouteCoords([]);
    setRouteInfo(null);
  };

  const saveStarredDestination = async () => {
  const trimmedDestination = destination.trim();

  if (!trimmedDestination) {
    Alert.alert(
      "No destination",
      "Enter a destination before adding it to your starred destinations."
    );
    return;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert(
        "Not logged in",
        "You need to be logged in to save a destination."
      );
      return;
    }

    const { data: existingDestinations, error: checkError } =
  await supabase
    .from("starred_destinations")
    .select("id")
    .eq("user_id", user.id)
    .eq("address", trimmedDestination)
    .limit(1);

    if (checkError) {
      console.error(
        "Error checking starred destination:",
        checkError
      );

      Alert.alert(
        "Could not save destination",
        "Please try again."
      );

      return;
    }

    if (existingDestinations && existingDestinations.length > 0) {
  Alert.alert(
    "Already saved",
    "This destination is already in your starred destinations."
  );

  return;
}

    const coordinates =
      await geocodeAddress(trimmedDestination);

    if (!coordinates) {
      Alert.alert(
        "Location not found",
        "Please enter a more specific destination."
      );
      return;
    }

    const { error } = await supabase
      .from("starred_destinations")
      .insert([
        {
          user_id: user.id,
          name: trimmedDestination,
          address: trimmedDestination,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
      ]);

    if (error) {
      console.error(
        "Error saving starred destination:",
        error
      );

      Alert.alert(
        "Could not save destination",
        "Please try again."
      );

      return;
    }

    Alert.alert(
      "Destination saved",
      "This destination was added to your starred destinations."
    );
  } catch (error) {
    console.error(
      "Error saving starred destination:",
      error
    );

    Alert.alert(
      "Something went wrong",
      "Please try again."
    );
  }
};

const fetchStarredDestinations = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setStarredDestinations([]);
    return;
  }

  const { data, error } = await supabase
    .from("starred_destinations")
    .select("id, name, address, latitude, longitude, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading starred destinations:", error);
    return;
  }

  setStarredDestinations(data || []);
};

const openStarredDestinations = async () => {
  await fetchStarredDestinations();

  setShowSafespaces(false);
  setShowStarredDestinations(true);
};

const selectStarredDestination = (place) => {
  setDestination(place.address);
  setShowStarredDestinations(false);
};

const removeStarredDestination = async (place) => {
  const { error } = await supabase
    .from("starred_destinations")
    .delete()
    .eq("id", place.id);

  if (error) {
    console.error(
      "Error removing starred destination:",
      error
    );

    Alert.alert(
      "Could not remove destination",
      "Please try again."
    );

    return;
  }

  setStarredDestinations((current) =>
    current.filter(
      (destination) => destination.id !== place.id
    )
  );
};
const openSafespace = (safespace) => {
  navigation.navigate("SafespaceDetail", {
    safespace,
  });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      >
        {safespaces.map((safespace) => (
          <Marker
            key={safespace.id}
            coordinate={{
              latitude: safespace.latitude,
              longitude: safespace.longitude,
            }}
            title={safespace.name}
            description={safespace.address}
            pinColor={COLORS.green}
            onPress={() =>
              setShowSafespaces(true)
            }
          />
        ))}

        {routeInfo ? (
          <>
            <Marker
              coordinate={routeInfo.originCoords}
              title="Origin"
              description={origin}
              pinColor={COLORS.green}
            />

            <Marker
              coordinate={routeInfo.destCoords}
              title="Destination"
              description={destination}
              pinColor={COLORS.red}
            />
          </>
        ) : null}

        {routeCoords.length > 0 ? (
          <Polyline
            coordinates={routeCoords}
            strokeColor={COLORS.blue}
            strokeWidth={4}
            pointerEvents="none"
          />
        ) : null}
      </MapView>

      {!isNavigating ? (
  <View style={styles.routePlannerContainer}>
        <Text style={styles.title}>
          Where are you going?
        </Text>

        <View style={styles.inputContainer}>
          <TouchableOpacity
  activeOpacity={0.7}
  onPress={getCurrentLocation}
  disabled={locationLoading}
>
  <Ionicons
    name="navigate-circle"
    size={24}
    color={
      currentLocationCoords
        ? COLORS.green
        : COLORS.blue
    }
  />
</TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Current Location"
            placeholderTextColor={COLORS.span}
            value={origin}
            onChangeText={setOrigin}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="location"
            size={24}
            color={COLORS.blue}
          />

          <TextInput
            style={styles.input}
            placeholder="Destination or safespace"
            placeholderTextColor={COLORS.span}
            value={destination}
            onChangeText={setDestination}
          />

          <TouchableOpacity
  onPress={openStarredDestinations}
  onLongPress={saveStarredDestination}
  delayLongPress={500}
  activeOpacity={0.7}
>
  <Ionicons
    name="star-outline"
    size={22}
    color={COLORS.span}
  />
</TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={getRoute}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? "Finding route..."
              : "Plan Route"}
          </Text>
        </TouchableOpacity>

        {routeInfo ? (
          <View style={styles.routeResult}>
            <View>
              <Text style={styles.infoText}>
                {routeInfo.duration} min
              </Text>

              <Text style={styles.distanceText}>
                {routeInfo.distance} km
              </Text>
            </View>

<View style={styles.routeActions}>
  <TouchableOpacity
  style={styles.stepsButton}
  onPress={() => {
    if (routeSteps.length === 0) {
      Alert.alert(
        "No steps",
        "No navigation instructions were returned."
      );
      return;
    }

    setCurrentStepIndex(0);
    setIsNavigating(true);
    setShowSafespaces(false);
  }}
>
  <Text style={styles.stepsButtonText}>
    Start
  </Text>
</TouchableOpacity>

  <TouchableOpacity
    style={styles.clearButton}
    onPress={clearRoute}
  >
    <Text style={styles.clearButtonText}>
      Clear
    </Text>
  </TouchableOpacity>
</View>

          </View>
        ) : null}
        </View>
) : null}

{isNavigating ? (
  <NavigationInstruction
  step={routeSteps[currentStepIndex]}
  isFirstStep={currentStepIndex === 0}
  isLastStep={currentStepIndex === routeSteps.length - 1}

  onPrevious={() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((current) => current - 1);
    }
  }}

  onNext={() => {
    if (currentStepIndex < routeSteps.length - 1) {
      setCurrentStepIndex((current) => current + 1);
    } else {
      setIsNavigating(false);
      setCurrentStepIndex(0);
      clearRoute();
    }
  }}

  onCancel={() => {
    setIsNavigating(false);
    setCurrentStepIndex(0);
  }}
/>
) : null}

      {showSafespaces ? (
        <View style={styles.safespacesSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                {safespaces.length} safespaces nearby
              </Text>

              <Text style={styles.sheetSubtitle}>
                Places you can feel safe and supported
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.8}
              onPress={() =>
                setShowSafespaces(false)
              }
            >
              <Ionicons
                name="close"
                size={25}
                color={COLORS.blue}
              />
            </TouchableOpacity>
            
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.safespacesContent
            }
          >
            {safespaces.map((safespace) => (
              <SafespaceCard
                key={safespace.id}
                safespace={safespace}
                onPress={() =>
                  openSafespace(safespace)
                }
              />
            ))}
          </ScrollView>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.openSafespacesButton}
          activeOpacity={0.85}
          onPress={() =>
            setShowSafespaces(true)
          }
        >
          <Ionicons
            name="shield-checkmark"
            size={25}
            color={COLORS.offWhite}
          />
        </TouchableOpacity>
      )}
        <StarredDestinationsSheet
  visible={showStarredDestinations}
  destinations={starredDestinations}
  onClose={() => setShowStarredDestinations(false)}
  onSelect={selectStarredDestination}
  onRemove={removeStarredDestination}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },

  routePlannerContainer: {
    position: "absolute",
    top: 32,
    left: 16,
    right: 16,
    backgroundColor: COLORS.offWhite,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.lightBlue,

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 6,
  },

  title: {
    color: COLORS.blue,
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 12,
  },

  inputContainer: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.blue,
    borderRadius: 9,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: COLORS.offWhite,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 15,
    marginLeft: 8,
    paddingVertical: 10,
  },

  button: {
    minHeight: 45,
    backgroundColor: COLORS.blue,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: COLORS.offWhite,
    fontSize: 15,
    fontWeight: "700",
  },

  routeResult: {
    marginTop: 11,
    borderRadius: 8,
    backgroundColor: COLORS.lightBlue,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  infoText: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "700",
  },

  distanceText: {
    color: COLORS.span,
    fontSize: 13,
    marginTop: 2,
  },

  clearButton: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: COLORS.red,
  },

  clearButtonText: {
    color: COLORS.offWhite,
    fontSize: 13,
    fontWeight: "600",
  },

  safespacesSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "43%",
    backgroundColor: COLORS.offWhite,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.lightBlue,

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 9,
  },

  sheetHandle: {
    width: 45,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.midGray,
    alignSelf: "center",
    marginTop: 9,
  },

  sheetHeader: {
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sheetTitle: {
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },

  sheetSubtitle: {
    color: COLORS.span,
    fontSize: 14,
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  safespacesContent: {
    paddingHorizontal: 18,
    paddingBottom: 25,
  },

  openSafespacesButton: {
    position: "absolute",
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  routeActions: {
  flexDirection: "row",
  alignItems: "center",
},

stepsButton: {
  paddingHorizontal: 13,
  paddingVertical: 7,
  borderRadius: 7,
  backgroundColor: COLORS.green,
  marginRight: 8,
},

stepsButtonText: {
  color: COLORS.offWhite,
  fontSize: 13,
  fontWeight: "600",
},
});