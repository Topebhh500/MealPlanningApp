// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Paragraph, Button } from 'react-native-paper';
import { auth, firestore } from '../firebase/config';

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [userPreferences, setUserPreferences] = useState({
    allergies: [],
    dietType: '',
    calorieGoal: 0,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection('users').doc(user.uid).get();
        if (doc.exists) {
          const userData = doc.data();
          setUserName(userData.name || 'User');
          setUserPreferences(userData.preferences || {
            allergies: [],
            dietType: '',
            calorieGoal: 0,
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleUpdateProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Welcome, {userName}!</Title>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Your Health Profile</Title>
          <Paragraph>Allergies: {userPreferences.allergies.join(', ') || 'None set'}</Paragraph>
          <Paragraph>Diet Type: {userPreferences.dietType || 'Not set'}</Paragraph>
          <Paragraph>Daily Calorie Goal: {userPreferences.calorieGoal || 'Not set'}</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={handleUpdateProfile}>Update Profile</Button>
        </Card.Actions>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Today's Summary</Title>
          <Paragraph>Calories consumed: 0</Paragraph>
          <Paragraph>Meals planned: 0</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Meal Plan')}>View Meal Plan</Button>
        </Card.Actions>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Shopping List</Title>
          <Paragraph>Items to buy: 0</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Shopping List')}>View Shopping List</Button>
        </Card.Actions>
      </Card>
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
  card: {
    marginBottom: 20,
  },
});

export default HomeScreen;