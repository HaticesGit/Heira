import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, TextInput, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function MapScreen() {
  const [region, setRegion] = useState({
    latitude: 51.0259,
    longitude: 4.4775,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);


  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&bbox=2.3,49.5,6.4,51.6`,
        { headers: { 'User-Agent': 'Heira/1.0' } }
      );
      
      if (!response.ok) {
        console.error('Photon API error:', response.status);
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
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const getRoute = async () => {
    if (!origin.trim() || !destination.trim()) {
      Alert.alert('Error', 'Please enter both origin and destination');
      return;
    }

    setLoading(true);

    try {
      const originCoords = await geocodeAddress(origin);
      const destCoords = await geocodeAddress(destination);

      if (!originCoords || !destCoords) {
        Alert.alert('Error', 'Could not find address. Try a more specific location.');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${originCoords.longitude},${originCoords.latitude};${destCoords.longitude},${destCoords.latitude}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => ({
          latitude: lat,
          longitude: lon,
        }));
        setRouteCoords(coords);

        const distance = (data.routes[0].distance / 1000).toFixed(2);
        const duration = Math.round(data.routes[0].duration / 60);
        setRouteInfo({
          distance,
          duration,
          originCoords,
          destCoords,
        });

        if (coords.length > 0) {
          const midpoint = coords[Math.floor(coords.length / 2)];
          setRegion({
            ...midpoint,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch route. Check your internet connection.');
      console.error('Route error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearRoute = () => {
    setRouteCoords([]);
    setRouteInfo(null);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      >
        {routeInfo && (
          <>
            <Marker
              coordinate={routeInfo.originCoords}
              title="Origin"
              description={origin}
              pinColor="green"
            />
            <Marker
              coordinate={routeInfo.destCoords}
              title="Destination"
              description={destination}
              pinColor="red"
            />
          </>
        )}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#0066FF"
            strokeWidth={3}
          />
        )}
        {!routeInfo && (
          <Marker
            coordinate={{ latitude: region.latitude, longitude: region.longitude }}
            title="My Location"
            description="This is a marker"
          />
        )}
      </MapView>

      <ScrollView style={styles.routePlannerContainer}>
          <Text style={styles.title}>Route Planner</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter origin address"
            placeholderTextColor="#999"
            value={origin}
            onChangeText={setOrigin}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter destination address"
            placeholderTextColor="#999"
            value={destination}
            onChangeText={setDestination}
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={getRoute} 
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Finding route...' : 'Plan Route'}
            </Text>
          </TouchableOpacity>

          {routeInfo && (
            <>
              <TouchableOpacity style={styles.clearButton} onPress={clearRoute}>
                <Text style={styles.buttonText}>Clear Route</Text>
              </TouchableOpacity>

              <View style={styles.routeInfo}>
                <Text style={styles.infoText}>Distance: {routeInfo.distance} km</Text>
                <Text style={styles.infoText}>Duration: {routeInfo.duration} min</Text>
              </View>
            </>
          )}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#0066FF',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  routePlannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 15,
    maxHeight: '40%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#0066FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  routeInfo: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 4,
  },
  suggestions: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 13,
    color: '#333',
  },
});
