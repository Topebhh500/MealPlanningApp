import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Title, Text, Snackbar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, firestore } from "../api/firebase";
import styles from "../styles/RegisterStyle";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setSnackbarMessage("All fields are required.");
      setVisible(true);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setSnackbarMessage("Please enter a valid email address.");
      setVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      await firestore
        .collection("users")
        .doc(userCredential.user.uid)
        .set({
          name,
          email,
          preferences: {
            allergies: [],
            dietType: "",
            calorieGoal: 2000,
          },
        });
    } catch (error) {
      setSnackbarMessage(error.message);
      setVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Join</Title>
        <Title style={styles.appTitle}>Meal Planning Mate!</Title>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Icon name="account-plus" size={80} color="#6200ea" />
        </View>

        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          activeOutlineColor="#6200ea"
          left={<TextInput.Icon icon="account" color="#6200ea" />}
        />

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
          onPress={handleRegister}
          style={styles.registerButton}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>

        <Button
          onPress={() => navigation.navigate("Login")}
          style={styles.loginButton}
          labelStyle={styles.loginButtonText}
        >
          Already have an account? Login
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

export default RegisterScreen;
