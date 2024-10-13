// screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, Snackbar } from 'react-native-paper';
import { auth, firestore } from '../firebase/config';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [visible, setVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleRegister = async () => {
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
    <View style={styles.container}>
      <Title style={styles.title}>Create an Account</Title>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button mode="contained" onPress={handleRegister} style={styles.button}>
        Register
      </Button>
      <Button onPress={() => navigation.navigate('Login')}>
        Already have an account? Login
      </Button>
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default RegisterScreen;