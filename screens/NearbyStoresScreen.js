import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Linking,
  FlatList,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const GOOGLE_PLACES_API_KEY = "AIzaSyDy2I-tqTGEzvZJG9kv_PW0JEwGkwajifU";

const NearbyStoresScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [stores, setStores] = useState([]);
  const [address, setAddress] = useState(""); // Store the user's address

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const [geoAddress] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setAddress(
        `${geoAddress.street}, ${geoAddress.city}, ${geoAddress.region}, ${geoAddress.country}`
      );

      // Fetch nearby restaurants using Google Places API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=1500&type=supermarket&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();

      // Calculate distances and sort stores by distance
      const storesWithDistances = data.results.map((store) => {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          store.geometry.location.lat,
          store.geometry.location.lng
        );
        return { ...store, distance };
      });

      // Sort stores by distance (ascending)
      const sortedStores = storesWithDistances.sort(
        (a, b) => a.distance - b.distance
      );
      setStores(sortedStores);
    })();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance.toFixed(2); // Return distance with 2 decimal places
  };

  const openMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const renderStoreItem = ({ item }) => (
    <TouchableOpacity
      style={styles.storeItem}
      onPress={() =>
        openMaps(item.geometry.location.lat, item.geometry.location.lng)
      }
    >
      <Text style={styles.storeName}>
        {item.name} - ({item.distance} km)
      </Text>
      <Text style={styles.storeAddress}>{item.vicinity}</Text>
    </TouchableOpacity>
  );

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Display the user's current address */}
      <View style={styles.addressContainer}>
        <Text style={styles.addressText}>Location: {address}</Text>
      </View>

      {/* MapView on top */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* User location marker */}
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You are here"
          image={require("../assets/green-marker.png")} // Use your custom green marker icon
        />

        {/* Stores markers */}
        {stores.map((store) => (
          <Marker
            key={store.place_id}
            coordinate={{
              latitude: store.geometry.location.lat,
              longitude: store.geometry.location.lng,
            }}
            title={store.name}
            onPress={() =>
              openMaps(store.geometry.location.lat, store.geometry.location.lng)
            }
          />
        ))}
      </MapView>

      {/* FlatList to display store information */}
      <FlatList
        data={stores}
        keyExtractor={(item) => item.place_id}
        renderItem={renderStoreItem}
        style={styles.storeList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addressContainer: {
    padding: 10,
    backgroundColor: "#6200ea",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  addressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  map: {
    flex: 2, // MapView takes 2/3 of the screen height
    width: Dimensions.get("window").width,
  },
  storeList: {
    flex: 1, // FlatList takes 1/3 of the screen height
    backgroundColor: "#fff",
  },
  storeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  storeName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  storeDistance: {
    color: "#555",
    marginTop: 5,
    fontSize: 14,
  },
  storeAddress: {
    color: "#777",
    marginTop: 5,
  },
});

export default NearbyStoresScreen;
