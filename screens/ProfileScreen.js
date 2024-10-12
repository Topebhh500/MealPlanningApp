// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, TextInput, Button, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [dietType, setDietType] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedName = await AsyncStorage.getItem('userName');
      const storedPreferences = await AsyncStorage.getItem('userPreferences');
      if (storedName) setName(storedName);
      if (storedPreferences) {
        const preferences = JSON.parse(storedPreferences);
        setAllergies(preferences.allergies || []);
        setDietType(preferences.dietType || '');
        setCalorieGoal(preferences.calorieGoal ? preferences.calorieGoal.toString() : '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveUserData = async () => {
    try {
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userPreferences', JSON.stringify({
        allergies,
        dietType,
        calorieGoal: parseInt(calorieGoal) || 0,
      }));
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving user data:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const addAllergy = () => {
    if (newAllergy && !allergies.includes(newAllergy)) {
      setAllergies([...allergies, newAllergy]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Your Profile</Title>
      
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      
      <Title style={styles.subtitle}>Allergies</Title>
      <View style={styles.allergiesContainer}>
        {allergies.map((allergy, index) => (
          <Chip key={index} onClose={() => removeAllergy(allergy)} style={styles.chip}>{allergy}</Chip>
        ))}
      </View>
      <View style={styles.allergyInput}>
        <TextInput
          label="Add Allergy"
          value={newAllergy}
          onChangeText={setNewAllergy}
          style={styles.input}
        />
        <Button onPress={addAllergy}>Add</Button>
      </View>
      
      <TextInput
        label="Diet Type"
        value={dietType}
        onChangeText={setDietType}
        style={styles.input}
      />
      
      <TextInput
        label="Daily Calorie Goal"
        value={calorieGoal}
        onChangeText={setCalorieGoal}
        keyboardType="numeric"
        style={styles.input}
      />
      
      <Button mode="contained" onPress={saveUserData} style={styles.button}>
        Save Profile
      </Button>
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
  allergiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    margin: 4,
  },
  allergyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
});

export default ProfileScreen;