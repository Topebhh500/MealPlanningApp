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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#6200ea",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    marginLeft: 15,
  },
  welcomeText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  avatar: {
    borderWidth: 3,
    borderColor: "#fff",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    marginTop: -30,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    elevation: 4,
    borderRadius: 15,
  },
  statContent: {
    alignItems: "center",
    padding: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200ea",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  profileCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  preferencesContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 15,
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  preferenceText: {
    marginLeft: 10,
    color: "#333",
    flex: 1,
  },
  mealsCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200ea",
  },
  mealCard: {
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: "#fff",
  },
  mealCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  mealImagePlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  mealIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  mealTextContainer: {
    flex: 1,
  },
  mealHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  timeText: {
    fontSize: 12,
    color: "#6200ea",
    fontWeight: "bold",
  },
  mealName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  nutritionContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  nutritionText: {
    fontSize: 12,
    color: "#666",
  },
  nutritionDot: {
    marginHorizontal: 5,
    color: "#6200ea",
  },
  updateButton: {
    backgroundColor: "#6200ea",
  },
  viewAllButton: {
    backgroundColor: "#6200ea",
  },
  shoppingButton: {
    margin: 20,
    marginTop: 0,
    marginBottom: 30,
    backgroundColor: "#6200ea",
    borderRadius: 10,
  },
  buttonLabel: {
    fontSize: 14,
    color: "#fff",
  },
  mealEmptyText: {
    color: "#999",
    fontStyle: "italic",
    marginBottom: 8,
  },
  addMealButton: {
    backgroundColor: "#6200ea",
    marginTop: 8,
    borderRadius: 8,
  },
});

export default HomeScreen;
