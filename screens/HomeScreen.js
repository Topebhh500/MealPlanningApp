import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Title, Card, Paragraph, Button, Avatar, ActivityIndicator, List } from 'react-native-paper';
import { auth, firestore } from '../api/firebase';

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
      const user = auth.currentUser;
      if (user) {
        // Load meal plan data
        const mealPlanDoc = await firestore.collection('mealPlans').doc(user.uid).get();
        // Load shopping list data
        const shoppingListDoc = await firestore.collection('shoppingLists').doc(user.uid).get();

        if (mealPlanDoc.exists) {
          const mealPlan = mealPlanDoc.data();
          const today = new Date().toISOString().split('T')[0];
          const todaysMeals = mealPlan[today] || { breakfast: null, lunch: null, dinner: null };

          setTodaysMeals(todaysMeals);

          const caloriesConsumed = Object.values(todaysMeals).reduce((sum, meal) => sum + (meal?.calories || 0), 0);
          const mealsPlanned = Object.values(todaysMeals).filter(meal => meal?.name).length;

          // Check if shopping list exists and count total items to buy
          const shoppingList = shoppingListDoc.exists ? shoppingListDoc.data().items : [];
          const itemsToBuy = shoppingList.length;

          // Update the summary state
          setTodaysSummary({ caloriesConsumed, mealsPlanned, itemsToBuy });
        }
      }
    } catch (error) {
      console.error('Error loading today\'s summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = () => {
    navigation.navigate('Profile');
  };

  const renderMealItem = (meal, type) => {
    if (!meal || !meal.name) {
      return (
        <List.Item
          title={`${type}: Not Planned`}
          description="No meal data available"
          style={styles.mealItem}
        />
      );
    }

    return (
      <List.Item
        title={`${type}: ${meal.name}`}
        description={`Calories: ${meal.calories} | P: ${meal.protein}g | C: ${meal.carbs}g | F: ${meal.fat}g`}
        style={styles.mealItem}
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
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image 
          size={70} 
          source={profilePicture ? { uri: profilePicture } : require('../assets/default-avatar.jpg')} 
        />
        <Title style={styles.title}>{userName}!</Title>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Your Health Profile</Title>
          <Paragraph style={styles.profileText}>
            Allergies: {userPreferences.allergies.join(', ') || 'None set'}
          </Paragraph>
          <Paragraph style={styles.profileText}>
            Dietary Preferences: {userPreferences.dietaryPreferences.join(', ') || 'None set'}
          </Paragraph>
          <Paragraph style={styles.profileText}>
            Daily Calorie Target: {userPreferences.calorieGoal || 'Not set'}
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={handleUpdateProfile}>Update Profile</Button>
        </Card.Actions>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Today's Meals</Title>
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
        <Title style={styles.cardTitle}>Today's Summary</Title>
        <Paragraph style={styles.summaryText}>
          Calories consumed: {todaysSummary.caloriesConsumed}
        </Paragraph>
        <Paragraph style={styles.summaryText}>
          Meals planned: {todaysSummary.mealsPlanned}
        </Paragraph>
        <Paragraph style={styles.summaryText}>
          Items to buy: {todaysSummary.itemsToBuy}
        </Paragraph>
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
    backgroundColor: '#f9f9f9', // Light background color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9', // Light background color
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginLeft: 15,
    color: '#333', // Darker color for better contrast
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    elevation: 3, // Slight shadow for depth
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6200ee', // Accent color for titles
  },
  profileText: {
    fontSize: 14,
    color: '#555', // Subtle text color
  },
  mealItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Light separator line
  },
  mealThumb: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  summaryText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#333', // Darker color for better contrast
  },
});

export default HomeScreen;
