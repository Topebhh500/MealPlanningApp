// screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { TextInput, Button, Title, Snackbar } from 'react-native-paper';
import { auth, firestore } from '../api/firebase';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [visible, setVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setSnackbarMessage('All fields are required.');
      setVisible(true);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setSnackbarMessage('Please enter a valid email address.');
      setVisible(true);
      return;
    }

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      await firestore.collection('users').doc(userCredential.user.uid).set({
        name,
        email,
        preferences: {
          allergies: [],
          dietType: '',
          calorieGoal: 2000,
        }
      });
      navigation.replace('Main');
    } catch (error) {
      setSnackbarMessage(error.message);
      setVisible(true);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/background.jpg')} // Optional: Add a background image
      style={styles.background}
    >
      <View style={styles.container}>
        <Title style={styles.title}>Create an Account</Title>
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined" // Use outlined style
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          mode="outlined" // Use outlined style
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined" // Use outlined style
        />
        <Button mode="contained" onPress={handleRegister} style={styles.button}>
          Register
        </Button>
        <Button onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
          Already have an account? Login
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
  loginButton: {
    alignSelf: 'center',
  },
  snackbar: {
    backgroundColor: '#4caf50', // Green for success messages
  },
});

export default RegisterScreen;
