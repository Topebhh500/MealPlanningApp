import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, TextInput, Button, Chip, Snackbar, Avatar, Switch } from 'react-native-paper';
import { auth, firestore, storage } from '../firebase/config';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [calorieGoal, setCalorieGoal] = useState('');
  const [visible, setVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [fingerprintSupported, setFingerprintSupported] = useState(false);

  const allergyOptions = ['Dairy', 'Eggs', 'Nuts', 'Shellfish', 'Wheat', 'Pork', 'Garlic'];
  const dietaryPreferenceOptions = ['Balanced', 'High-Protein', 'Low-Carb', 'Vegetarian', 'Vegan'];

  useEffect(() => {
    loadUserData();
    checkBiometricSupport();
    checkFingerprintSettings();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setFingerprintSupported(compatible);
  };

  const checkFingerprintSettings = async () => {
    const storedSetting = await AsyncStorage.getItem('fingerprintEnabled');
    setFingerprintEnabled(storedSetting === 'true');
  };

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection('users').doc(user.uid).get();
        if (doc.exists) {
          const userData = doc.data();
          setName(userData.name || '');
          setAllergies(userData.allergies || []);
          setDietaryPreferences(userData.dietaryPreferences || []);
          setCalorieGoal(userData.calorieGoal?.toString() || '');
          setProfilePicture(userData.profilePicture || null);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setSnackbarMessage('Failed to load user data. Please try again.');
      setVisible(true);
    }
  };

  const saveUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await firestore.collection('users').doc(user.uid).update({
          name,
          allergies,
          dietaryPreferences,
          calorieGoal: parseInt(calorieGoal) || 0,
          profilePicture
        });
        setSnackbarMessage('Profile updated successfully!');
        setVisible(true);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      setSnackbarMessage('Failed to update profile. Please try again.');
      setVisible(true);
    }
  };

  const toggleAllergy = (allergy) => {
    setAllergies(allergies.includes(allergy)
      ? allergies.filter(a => a !== allergy)
      : [...allergies, allergy]
    );
  };

  const toggleDietaryPreference = (preference) => {
    setDietaryPreferences(dietaryPreferences.includes(preference)
      ? dietaryPreferences.filter(p => p !== preference)
      : [...dietaryPreferences, preference]
    );
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const user = auth.currentUser;
    if (user) {
      const response = await fetch(uri);
      const blob = await response.blob();
      const ref = storage.ref().child(`profilePictures/${user.uid}`);
      await ref.put(blob);
      const url = await ref.getDownloadURL();
      setProfilePicture(url);
    }
  };

  const toggleFingerprintLogin = async () => {
    const newSetting = !fingerprintEnabled;
    await AsyncStorage.setItem('fingerprintEnabled', newSetting.toString());
    setFingerprintEnabled(newSetting);
    setSnackbarMessage(`Fingerprint login ${newSetting ? 'enabled' : 'disabled'}`);
    setVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Your Profile</Title>
      
      <View style={styles.avatarContainer}>
        <Avatar.Image 
          size={100} 
          source={profilePicture ? { uri: profilePicture } : require('../assets/default-avatar.jpg')} 
        />
        <Button onPress={pickImage} style={styles.uploadButton}>
          Upload Picture
        </Button>
      </View>

      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      
      <TextInput
        label="Daily Calorie Target"
        value={calorieGoal}
        onChangeText={setCalorieGoal}
        keyboardType="numeric"
        style={styles.input}
      />
      
      <Title style={styles.subtitle}>Allergies</Title>
      <View style={styles.chipsContainer}>
        {allergyOptions.map((allergy) => (
          <Chip
            key={allergy}
            selected={allergies.includes(allergy)}
            onPress={() => toggleAllergy(allergy)}
            style={styles.chip}
          >
            {allergy}
          </Chip>
        ))}
      </View>
      
      <Title style={styles.subtitle}>Dietary Preferences</Title>
      <View style={styles.chipsContainer}>
        {dietaryPreferenceOptions.map((preference) => (
          <Chip
            key={preference}
            selected={dietaryPreferences.includes(preference)}
            onPress={() => toggleDietaryPreference(preference)}
            style={styles.chip}
          >
            {preference}
          </Chip>
        ))}
      </View>
      
      {fingerprintSupported && (
        <View style={styles.settingContainer}>
          <Title style={styles.settingTitle}>Enable Fingerprint Login</Title>
          <Switch
            value={fingerprintEnabled}
            onValueChange={toggleFingerprintLogin}
          />
        </View>
      )}

      <Button mode="contained" onPress={saveUserData} style={styles.button}>
        Save Changes
      </Button>

      <Button mode="outlined" onPress={() => auth.signOut()} style={styles.buttonLogout}>
        Logout
      </Button>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    margin: 4,
  },
  button: {
    marginTop: 10,
  },
  buttonLogout: {
    marginTop: 10,
    marginBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    marginTop: 10,
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  settingTitle: {
    fontSize: 16,
  },
});

export default ProfileScreen;