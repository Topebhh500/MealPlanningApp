import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import {
  Title,
  Card,
  Paragraph,
  Button,
  Avatar,
  ActivityIndicator,
  List,
  Text,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, firestore } from "../api/firebase";
import styles from "../styles/HomeStyle";

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("");
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
  const [nextMeal, setNextMeal] = useState({ type: null, meal: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadTodaysSummary();
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection("users").doc(user.uid).get();
        if (doc.exists) {
          const userData = doc.data();
          setUserName(userData.name || "User");
          setUserPreferences({
            allergies: userData.allergies || [],
            dietaryPreferences: userData.dietaryPreferences || [],
            calorieGoal: userData.calorieGoal || 0,
          });
          setProfilePicture(userData.profilePicture || null);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadTodaysSummary = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const mealPlanDoc = await firestore
          .collection("mealPlans")
          .doc(user.uid)
          .get();
        const shoppingListDoc = await firestore
          .collection("shoppingLists")
          .doc(user.uid)
          .get();

        if (mealPlanDoc.exists) {
          const mealPlan = mealPlanDoc.data();
          const today = new Date().toISOString().split("T")[0];
          const todaysMeals = mealPlan[today] || {
            breakfast: null,
            lunch: null,
            dinner: null,
          };

          setTodaysMeals(todaysMeals);

          // Determine next meal based on current time
          const currentHour = new Date().getHours();
          let nextMealType = null;
          let nextMealData = null;

          if (currentHour < 11) {
            nextMealType = "Breakfast";
            nextMealData = todaysMeals.breakfast;
          } else if (currentHour < 16) {
            nextMealType = "Lunch";
            nextMealData = todaysMeals.lunch;
          } else {
            nextMealType = "Dinner";
            nextMealData = todaysMeals.dinner;
          }

          setNextMeal({ type: nextMealType, meal: nextMealData });

          const caloriesConsumed = Object.values(todaysMeals).reduce(
            (sum, meal) => sum + (meal?.calories || 0),
            0
          );
          const mealsPlanned = Object.values(todaysMeals).filter(
            (meal) => meal?.name
          ).length;

          const shoppingList = shoppingListDoc.exists
            ? shoppingListDoc.data().items
            : [];
          const itemsToBuy = shoppingList.length;

          setTodaysSummary({ caloriesConsumed, mealsPlanned, itemsToBuy });
        }
      }
    } catch (error) {
      console.error("Error loading today's summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = () => {
    navigation.navigate("Profile");
  };

  const renderNextMeal = () => {
    if (!nextMeal.meal || !nextMeal.meal.name) {
      return (
        <Card
          style={styles.mealCard}
          onPress={() => navigation.navigate("Meal Plan")}
        >
          <Card.Content style={styles.mealCardContent}>
            <View style={styles.mealIconContainer}>
              <Icon name="food-outline" size={24} color="#6200ea" />
            </View>
            <View style={styles.mealTextContainer}>
              <View style={styles.mealHeaderContainer}>
                <Title style={styles.mealTitle}>{nextMeal.type}</Title>
                <Text style={styles.timeText}>Next Meal</Text>
              </View>
              <Paragraph style={styles.mealEmptyText}>
                Not planned yet
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => navigation.navigate("Meal Plan")}
                style={styles.addMealButton}
                labelStyle={styles.buttonLabel}
              >
                Plan Meal
              </Button>
            </View>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card
        style={styles.mealCard}
        onPress={() => navigation.navigate("Meal Plan")}
      >
        <Card.Content style={styles.mealCardContent}>
          {nextMeal.meal.image ? (
            <Image
              source={{ uri: nextMeal.meal.image }}
              style={styles.mealImage}
            />
          ) : (
            <View style={[styles.mealImage, styles.mealImagePlaceholder]}>
              <Icon name="food" size={24} color="#6200ea" />
            </View>
          )}
          <View style={styles.mealTextContainer}>
            <View style={styles.mealHeaderContainer}>
              <Title style={styles.mealTitle}>{nextMeal.type}</Title>
              <Text style={styles.timeText}>Next Meal</Text>
            </View>
            <Paragraph style={styles.mealName}>{nextMeal.meal.name}</Paragraph>
            <View style={styles.nutritionContainer}>
              <Text style={styles.nutritionText}>
                {nextMeal.meal.calories} cal
              </Text>
              <Text style={styles.nutritionDot}>•</Text>
              <Text style={styles.nutritionText}>
                P: {nextMeal.meal.protein}g
              </Text>
              <Text style={styles.nutritionDot}>•</Text>
              <Text style={styles.nutritionText}>
                C: {nextMeal.meal.carbs}g
              </Text>
              <Text style={styles.nutritionDot}>•</Text>
              <Text style={styles.nutritionText}>F: {nextMeal.meal.fat}g</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Avatar.Image
            size={80}
            source={
              profilePicture
                ? { uri: profilePicture }
                : require("../assets/default-avatar.jpg")
            }
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.welcomeText}>Tervetuloa!</Text>
            <Title style={styles.title}>{userName}!</Title>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="fire" size={24} color="#6200ea" />
            <Text style={styles.statNumber}>
              {todaysSummary.caloriesConsumed}
            </Text>
            <Text style={styles.statLabel}>Calories</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="food-variant" size={24} color="#6200ea" />
            <Text style={styles.statNumber}>{todaysSummary.mealsPlanned}</Text>
            <Text style={styles.statLabel}>Meals</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="cart" size={24} color="#6200ea" />
            <Text style={styles.statNumber}>{todaysSummary.itemsToBuy}</Text>
            <Text style={styles.statLabel}>To Buy</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Title style={styles.cardTitle}>Health Profile</Title>
            <Button
              mode="contained"
              onPress={handleUpdateProfile}
              style={styles.updateButton}
              labelStyle={styles.buttonLabel}
            >
              Update
            </Button>
          </View>
          <View style={styles.preferencesContainer}>
            {userPreferences.allergies.length > 0 && (
              <View style={styles.preferenceItem}>
                <Icon name="alert-circle" size={20} color="#6200ea" />
                <Text style={styles.preferenceText}>
                  Allergies: {userPreferences.allergies.join(", ")}
                </Text>
              </View>
            )}
            {userPreferences.dietaryPreferences.length > 0 && (
              <View style={styles.preferenceItem}>
                <Icon name="food-apple" size={20} color="#6200ea" />
                <Text style={styles.preferenceText}>
                  Diet: {userPreferences.dietaryPreferences.join(", ")}
                </Text>
              </View>
            )}
            <View style={styles.preferenceItem}>
              <Icon name="target" size={20} color="#6200ea" />
              <Text style={styles.preferenceText}>
                Target: {userPreferences.calorieGoal} calories/day
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.mealsCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.cardTitle}>Next Meal</Title>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("Meal Plan")}
              style={styles.viewAllButton}
              labelStyle={styles.buttonLabel}
            >
              View All
            </Button>
          </View>
          {renderNextMeal()}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("Shopping List")}
        style={styles.shoppingButton}
        labelStyle={styles.buttonLabel}
        icon="cart"
      >
        View Shopping List ({todaysSummary.itemsToBuy} items)
      </Button>
    </ScrollView>
  );
};

export default HomeScreen;
