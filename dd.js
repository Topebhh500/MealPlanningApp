import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Title, Card, Paragraph, Button, Avatar, ActivityIndicator, List } from 'react-native-paper';
import { auth, firestore } from '../api/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [userPreferences, setUserPreferences] = useState({
    allergies: [],
    dietaryPreferences: [],
    calorieGoal: 0,
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [todaysSummary, setTodaysSummary] = useState({
    caloriesConsumed: 0,
    mealsPlanned: 0,
    itemsToBuy: 0,
  });
  const [todaysMeals, setTodaysMeals] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadTodaysSummary();
    loadTodaysMeals();
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection('users').doc(user.uid).get();
        if (doc.exists) {
          const userData = doc.data();
          setUserName(userData.name || 'User');
          setUserPreferences({
            allergies: userData.allergies || [],
            dietaryPreferences: userData.dietaryPreferences || [],
            calorieGoal: userData.calorieGoal || 0,
          });
          setProfilePicture(userData.profilePicture || null);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadTodaysSummary = async () => {
    try {
      const storedMealPlan = await AsyncStorage.getItem('mealPlan');
      const storedShoppingList = await AsyncStorage.getItem('shoppingList');
      
      if (storedMealPlan) {
        const mealPlan = JSON.parse(storedMealPlan);
        const today = new Date().toLocaleString('en-us', {weekday: 'long'});
        const todaysMeals = mealPlan[today];
        
        const caloriesConsumed = Object.values(todaysMeals).reduce((sum, meal) => sum + (meal.calories || 0), 0);
        const mealsPlanned = Object.values(todaysMeals).filter(meal => meal.name).length;
        
        const shoppingList = storedShoppingList ? JSON.parse(storedShoppingList) : [];
        const itemsToBuy = shoppingList.length;

        setTodaysSummary({ caloriesConsumed, mealsPlanned, itemsToBuy });
      }
    } catch (error) {
      console.error('Error loading today\'s summary:', error);
    }
  };

  const loadTodaysMeals = async () => {
    try {
      const storedMealPlan = await AsyncStorage.getItem('mealPlan');
      if (storedMealPlan) {
        const mealPlan = JSON.parse(storedMealPlan);
        const today = new Date().toLocaleString('en-us', {weekday: 'long'});
        setTodaysMeals(mealPlan[today]);
      }
    } catch (error) {
      console.error('Error loading today\'s meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = () => {
    navigation.navigate('Profile');
  };

  const renderMealItem = (meal, type) => {
    if (!meal || !meal.name) return null;
    return (
      <List.Item
        title={`${type}:`}
        description={`${meal.name} - ${meal.calories} cal | P: ${meal.protein}g | C: ${meal.carbs}g | F: ${meal.fat}g`}
        right={() => <List.Icon icon="food" />}
        left={() => meal.image && (
          <Image source={{ uri: meal.image }} style={styles.mealThumb} />
        )}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image 
          size={50} 
          source={profilePicture ? { uri: profilePicture } : require('../assets/default-avatar.jpg')} 
        />
        <Title style={styles.title}>Welcome, {userName}!</Title>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Your Health Profile</Title>
          <Paragraph>Allergies: {userPreferences.allergies.join(', ') || 'None set'}</Paragraph>
          <Paragraph>Dietary Preferences: {userPreferences.dietaryPreferences.join(', ') || 'None set'}</Paragraph>
          <Paragraph>Daily Calorie Target: {userPreferences.calorieGoal || 'Not set'}</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={handleUpdateProfile}>Update Profile</Button>
        </Card.Actions>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Today's Meals</Title>
          <List.Section>
            {renderMealItem(todaysMeals.breakfast, 'Breakfast')}
            {renderMealItem(todaysMeals.lunch, 'Lunch')}
            {renderMealItem(todaysMeals.dinner, 'Dinner')}
          </List.Section>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => navigation.navigate('Meal Plan')}>View Meal Plan</Button>
        </Card.Actions>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Today's Summary</Title>
          <Paragraph>Calories consumed: {todaysSummary.caloriesConsumed}</Paragraph>
          <Paragraph>Meals planned: {todaysSummary.mealsPlanned}</Paragraph>
          <Paragraph>Items to buy: {todaysSummary.itemsToBuy}</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => navigation.navigate('Shopping List')}>Shopping List</Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginLeft: 20,
  },
  card: {
    marginBottom: 40,
  },
  mealThumb: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});

export default HomeScreen;