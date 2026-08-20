import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { Ionicons } from "@expo/vector-icons";

import { supabase } from "../lib/supabase";
import { COLORS } from "../constants/colors";

function FollowLocation({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return;
    }

    map.setView(
      [latitude, longitude],
      map.getZoom(),
      {
        animate: true,
      }
    );
  }, [latitude, longitude, map]);

  return null;
}

export default function SharedLocationScreen({
  shareToken,
}) {
  const [locationShare, setLocationShare] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const fetchSharedLocation =
    useCallback(async () => {
      if (!shareToken) {
        setErrorMessage(
          "This location link is invalid."
        );

        setLoading(false);

        return;
      }

      try {
        const { data, error } =
          await supabase
            .from("location_shares")
            .select(
              "id, latitude, longitude, is_active, updated_at"
            )
            .eq("share_token", shareToken)
            .maybeSingle();

        if (error) {
          console.log(
            "Shared location error:",
            error
          );

          setErrorMessage(
            "The live location could not be loaded."
          );

          setLoading(false);

          return;
        }

        if (!data) {
          setErrorMessage(
            "This location share does not exist or is no longer available."
          );

          setLoading(false);

          return;
        }

        if (!data.is_active) {
          setLocationShare(data);

          setErrorMessage(
            "This live location is no longer being shared."
          );

          setLoading(false);

          return;
        }

        setLocationShare(data);
        setErrorMessage("");
        setLoading(false);
      } catch (error) {
        console.log(
          "Unexpected shared location error:",
          error
        );

        setErrorMessage(
          "The live location could not be loaded."
        );

        setLoading(false);
      }
    }, [shareToken]);

  useEffect(() => {
    fetchSharedLocation();

    const interval = setInterval(() => {
      fetchSharedLocation();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchSharedLocation]);

  const getUpdatedText = () => {
    if (!locationShare?.updated_at) {
      return "";
    }

    const updatedAt =
      new Date(
        locationShare.updated_at
      ).getTime();

    const secondsAgo = Math.max(
      0,
      Math.floor(
        (Date.now() - updatedAt) /
          1000
      )
    );

    if (secondsAgo < 10) {
      return "Updated just now";
    }

    if (secondsAgo < 60) {
      return `Updated ${secondsAgo} seconds ago`;
    }

    const minutesAgo = Math.floor(
      secondsAgo / 60
    );

    if (minutesAgo === 1) {
      return "Updated 1 minute ago";
    }

    return `Updated ${minutesAgo} minutes ago`;
  };

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator
          size="large"
          color={COLORS.blue}
        />

        <Text style={styles.loadingText}>
          Loading live location...
        </Text>
      </View>
    );
  }

  if (
    errorMessage ||
    !locationShare
  ) {
    return (
      <View style={styles.centerScreen}>
        <View style={styles.statusIcon}>
          <Ionicons
            name="location-outline"
            size={40}
            color={COLORS.blue}
          />
        </View>

        <Text style={styles.errorTitle}>
          Location unavailable
        </Text>

        <Text style={styles.errorText}>
          {errorMessage}
        </Text>

        <Text style={styles.heiraText}>
          Heira
        </Text>
      </View>
    );
  }

  const latitude =
    Number(locationShare.latitude);

  const longitude =
    Number(locationShare.longitude);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons
              name="shield-checkmark"
              size={22}
              color={COLORS.offWhite}
            />
          </View>

          <Text style={styles.brand}>
            Heira
          </Text>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />

          <Text style={styles.liveText}>
            LIVE
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <Ionicons
            name="location"
            size={25}
            color={COLORS.green}
          />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.title}>
            Live location
          </Text>

          <Text style={styles.subtitle}>
            A Heira user is sharing their
            live location with you.
          </Text>

          <Text style={styles.updatedText}>
            {getUpdatedText()}
          </Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapContainer
          center={[
            latitude,
            longitude,
          ]}
          zoom={16}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CircleMarker
            center={[
              latitude,
              longitude,
            ]}
            radius={11}
            pathOptions={{
              color: "#FFFFFF",
              weight: 4,
              fillColor: COLORS.blue,
              fillOpacity: 1,
            }}
          >
            <Popup>
              Live location
            </Popup>
          </CircleMarker>

          <FollowLocation
            latitude={latitude}
            longitude={longitude}
          />
        </MapContainer>
      </View>

      <View style={styles.footer}>
        <Ionicons
          name="lock-closed-outline"
          size={16}
          color={COLORS.span}
        />

        <Text style={styles.footerText}>
          This private link was shared
          with you through Heira.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
    height: "100vh",
    backgroundColor: COLORS.offWhite,
  },

  centerScreen: {
    flex: 1,
    width: "100%",
    height: "100vh",
    backgroundColor: COLORS.offWhite,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 14,
    color: COLORS.span,
    fontSize: 15,
  },

  header: {
    minHeight: 72,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1000,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  brand: {
    color: COLORS.offWhite,
    fontSize: 23,
    fontWeight: "700",
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
    marginRight: 6,
  },

  liveText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: "700",
  },

  infoCard: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.midGray,
    flexDirection: "row",
    zIndex: 1000,

    shadowColor: COLORS.offBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  infoIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.lightgreen,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  title: {
    color: COLORS.blue,
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 4,
  },

  subtitle: {
    color: COLORS.blue,
    fontSize: 14,
    lineHeight: 20,
  },

  updatedText: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },

  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.midGray,
  },

  footer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  footerText: {
    color: COLORS.span,
    fontSize: 12,
    marginLeft: 6,
    textAlign: "center",
  },

  statusIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  errorTitle: {
    color: COLORS.blue,
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 8,
  },

  errorText: {
    color: COLORS.span,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 400,
  },

  heiraText: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 28,
  },
});