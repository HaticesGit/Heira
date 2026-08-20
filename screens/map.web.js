import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  PanResponder,
  Animated,
} from "react-native";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  CircleMarker,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { Ionicons } from "@expo/vector-icons";

import SafespaceCard from "../components/SafespaceCard";
import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function FitRoute({ routeCoords }) {
  const map = useMap();

  React.useEffect(() => {
    if (routeCoords.length > 0) {
      const bounds = routeCoords.map(
        (coord) => [
          coord.latitude,
          coord.longitude,
        ]
      );

      map.fitBounds(bounds, {
        padding: [40, 40],
      });
    }
  }, [routeCoords, map]);

  return null;
}

export default function MapScreen({
  navigation,
  route,
}) {
  const [origin, setOrigin] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [
    currentLocationCoords,
    setCurrentLocationCoords,
  ] = useState(null);

  const [routeCoords, setRouteCoords] =
    useState([]);

  const [routeInfo, setRouteInfo] =
    useState(null);

  const [routeSteps, setRouteSteps] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    isNavigating,
    setIsNavigating,
  ] = useState(false);

  const [
    currentStepIndex,
    setCurrentStepIndex,
  ] = useState(0);

  const [safespaces, setSafespaces] =
    useState([]);

  const [
    showSafespaces,
    setShowSafespaces,
  ] = useState(false);

  const sheetY = React.useRef(
    new Animated.Value(0)
  ).current;

  React.useEffect(() => {
    const incomingDestination =
      route?.params?.destination;

    if (incomingDestination) {
      setDestination(
        incomingDestination
      );

      setShowSafespaces(false);

      sheetY.setValue(0);

      navigation.setParams({
        destination: undefined,
      });
    }
  }, [route?.params?.destination]);

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder:
        (_, gestureState) =>
          Math.abs(
            gestureState.dy
          ) > 5,

      onPanResponderMove: (
        _,
        gestureState
      ) => {
        if (
          gestureState.dy >
          0
        ) {
          sheetY.setValue(
            gestureState.dy
          );
        }
      },

      onPanResponderRelease: (
        _,
        gestureState
      ) => {
        if (
          gestureState.dy >
          120
        ) {
          Animated.spring(
            sheetY,
            {
              toValue: 260,
              useNativeDriver:
                true,
            }
          ).start();
        } else {
          Animated.spring(
            sheetY,
            {
              toValue: 0,
              useNativeDriver:
                true,
            }
          ).start();
        }
      },
    })
  ).current;

  const ORS_API_KEY =
    process.env
      .EXPO_PUBLIC_ORS_API_KEY;

  const geocodeAddress =
    async (address) => {
      try {
        const response =
          await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(
              address
            )}&bbox=2.3,49.5,6.4,51.6`
          );

        if (!response.ok) {
          return null;
        }

        const data =
          await response.json();

        if (
          data.features &&
          data.features[0]
        ) {
          const coords =
            data.features[0]
              .geometry
              .coordinates;

          return {
            latitude:
              coords[1],

            longitude:
              coords[0],
          };
        }

        return null;
      } catch (error) {
        console.error(
          "Geocoding error:",
          error
        );

        return null;
      }
    };

  const getCurrentLocation =
    async () => {
      try {
        if (
          typeof navigator ===
            "undefined" ||
          !navigator.geolocation
        ) {
          if (
            typeof window !==
            "undefined"
          ) {
            window.alert(
              "Your browser does not support location services."
            );
          }

          return;
        }

        const position =
          await new Promise(
            (
              resolve,
              reject
            ) => {
              navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                  enableHighAccuracy:
                    true,

                  timeout:
                    15000,

                  maximumAge:
                    0,
                }
              );
            }
          );

        const coords = {
          latitude:
            position.coords
              .latitude,

          longitude:
            position.coords
              .longitude,
        };

        console.log(
          "CURRENT LOCATION:",
          coords
        );

        setCurrentLocationCoords(
          coords
        );

        setOrigin(
          "Current Location"
        );
      } catch (error) {
        console.log(
          "CURRENT LOCATION ERROR:",
          error
        );

        let message =
          "Your current location could not be found.";

        if (
          error?.code === 1
        ) {
          message =
            "Location permission was denied. Please allow location access in your browser settings.";
        }

        if (
          error?.code === 2
        ) {
          message =
            "Your location is currently unavailable.";
        }

        if (
          error?.code === 3
        ) {
          message =
            "Finding your location took too long. Please try again.";
        }

        if (
          typeof window !==
          "undefined"
        ) {
          window.alert(
            message
          );
        } else {
          Alert.alert(
            "Location error",
            message
          );
        }
      }
    };

  React.useEffect(() => {
    const fetchSafespaces =
      async () => {
        const {
          data,
          error,
        } = await supabase
          .from(
            "safespaces"
          )
          .select(
            "id, name, address, latitude, longitude, available_hours, type, phone_number, safety_measure, is_verified, profile_image_url"
          )
          .eq(
            "is_verified",
            true
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

        if (error) {
          console.error(
            "Error fetching safespaces:",
            error
          );

          return;
        }

        setSafespaces(
          data || []
        );
      };

    fetchSafespaces();
  }, []);

  const getRoute =
    async () => {
      if (
        !origin.trim() ||
        !destination.trim()
      ) {
        Alert.alert(
          "Error",
          "Please enter both origin and destination."
        );

        return;
      }

      setLoading(true);

      try {
        let originCoords;

        if (
          origin ===
            "Current Location" &&
          currentLocationCoords
        ) {
          originCoords =
            currentLocationCoords;
        } else {
          originCoords =
            await geocodeAddress(
              origin
            );
        }

        const destCoords =
          await geocodeAddress(
            destination
          );

        if (
          !originCoords ||
          !destCoords
        ) {
          Alert.alert(
            "Location not found",
            "Try entering a more specific address."
          );

          return;
        }

        const response =
          await fetch(
            `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${ORS_API_KEY}&start=${originCoords.longitude},${originCoords.latitude}&end=${destCoords.longitude},${destCoords.latitude}`,
            {
              headers: {
                Accept:
                  "application/geo+json",
              },
            }
          );

        const data =
          await response.json();

        if (
          !data.features ||
          !data.features[0]
        ) {
          Alert.alert(
            "No route found",
            "Try different locations."
          );

          return;
        }

        const feature =
          data.features[0];

        const coords =
          feature.geometry.coordinates.map(
            ([
              longitude,
              latitude,
            ]) => ({
              latitude,
              longitude,
            })
          );

        const segment =
          feature.properties
            .segments[0];

        console.log(
          "ROUTE STEPS:",
          segment.steps
        );

        setRouteCoords(
          coords
        );

        setRouteSteps(
          segment.steps || []
        );

        setRouteInfo({
          distance:
            (
              segment.distance /
              1000
            ).toFixed(2),

          duration:
            Math.round(
              segment.duration /
                60
            ),

          originCoords,

          destCoords,
        });
      } catch (error) {
        console.error(
          "Route error:",
          error
        );

        Alert.alert(
          "Error",
          "The route could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    };

  const clearRoute = () => {
    setRouteCoords([]);
    setRouteInfo(null);
    setRouteSteps([]);

    setIsNavigating(
      false
    );

    setCurrentStepIndex(
      0
    );
  };

  const startNavigation =
    () => {
      if (
        routeSteps.length ===
        0
      ) {
        if (
          typeof window !==
          "undefined"
        ) {
          window.alert(
            "No navigation instructions were returned."
          );
        } else {
          Alert.alert(
            "No steps",
            "No navigation instructions were returned."
          );
        }

        return;
      }

      setCurrentStepIndex(
        0
      );

      setShowSafespaces(
        false
      );

      setIsNavigating(
        true
      );
    };

  return (
    <View
      style={
        styles.container
      }
    >
      <MapContainer
        center={[
          51.0259,
          4.4775,
        ]}
        zoom={13}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* CURRENT LOCATION */}

        {currentLocationCoords ? (
          <CircleMarker
            center={[
              currentLocationCoords.latitude,
              currentLocationCoords.longitude,
            ]}
            radius={9}
            pathOptions={{
              color:
                COLORS.offWhite,

              weight: 3,

              fillColor:
                COLORS.blue,

              fillOpacity:
                1,
            }}
          >
            <Popup>
              Your current
              location
            </Popup>
          </CircleMarker>
        ) : null}

        {/* SAFESPACES */}

        {showSafespaces &&
          safespaces.map(
            (
              safespace
            ) => (
              <Marker
                key={
                  safespace.id
                }
                position={[
                  Number(
                    safespace.latitude
                  ),

                  Number(
                    safespace.longitude
                  ),
                ]}
              >
                <Popup>
                  <strong>
                    {
                      safespace.name
                    }
                  </strong>

                  <br />

                  {
                    safespace.address
                  }
                </Popup>
              </Marker>
            )
          )}

        {/* START + DESTINATION */}

        {routeInfo ? (
          <>
            <CircleMarker
              center={[
                routeInfo
                  .originCoords
                  .latitude,

                routeInfo
                  .originCoords
                  .longitude,
              ]}
              radius={9}
              pathOptions={{
                color:
                  COLORS.offWhite,

                weight: 3,

                fillColor:
                  COLORS.blue,

                fillOpacity:
                  1,
              }}
            >
              <Popup>
                Your starting
                point
              </Popup>
            </CircleMarker>

            <Marker
              position={[
                routeInfo
                  .destCoords
                  .latitude,

                routeInfo
                  .destCoords
                  .longitude,
              ]}
            >
              <Popup>
                Destination
              </Popup>
            </Marker>
          </>
        ) : null}

        {/* ROUTE */}

        {routeCoords.length >
        0 ? (
          <Polyline
            positions={routeCoords.map(
              (
                coord
              ) => [
                coord.latitude,
                coord.longitude,
              ]
            )}
            pathOptions={{
              color:
                COLORS.blue,

              weight: 5,
            }}
          />
        ) : null}

        <FitRoute
          routeCoords={
            routeCoords
          }
        />
      </MapContainer>

      {/* SAFESPACE SHEET */}

      {showSafespaces ? (
        <Animated.View
          style={[
            styles.safespacesSheet,
            {
              transform: [
                {
                  translateY:
                    sheetY,
                },
              ],
            },
          ]}
        >
          <View
            style={
              styles.dragArea
            }
            {...panResponder.panHandlers}
          >
            <View
              style={
                styles.sheetHandle
              }
            />
          </View>

          <View
            style={
              styles.sheetHeader
            }
          >
            <View>
              <Text
                style={
                  styles.sheetTitle
                }
              >
                {
                  safespaces.length
                }{" "}
                safespaces nearby
              </Text>

              <Text
                style={
                  styles.sheetSubtitle
                }
              >
                Places you can
                feel safe and
                supported
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setShowSafespaces(
                  false
                );

                sheetY.setValue(
                  0
                );
              }}
            >
              <Text
                style={
                  styles.closeText
                }
              >
                ×
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.safespacesContent
            }
          >
            {safespaces.map(
              (
                safespace
              ) => (
                <SafespaceCard
                  key={
                    safespace.id
                  }
                  safespace={{
                    ...safespace,

                    openingHours:
                      safespace.available_hours ||
                      "",

                    phoneNumber:
                      safespace.phone_number,

                    profileImageUrl:
                      safespace.profile_image_url,

                    safetyMeasure:
                      safespace.safety_measure ||
                      "Verified safespace",

                    isVerified:
                      safespace.is_verified,
                  }}
                  onPress={() =>
                    navigation.navigate(
                      "SafespaceDetail",
                      {
                        safespace:
                          {
                            ...safespace,

                            openingHours:
                              safespace.available_hours ||
                              "",

                            phoneNumber:
                              safespace.phone_number,

                            profileImageUrl:
                              safespace.profile_image_url,

                            safetyMeasure:
                              safespace.safety_measure ||
                              "Verified safespace",

                            isVerified:
                              safespace.is_verified,
                          },
                      }
                    )
                  }
                />
              )
            )}
          </ScrollView>
        </Animated.View>
      ) : null}

      {/* SAFESPACE BUTTON */}

      {!isNavigating ? (
        <TouchableOpacity
          style={
            styles.safespaceButton
          }
          onPress={() =>
            setShowSafespaces(
              (
                current
              ) => !current
            )
          }
        >
          <Ionicons
            name="shield-checkmark"
            size={28}
            color={
              COLORS.offWhite
            }
          />
        </TouchableOpacity>
      ) : null}

      {/* ROUTE PLANNER */}

      {!isNavigating ? (
        <View
          style={
            styles.routePlanner
          }
        >
          <Text
            style={
              styles.title
            }
          >
            Where are you
            going?
          </Text>

          {/* ORIGIN */}

          <View
            style={
              styles.inputRow
            }
          >
            <TouchableOpacity
              onPress={
                getCurrentLocation
              }
              style={
                styles.locationButton
              }
            >
              <Text
                style={
                  styles.locationButtonText
                }
              >
                ◎
              </Text>
            </TouchableOpacity>

            <TextInput
              style={
                styles.input
              }
              value={
                origin
              }
              onChangeText={
                setOrigin
              }
              placeholder="Current Location"
              placeholderTextColor={
                COLORS.span
              }
            />
          </View>

          {/* DESTINATION */}

          <View
            style={
              styles.inputRow
            }
          >
            <TextInput
              style={
                styles.input
              }
              value={
                destination
              }
              onChangeText={
                setDestination
              }
              placeholder="Destination or safespace"
              placeholderTextColor={
                COLORS.span
              }
            />
          </View>

          {/* PLAN ROUTE */}

          <TouchableOpacity
            style={
              styles.planButton
            }
            onPress={
              getRoute
            }
            disabled={
              loading
            }
          >
            <Text
              style={
                styles.planButtonText
              }
            >
              {loading
                ? "Finding route..."
                : "Plan Route"}
            </Text>
          </TouchableOpacity>

          {/* ROUTE RESULT */}

          {routeInfo ? (
            <View
              style={
                styles.routeResult
              }
            >
              <View>
                <Text
                  style={
                    styles.routeTime
                  }
                >
                  {
                    routeInfo.duration
                  }{" "}
                  min
                </Text>

                <Text
                  style={
                    styles.routeDistance
                  }
                >
                  {
                    routeInfo.distance
                  }{" "}
                  km
                </Text>
              </View>

              <View
                style={
                  styles.actions
                }
              >
                <TouchableOpacity
                  style={
                    styles.startButton
                  }
                  onPress={
                    startNavigation
                  }
                >
                  <Text
                    style={
                      styles.actionText
                    }
                  >
                    Start
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.clearButton
                  }
                  onPress={
                    clearRoute
                  }
                >
                  <Text
                    style={
                      styles.actionText
                    }
                  >
                    Clear
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* NAVIGATION INSTRUCTIONS */}

      {isNavigating &&
      routeSteps[
        currentStepIndex
      ] ? (
        <View
          style={
            styles.navigationOverlay
          }
        >
          <View
            style={
              styles.navigationTopRow
            }
          >
            <View
              style={
                styles.navigationIcon
              }
            >
              <Ionicons
                name="navigate"
                size={25}
                color={
                  COLORS.offWhite
                }
              />
            </View>

            <View
              style={
                styles.navigationTextContainer
              }
            >
              <Text
                style={
                  styles.navigationInstruction
                }
              >
                {routeSteps[
                  currentStepIndex
                ].instruction ||
                  "Continue on the route"}
              </Text>

              <Text
                style={
                  styles.navigationDistance
                }
              >
                {routeSteps[
                  currentStepIndex
                ].distance
                  ? `${Math.round(
                      routeSteps[
                        currentStepIndex
                      ]
                        .distance
                    )} m`
                  : ""}
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.navigationCloseButton
              }
              onPress={() => {
                setIsNavigating(
                  false
                );

                setCurrentStepIndex(
                  0
                );
              }}
            >
              <Ionicons
                name="close"
                size={24}
                color={
                  COLORS.blue
                }
              />
            </TouchableOpacity>
          </View>

          <Text
            style={
              styles.stepCounter
            }
          >
            Step{" "}
            {currentStepIndex +
              1}{" "}
            of{" "}
            {
              routeSteps.length
            }
          </Text>

          <View
            style={
              styles.navigationActions
            }
          >
            <TouchableOpacity
              style={[
                styles.navigationActionButton,

                currentStepIndex ===
                  0 &&
                  styles.navigationActionDisabled,
              ]}
              disabled={
                currentStepIndex ===
                0
              }
              onPress={() =>
                setCurrentStepIndex(
                  (
                    current
                  ) =>
                    current -
                    1
                )
              }
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={
                  COLORS.offWhite
                }
              />

              <Text
                style={
                  styles.navigationActionText
                }
              >
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.navigationActionButton
              }
              onPress={() => {
                if (
                  currentStepIndex <
                  routeSteps.length -
                    1
                ) {
                  setCurrentStepIndex(
                    (
                      current
                    ) =>
                      current +
                      1
                  );
                } else {
                  clearRoute();
                }
              }}
            >
              <Text
                style={
                  styles.navigationActionText
                }
              >
                {currentStepIndex ===
                routeSteps.length -
                  1
                  ? "Finish"
                  : "Next"}
              </Text>

              <Ionicons
                name={
                  currentStepIndex ===
                  routeSteps.length -
                    1
                    ? "checkmark"
                    : "chevron-forward"
                }
                size={20}
                color={
                  COLORS.offWhite
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      height: "100%",
    },

    routePlanner: {
      zIndex: 1000,

      position:
        "absolute",

      top: 32,
      left: 16,
      right: 16,

      backgroundColor:
        COLORS.offWhite,

      borderRadius:
        18,

      padding: 14,

      borderWidth:
        1,

      borderColor:
        COLORS.lightBlue,
    },

    title: {
      color:
        COLORS.blue,

      fontSize:
        19,

      fontWeight:
        "700",

      marginBottom:
        12,
    },

    inputRow: {
      minHeight:
        48,

      borderWidth:
        1,

      borderColor:
        COLORS.blue,

      borderRadius:
        9,

      paddingHorizontal:
        10,

      marginBottom:
        10,

      backgroundColor:
        COLORS.offWhite,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    input: {
      flex: 1,

      color:
        COLORS.blue,

      fontSize:
        15,

      paddingVertical:
        10,
    },

    locationButton: {
      marginRight:
        8,
    },

    locationButtonText: {
      color:
        COLORS.blue,

      fontSize:
        24,

      fontWeight:
        "700",
    },

    planButton: {
      minHeight:
        45,

      backgroundColor:
        COLORS.blue,

      borderRadius:
        8,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    planButtonText: {
      color:
        COLORS.offWhite,

      fontSize:
        15,

      fontWeight:
        "700",
    },

    routeResult: {
      marginTop:
        11,

      borderRadius:
        8,

      backgroundColor:
        COLORS.lightBlue,

      padding:
        10,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    routeTime: {
      color:
        COLORS.blue,

      fontSize:
        15,

      fontWeight:
        "700",
    },

    routeDistance: {
      color:
        COLORS.span,

      fontSize:
        13,

      marginTop:
        2,
    },

    actions: {
      flexDirection:
        "row",
    },

    startButton: {
      paddingHorizontal:
        13,

      paddingVertical:
        7,

      borderRadius:
        7,

      backgroundColor:
        COLORS.green,

      marginRight:
        8,
    },

    clearButton: {
      paddingHorizontal:
        13,

      paddingVertical:
        7,

      borderRadius:
        7,

      backgroundColor:
        COLORS.red,
    },

    actionText: {
      color:
        COLORS.offWhite,

      fontSize:
        13,

      fontWeight:
        "600",
    },

    safespaceButton: {
      position:
        "absolute",

      right: 20,

      bottom: 90,

      zIndex:
        1000,

      width: 58,

      height: 58,

      borderRadius:
        29,

      backgroundColor:
        COLORS.green,

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        COLORS.offBlack,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity:
        0.18,

      shadowRadius:
        5,

      elevation:
        5,
    },

    safespacesSheet: {
      position:
        "absolute",

      left: 0,
      right: 0,
      bottom: 0,

      height: 300,

      zIndex:
        1100,

      backgroundColor:
        COLORS.offWhite,

      borderTopLeftRadius:
        22,

      borderTopRightRadius:
        22,

      paddingHorizontal:
        18,

      shadowColor:
        COLORS.offBlack,

      shadowOffset: {
        width: 0,
        height: -3,
      },

      shadowOpacity:
        0.15,

      shadowRadius:
        8,

      elevation:
        10,
    },

    dragArea: {
      height: 30,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    sheetHandle: {
      width: 44,

      height: 5,

      borderRadius:
        3,

      backgroundColor:
        COLORS.midGray,
    },

    sheetHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        12,
    },

    sheetTitle: {
      color:
        COLORS.blue,

      fontSize:
        18,

      fontWeight:
        "700",
    },

    sheetSubtitle: {
      color:
        COLORS.span,

      fontSize:
        13,

      marginTop:
        3,
    },

    closeText: {
      color:
        COLORS.blue,

      fontSize:
        30,

      lineHeight:
        30,
    },

    safespacesContent: {
      paddingBottom:
        30,
    },

    navigationOverlay: {
      position:
        "absolute",

      top: 32,

      left: 16,

      right: 16,

      zIndex:
        2000,

      elevation:
        20,

      backgroundColor:
        COLORS.offWhite,

      borderRadius:
        18,

      padding:
        14,

      borderWidth:
        1,

      borderColor:
        COLORS.lightBlue,

      shadowColor:
        COLORS.offBlack,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity:
        0.18,

      shadowRadius:
        8,
    },

    navigationTopRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    navigationIcon: {
      width: 44,

      height: 44,

      borderRadius:
        22,

      backgroundColor:
        COLORS.blue,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        12,
    },

    navigationTextContainer: {
      flex: 1,
    },

    navigationInstruction: {
      color:
        COLORS.blue,

      fontSize:
        17,

      fontWeight:
        "700",

      lineHeight:
        22,
    },

    navigationDistance: {
      color:
        COLORS.span,

      fontSize:
        14,

      marginTop:
        3,
    },

    navigationCloseButton: {
      width:
        36,

      height:
        36,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    stepCounter: {
      color:
        COLORS.span,

      fontSize:
        12,

      marginTop:
        12,

      marginBottom:
        8,
    },

    navigationActions: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",
    },

    navigationActionButton: {
      minHeight:
        42,

      paddingHorizontal:
        14,

      borderRadius:
        8,

      backgroundColor:
        COLORS.blue,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    navigationActionDisabled: {
      opacity:
        0.35,
    },

    navigationActionText: {
      color:
        COLORS.offWhite,

      fontSize:
        14,

      fontWeight:
        "700",

      marginHorizontal:
        4,
    },
  });