// screens/MealPlanScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Paragraph, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock function for AI meal suggestion (to be replaced with actual API call later)
const suggestMeals = (preferences) => {
  const meals = [
    { name: 'Grilled Chicken Salad', calories: 350, ingredients: ['chicken breast', 'mixed greens', 'tomatoes', 'cucumber', 'balsamic dressing'] },
    { name: 'Vegetarian Stir Fry', calories: 300, ingredients: ['tofu', 'mixed vegetables', 'brown rice', 'soy sauce'] },
    { name: 'Salmon with Roasted Vegetables', calories: 400, ingredients: ['salmon fillet', 'broccoli', 'carrots', 'olive oil'] },
    { name: 'Quinoa Bowl', calories: 380, ingredients: ['quinoa', 'black beans', 'corn', 'avocado', 'lime juice'] },
    { name: 'Turkey and Avocado Wrap', calories: 320, ingredients: ['turkey slices', 'avocado', 'lettuce', 'tomato', 'whole wheat wrap'] },
  ];

  // Filter meals based on preferences (this is a simplified version)
  return meals.filter(meal => 
    meal.calories <= preferences.calorieGoal / 3 &&
    !meal.ingredients.some(ingredient => preferences.allergies.includes(ingredient))
  );
};

const MealPlanScreen = () => {
  const [mealPlan, setMealPlan] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    allergies: [],
    dietType: '',
    calorieGoal: 2000,
  });

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const storedPreferences = await AsyncStorage.getItem('userPreferences');
      if (storedPreferences) {
        setUserPreferences(JSON.parse(storedPreferences));
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const generateMealPlan = () => {
    const suggestedMeals = suggestMeals(userPreferences);
    setMealPlan(suggestedMeals.slice(0, 3)); // Limit to 3 meals for simplicity
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Your Meal Plan</Title>
      
      <Button mode="contained" onPress={generateMealPlan} style={styles.button}>
        Generate Meal Plan
      </Button>
      
      {mealPlan.map((meal, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <Title>{meal.name}</Title>
            <Paragraph>Calories: {meal.calories}</Paragraph>
            <Paragraph>Ingredients: {meal.ingredients.join(', ')}</Paragraph>
          </Card.Content>
        </Card>
      ))}
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
  button: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 20,
  },
});

export default MealPlanScreen;