import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Title,
  TextInput,
  Button,
  Chip,
  Snackbar,
  Avatar,
  Switch,
  Text,
  Surface,
  IconButton,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, firestore, storage } from "../api/firebase";
import * as ImagePicker from "expo-image-picker";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const [name, setName] = useState("");
  const [allergies, setAllergies] = useState([]);
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [calorieGoal, setCalorieGoal] = useState("");
  const [visible, setVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [fingerprintSupported, setFingerprintSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  const allergyOptions = [
    "Dairy",
    "Eggs",
    "Nuts",
    "Shellfish",
    "Wheat",
    "Pork",
    "Garlic",
  ];
  const dietaryPreferenceOptions = [
    "Balanced",
    "High-Protein",
    "Low-Carb",
    "Vegetarian",
    "Vegan",
  ];

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
    const storedSetting = await AsyncStorage.getItem("fingerprintEnabled");
    setFingerprintEnabled(storedSetting === "true");
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection("users").doc(user.uid).get();
        if (doc.exists) {
          const userData = doc.data();
          setName(userData.name || "");
          setAllergies(userData.allergies || []);
          setDietaryPreferences(userData.dietaryPreferences || []);
          setCalorieGoal(userData.calorieGoal?.toString() || "");
          setProfilePicture(userData.profilePicture || null);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      showSnackbar("Failed to load user data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveUserData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await firestore
          .collection("users")
          .doc(user.uid)
          .update({
            name,
            allergies,
            dietaryPreferences,
            calorieGoal: parseInt(calorieGoal) || 0,
            profilePicture,
          });
        showSnackbar("Profile updated successfully!", "success");
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      showSnackbar("Failed to update profile. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, type = "success") => {
    setSnackbarMessage(message);
    setVisible(true);
  };

  const toggleAllergy = (allergy) => {
    setAllergies(
      allergies.includes(allergy)
        ? allergies.filter((a) => a !== allergy)
        : [...allergies, allergy]
    );
  };

  const toggleDietaryPreference = (preference) => {
    setDietaryPreferences(
      dietaryPreferences.includes(preference)
        ? dietaryPreferences.filter((p) => p !== preference)
        : [...dietaryPreferences, preference]
    );
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setLoading(true);
        await uploadImage(result.assets[0].uri);
        showSnackbar("Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showSnackbar("Failed to update profile picture", "error");
    } finally {
      setLoading(false);
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
    try {
      const newSetting = !fingerprintEnabled;
      await AsyncStorage.setItem("fingerprintEnabled", newSetting.toString());
      setFingerprintEnabled(newSetting);
      showSnackbar(`Fingerprint login ${newSetting ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Error toggling fingerprint:", error);
      showSnackbar("Failed to update fingerprint settings", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      showSnackbar("Failed to sign out", "error");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={120}
            source={
              profilePicture
                ? { uri: profilePicture }
                : require("../assets/default-avatar.jpg")
            }
            style={styles.avatar}
          />
          <Button
            mode="outlined"
            onPress={pickImage}
            style={styles.uploadButton}
            icon="camera"
          >
            Change Photo
          </Button>
        </View>
      </Surface>

      <Surface style={styles.section}>
        <Title style={styles.sectionTitle}>Personal Information</Title>
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          outlineColor="#6200ea"
          activeOutlineColor="#6200ea"
          left={<TextInput.Icon icon="account" color="#6200ea" />}
        />

        <TextInput
          label="Daily Calorie Target"
          value={calorieGoal}
          onChangeText={setCalorieGoal}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          outlineColor="#6200ea"
          activeOutlineColor="#6200ea"
          left={<TextInput.Icon icon="fire" color="#6200ea" />}
        />
      </Surface>

      <Surface style={styles.section}>
        <Title style={styles.sectionTitle}>Allergies</Title>
        <View style={styles.chipsContainer}>
          {allergyOptions.map((allergy) => (
            <Chip
              key={allergy}
              selected={allergies.includes(allergy)}
              onPress={() => toggleAllergy(allergy)}
              style={[
                styles.chip,
                allergies.includes(allergy) && styles.selectedChip,
              ]}
              textStyle={{
                color: allergies.includes(allergy) ? "#fff" : "#666",
              }}
              icon={allergies.includes(allergy) ? "check" : "plus"}
            >
              {allergy}
            </Chip>
          ))}
        </View>
      </Surface>

      <Surface style={styles.section}>
        <Title style={styles.sectionTitle}>Dietary Preferences</Title>
        <View style={styles.chipsContainer}>
          {dietaryPreferenceOptions.map((preference) => (
            <Chip
              key={preference}
              selected={dietaryPreferences.includes(preference)}
              onPress={() => toggleDietaryPreference(preference)}
              style={[
                styles.chip,
                dietaryPreferences.includes(preference) && styles.selectedChip,
              ]}
              textStyle={{
                color: dietaryPreferences.includes(preference)
                  ? "#fff"
                  : "#666",
              }}
              icon={dietaryPreferences.includes(preference) ? "check" : "plus"}
            >
              {preference}
            </Chip>
          ))}
        </View>
      </Surface>

      {fingerprintSupported && (
        <Surface style={styles.section}>
          <View style={styles.settingContainer}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Fingerprint Login</Text>
              <Text style={styles.settingDescription}>
                Use biometric authentication for quick login
              </Text>
            </View>
            <Switch
              value={fingerprintEnabled}
              onValueChange={toggleFingerprintLogin}
              color="#6200ea"
            />
          </View>
        </Surface>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={saveUserData}
          style={styles.saveButton}
          loading={loading}
          disabled={loading}
          icon="content-save"
        >
          Save Changes
        </Button>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
        >
          Logout
        </Button>
      </View>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={styles.snackbar}
        action={{
          label: "Dismiss",
          onPress: () => setVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  profileHeader: {
    backgroundColor: "#6200ea",
    padding: 20,
    alignItems: "center",
    elevation: 4,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    borderWidth: 4,
    borderColor: "#fff",
    elevation: 8,
  },
  uploadButton: {
    marginTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200ea",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  chip: {
    margin: 4,
    backgroundColor: "#f0f0f0",
  },
  selectedChip: {
    backgroundColor: "#6200ea",
  },
  settingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 16,
  },
  saveButton: {
    marginBottom: 12,
    backgroundColor: "#6200ea",
    padding: 8,
  },
  logoutButton: {
    backgroundColor: "#f44336",
    padding: 8,
  },
  snackbar: {
    backgroundColor: "#323232",
  },
});

export default ProfileScreen;
