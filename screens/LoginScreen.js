import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, ImageBackground } from "react-native";
import { TextInput, Button, Title, Text, Snackbar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { auth } from "../api/firebase";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkFingerprintSettings();
  }, []);

  const checkFingerprintSettings = async () => {
    const storedSetting = await AsyncStorage.getItem("fingerprintEnabled");
    setFingerprintEnabled(storedSetting === "true");

    const savedEmail = await AsyncStorage.getItem("email");
    const savedPassword = await AsyncStorage.getItem("password");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setSnackbarMessage("Please fill in all fields");
      setVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      await AsyncStorage.setItem("email", email);
      await AsyncStorage.setItem("password", password);
      await AsyncStorage.setItem("fingerprintEnabled", "true");
    } catch (error) {
      setSnackbarMessage(error.message);
      setVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFingerprintLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login with fingerprint",
        fallbackLabel: "Use password",
      });

      if (result.success) {
        setIsLoading(true);
        const storedEmail = await AsyncStorage.getItem("email");
        const storedPassword = await AsyncStorage.getItem("password");

        if (storedEmail && storedPassword) {
          await auth.signInWithEmailAndPassword(storedEmail, storedPassword);
        } else {
          setSnackbarMessage("No credentials stored for fingerprint login.");
          setVisible(true);
        }
      } else {
        setSnackbarMessage("Fingerprint authentication failed");
        setVisible(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred during fingerprint authentication");
      setVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Tervetuloa!</Title>
        <Title style={styles.appTitle}>Meal Planning Mate!</Title>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Icon name="food-variant" size={80} color="#6200ea" />
        </View>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          mode="outlined"
          activeOutlineColor="#6200ea"
          left={<TextInput.Icon icon="email" color="#6200ea" />}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          activeOutlineColor="#6200ea"
          left={<TextInput.Icon icon="lock" color="#6200ea" />}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.loginButton}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>

        {fingerprintEnabled && (
          <Button
            mode="outlined"
            onPress={handleFingerprintLogin}
            style={styles.fingerprintButton}
            icon="fingerprint"
          >
            Login with Fingerprint
          </Button>
        )}

        <Button
          onPress={() => navigation.navigate("Register")}
          style={styles.registerButton}
          labelStyle={styles.registerButtonText}
        >
          Don't have an account? Register
        </Button>

        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={3000}
          style={styles.snackbar}
          action={{
            label: "Close",
            onPress: () => setVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#6200ea",
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    elevation: 5,
  },
  headerTitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 20,
  },
  appTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#6200ea",
    padding: 5,
    borderRadius: 10,
  },
  fingerprintButton: {
    marginBottom: 10,
    borderColor: "#6200ea",
    borderRadius: 10,
  },
  registerButton: {
    marginTop: 10,
  },
  registerButtonText: {
    color: "#6200ea",
  },
  snackbar: {
    backgroundColor: "#323232",
  },
});

export default LoginScreen;
