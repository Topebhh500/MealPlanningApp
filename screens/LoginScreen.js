import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, Image } from 'react-native';
import { TextInput, Button, Title, Snackbar } from 'react-native-paper';
import { auth } from '../api/firebase';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);

  useEffect(() => {
    checkFingerprintSettings();
  }, []);

  const checkFingerprintSettings = async () => {
    const storedSetting = await AsyncStorage.getItem('fingerprintEnabled');
    setFingerprintEnabled(storedSetting === 'true');

    // Check if saved credentials exist
    const savedEmail = await AsyncStorage.getItem('email');
    const savedPassword = await AsyncStorage.getItem('password');
    
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
    }
  };

  const handleLogin = async () => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      // Store credentials for future fingerprint logins
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('password', password);
      await AsyncStorage.setItem('fingerprintEnabled', 'true');
      navigation.navigate('Main'); // Navigates to MainTabs after login success
    } catch (error) {
      setSnackbarMessage(error.message);
      setVisible(true);
    }
  };

  const handleFingerprintLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with fingerprint',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        // Retrieve stored credentials
        const storedEmail = await AsyncStorage.getItem('email');
        const storedPassword = await AsyncStorage.getItem('password');

        if (storedEmail && storedPassword) {
          // Log in with stored credentials
          await auth.signInWithEmailAndPassword(storedEmail, storedPassword);
          navigation.navigate('Main'); // Navigates to MainTabs after fingerprint success
        } else {
          setSnackbarMessage('No credentials stored for fingerprint login.');
          setVisible(true);
        }
      } else {
        setSnackbarMessage('Fingerprint authentication failed');
        setVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('An error occurred during fingerprint authentication');
      setVisible(true);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/background.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image 
          source={require('../assets/background.jpg')} // Change to your logo image
          style={styles.image}
        />
        <Title style={styles.title}>Meal Planning Mate!</Title>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          mode="outlined"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />
        <Button mode="contained" onPress={handleLogin} style={styles.button}>
          Login
        </Button>
        {fingerprintEnabled && (
          <Button 
            mode="outlined" 
            onPress={handleFingerprintLogin} 
            style={styles.button}
          >
            Login with Fingerprint
          </Button>
        )}
        <Button onPress={() => navigation.navigate('Register')} style={styles.registerButton}>
          Don't have an account? Register
        </Button>
        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={3000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slight transparency for container
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333', // Darker color for better contrast
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
  registerButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  image: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 60, // Circular image
  },
  snackbar: {
    backgroundColor: '#4caf50', // Green for success messages
  },
});

export default LoginScreen;
