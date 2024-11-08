import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const GOOGLE_PLACES_API_KEY = 'AIzaSyDy2I-tqTGEzvZJG9kv_PW0JEwGkwajifU'; // Replace with your Google Places API key

const NearbyStoresScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Fetch nearby stores using Google Places API
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=1500&type=store&key=${GOOGLE_PLACES_API_KEY}`);
      const data = await response.json();
      setStores(data.results);
    })();
  }, []);

  const openMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  if (errorMsg) {
    return <View style={styles.container}><Text>{errorMsg}</Text></View>;
  }

  if (!location) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
          title="You are here"
          image={require('../assets/green-marker.png')} // Use your custom green marker icon
        />
        {stores.map(store => (
          <Marker
            key={store.place_id}
            coordinate={{ latitude: store.geometry.location.lat, longitude: store.geometry.location.lng }}
            title={store.name}
            onPress={() => openMaps(store.geometry.location.lat, store.geometry.location.lng)}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default NearbyStoresScreen;
