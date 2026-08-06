import React, { useRef, useState } from "react";
import { StyleSheet, View, Dimensions, TextInput, TouchableOpacity, Text, ScrollView, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

import SafespaceCard from "../components/SafespaceCard";
import { COLORS } from "../constants/colors";

const SAFESPACES = [
  {
    id: "1",
    name: "The Cozy Café",
    distance: "1.2 km",
    address: "Centerstreet 12, Brussels",
    safetyMeasure: "Staff trained",
    openingHours: "Open now until 20:00",
    latitude: 51.0267,
    longitude: 4.4792,
  },
  {
    id: "2",
    name: "Safe Haven Coffee",
    distance: "1.8 km",
    address: "Bruul 45, Mechelen",
    safetyMeasure: "Verified safespace",
    openingHours: "Open now until 22:00",
    latitude: 51.0248,
    longitude: 4.4759,
  },
  {
    id: "3",
    name: "Green Corner",
    distance: "2.4 km",
    address: "IJzerenleen 18, Mechelen",
    safetyMeasure: "Staff trained",
    openingHours: "Open now until 19:30",
    latitude: 51.0284,
    longitude: 4.4821,
  },
];

export default function MapScreen({ navigation }) {
  const mapRef = useRef(null);

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
  const [loading, setLoading] = useState(false);
  const [showSafespaces, setShowSafespaces] = useState(true);

  const ORS_API_KEY =
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjVkMGExODZjMWE4ODRhNDVhNGI1ZGZmMDVlNzI3Y2IzIiwiaCI6Im11cm11cjY0In0=";

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
      const originCoords = await geocodeAddress(origin);
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

  const openSafespace = (safespace) => {
    console.log(
      "Safespace selected:",
      safespace.id
    );

    // Later:
    // navigation.navigate("SafespaceDetail", {
    //   safespace,
    // });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      >
        {SAFESPACES.map((safespace) => (
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

      <View style={styles.routePlannerContainer}>
        <Text style={styles.title}>
          Where are you going?
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="navigate-circle"
            size={24}
            color={COLORS.lightBlue}
          />

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

          <Ionicons
            name="star-outline"
            size={22}
            color={COLORS.span}
          />
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

            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearRoute}
            >
              <Text style={styles.clearButtonText}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {showSafespaces ? (
        <View style={styles.safespacesSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                {SAFESPACES.length} safespaces nearby
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
            {SAFESPACES.map((safespace) => (
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
});