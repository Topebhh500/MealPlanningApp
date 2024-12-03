import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import {
  Title,
  Card,
  Button,
  Modal,
  Portal,
  List,
  IconButton,
  Checkbox,
  TextInput,
  RadioButton,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { searchRecipes } from "../api/edamam";
import { auth, firestore } from "../api/firebase";
import styles from "../styles/MealPlanStyle";

const getMealQueries = (preferences) => {
  const queryBank = {
    breakfast: {
      default: [
        "breakfast",
        "morning meal",
        "breakfast bowl",
        "breakfast sandwich",
        "breakfast recipes",
        "eggs",
        "pancakes",
        "waffles",
        "bacon eggs",
        "breakfast burrito",
      ],
      vegan: [
        "vegan breakfast",
        "plant based breakfast",
        "breakfast smoothie",
        "oatmeal breakfast",
        "avocado toast",
        "vegan pancakes",
        "chia pudding",
        "granola bowl",
        "fruit breakfast",
        "breakfast quinoa",
      ],
      vegetarian: [
        "vegetarian breakfast",
        "egg breakfast",
        "yogurt breakfast",
        "cheese breakfast",
        "vegetarian omelette",
        "breakfast muffins",
        "french toast",
        "breakfast parfait",
        "cottage cheese breakfast",
        "vegetable frittata",
      ],
      "low-carb": [
        "keto breakfast",
        "low carb breakfast",
        "protein breakfast",
        "egg bowl",
        "breakfast protein",
        "keto eggs",
        "low carb omelette",
        "breakfast salad",
        "keto pancakes",
        "breakfast without bread",
      ],
      "high-protein": [
        "protein breakfast",
        "high protein morning",
        "protein bowl",
        "protein oatmeal",
        "protein pancakes",
        "egg white omelette",
        "protein smoothie bowl",
        "greek yogurt breakfast",
        "protein french toast",
        "cottage cheese protein bowl",
      ],
    },
    lunch: {
      default: [
        "lunch",
        "sandwich",
        "salad",
        "soup",
        "wrap",
        "bowl",
        "pasta lunch",
        "rice bowl",
        "noodles",
        "lunch plate",
      ],
      vegan: [
        "vegan lunch",
        "buddha bowl",
        "vegan salad",
        "plant based lunch",
        "quinoa bowl",
        "vegan wrap",
        "chickpea lunch",
        "lentil bowl",
        "vegan soup",
        "vegetable stir fry",
      ],
      vegetarian: [
        "vegetarian lunch",
        "veggie sandwich",
        "vegetable soup",
        "mediterranean bowl",
        "vegetarian wrap",
        "falafel plate",
        "vegetable curry",
        "bean bowl",
        "tofu lunch",
        "vegetarian pasta",
      ],
      "low-carb": [
        "keto lunch",
        "low carb meal",
        "protein salad",
        "lettuce wrap",
        "zucchini noodles",
        "cauliflower rice bowl",
        "keto bowl",
        "protein plate",
        "low carb soup",
        "vegetable stir fry no rice",
      ],
      "high-protein": [
        "high protein lunch",
        "chicken salad",
        "tuna bowl",
        "protein plate",
        "quinoa protein bowl",
        "turkey wrap",
        "protein pasta",
        "salmon lunch",
        "lean protein bowl",
        "egg lunch",
      ],
    },
    dinner: {
      default: [
        "dinner",
        "chicken dinner",
        "fish dinner",
        "beef dinner",
        "pork dinner",
        "pasta dinner",
        "rice dinner",
        "stir fry",
        "roasted dinner",
        "grilled dinner",
      ],
      vegan: [
        "vegan dinner",
        "plant based dinner",
        "vegan curry",
        "tofu dinner",
        "tempeh dinner",
        "vegan pasta",
        "vegetable dinner",
        "vegan stir fry",
        "vegan bowl",
        "lentil dinner",
      ],
      vegetarian: [
        "vegetarian dinner",
        "veggie pasta",
        "vegetable curry",
        "vegetarian stir fry",
        "bean dinner",
        "vegetable lasagna",
        "eggplant dinner",
        "mushroom dinner",
        "quinoa dinner",
        "vegetarian casserole",
      ],
      "low-carb": [
        "keto dinner",
        "low carb dinner",
        "protein dinner",
        "zucchini pasta",
        "cauliflower rice dinner",
        "keto bowl",
        "low carb stir fry",
        "protein plate dinner",
        "vegetable dinner no carb",
        "grilled protein dinner",
      ],
      "high-protein": [
        "high protein dinner",
        "lean protein dinner",
        "chicken breast dinner",
        "fish protein dinner",
        "protein bowl dinner",
        "lean meat dinner",
        "protein rich dinner",
        "turkey dinner",
        "seafood protein dinner",
        "protein pasta dinner",
      ],
    },
  };

  // Determine the primary preference
  let primaryPreference = "default";
  if (preferences.includes("Vegan")) {
    primaryPreference = "vegan";
  } else if (preferences.includes("Vegetarian")) {
    primaryPreference = "vegetarian";
  } else if (preferences.includes("Low-Carb")) {
    primaryPreference = "low-carb";
  } else if (preferences.includes("High-Protein")) {
    primaryPreference = "high-protein";
  }

  // Return meal-specific queries based on preference
  return {
    breakfast:
      queryBank.breakfast[primaryPreference] || queryBank.breakfast.default,
    lunch: queryBank.lunch[primaryPreference] || queryBank.lunch.default,
    dinner: queryBank.dinner[primaryPreference] || queryBank.dinner.default,
  };
};

const MealPlanScreen = () => {
  // Core state
  const [mealPlan, setMealPlan] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [userPreferences, setUserPreferences] = useState({
    calorieGoal: 0,
    allergies: [],
    dietaryPreferences: [],
  });

  // Modal states
  const [isIngredientsModalVisible, setIsIngredientsModalVisible] =
    useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPasteModalVisible, setIsPasteModalVisible] = useState(false);

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Meal configuration states
  const [mealTimes, setMealTimes] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
  });
  const [startDate, setStartDate] = useState(new Date());
  const [numberOfDays, setNumberOfDays] = useState(7);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Shopping list and ingredients states
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [stock, setStock] = useState([]);

  // Copy/Paste meal states
  const [copiedMeal, setCopiedMeal] = useState(null);
  const [copiedMealType, setCopiedMealType] = useState(null);
  const [selectedPasteDate, setSelectedPasteDate] = useState(new Date());
  const [selectedPasteMealTime, setSelectedPasteMealTime] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadUserPreferences(),
        loadMealPlan(),
        loadShoppingList(),
        loadStock(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      Alert.alert("Error", "Failed to load some data. Please try again.");
    }
  };

  const loadUserPreferences = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection("users").doc(user.uid).get();
        if (doc.exists) {
          const userData = doc.data();
          setUserPreferences({
            calorieGoal: userData.calorieGoal || 2000,
            allergies: userData.allergies || [],
            dietaryPreferences: userData.dietaryPreferences || [],
          });
        }
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
      throw error;
    }
  };

  const loadMealPlan = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection("mealPlans").doc(user.uid).get();
        if (doc.exists) {
          const storedMealPlan = doc.data();
          setMealPlan(storedMealPlan);
          setSelectedDate(getFormattedDate(new Date()));
        }
      }
    } catch (error) {
      console.error("Error loading meal plan:", error);
      throw error;
    }
  };

  const loadShoppingList = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const snapshot = await firestore
          .collection("shoppingLists")
          .doc(user.uid)
          .get();
        if (snapshot.exists) {
          setShoppingList(snapshot.data().items || []);
        }
      }
    } catch (error) {
      console.error("Error loading shopping list:", error);
      throw error;
    }
  };

  const loadStock = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const snapshot = await firestore
          .collection("stocks")
          .doc(user.uid)
          .get();
        if (snapshot.exists) {
          setStock(snapshot.data().items || []);
        }
      }
    } catch (error) {
      console.error("Error loading stock:", error);
      throw error;
    }
  };

  const getRandomMeal = async (mealType) => {
    try {
      const mealCalorieDistribution = {
        breakfast: 0.3,
        lunch: 0.35,
        dinner: 0.35,
      };

      const targetCalories = Math.round(
        userPreferences.calorieGoal * mealCalorieDistribution[mealType]
      );

      // Start with strict parameters
      let queryParams = {
        mealType: mealType.toLowerCase(),
        calories: targetCalories,
        health: [],
        excluded: [],
      };

      // Add dietary preferences
      if (userPreferences.dietaryPreferences) {
        if (userPreferences.dietaryPreferences.includes("Vegetarian")) {
          queryParams.health.push("vegetarian");
        }
        if (userPreferences.dietaryPreferences.includes("Vegan")) {
          queryParams.health.push("vegan");
        }
        if (userPreferences.dietaryPreferences.includes("Low-Carb")) {
          queryParams.diet = "low-carb";
        }
        if (userPreferences.dietaryPreferences.includes("High-Protein")) {
          queryParams.diet = "high-protein";
        }
      }

      // Add allergy restrictions
      if (userPreferences.allergies) {
        userPreferences.allergies.forEach((allergy) => {
          queryParams.excluded.push(allergy.toLowerCase());
        });
      }

      const queries = getMealQueries(userPreferences.dietaryPreferences || []);
      const mealOptions = queries[mealType];
      let recipes = [];
      let attempts = 0;
      const maxAttempts = 3;

      // Try with different levels of restriction relaxation
      while (recipes.length === 0 && attempts < maxAttempts) {
        const randomQuery =
          mealOptions[Math.floor(Math.random() * mealOptions.length)];

        try {
          // Modify parameters based on attempt number
          switch (attempts) {
            case 0:
              // First attempt: Try with all restrictions
              recipes = await searchRecipes(randomQuery, queryParams);
              break;

            case 1:
              // Second attempt: Relax calorie restrictions
              const relaxedParams = {
                ...queryParams,
                calories: targetCalories * 1.2, // Allow 20% more calories
              };
              recipes = await searchRecipes(randomQuery, relaxedParams);
              break;

            case 2:
              // Third attempt: Use only essential restrictions (allergies and vegan/vegetarian)
              const essentialParams = {
                mealType: mealType.toLowerCase(),
                excluded: queryParams.excluded,
                health: queryParams.health.filter(
                  (h) => h === "vegetarian" || h === "vegan"
                ),
              };
              recipes = await searchRecipes(randomQuery, essentialParams);
              break;
          }

          attempts++;
        } catch (error) {
          console.error(`Attempt ${attempts} failed:`, error);
          attempts++;
        }
      }

      if (!recipes || recipes.length === 0) {
        throw new Error(
          `Unable to find ${mealType} recipes matching your preferences. Try adjusting your dietary restrictions.`
        );
      }

      const selectedRecipe =
        recipes[Math.floor(Math.random() * recipes.length)].recipe;

      return {
        name: selectedRecipe.label || "Untitled Recipe",
        calories: Math.round(selectedRecipe.calories || 0),
        protein: Math.round(
          selectedRecipe.totalNutrients?.PROCNT?.quantity || 0
        ),
        carbs: Math.round(selectedRecipe.totalNutrients?.CHOCDF?.quantity || 0),
        fat: Math.round(selectedRecipe.totalNutrients?.FAT?.quantity || 0),
        image: selectedRecipe.image || null,
        ingredients: selectedRecipe.ingredientLines || [],
        url: selectedRecipe.url || "",
        source: selectedRecipe.source || "",
        totalTime: selectedRecipe.totalTime || 0,
      };
    } catch (error) {
      console.error(`Error getting ${mealType} recipe:`, error);
      throw new Error(
        `Failed to get ${mealType} recipe. Please check your dietary preferences and try again.`
      );
    }
  };

  const handleGenerateMealPlan = async () => {
    if (!userPreferences.calorieGoal) {
      Alert.alert(
        "Missing Information",
        "Please set your daily calorie goal in your profile before generating a meal plan."
      );
      return;
    }

    setIsGenerating(true);
    const progressInterval = simulateProgress();

    try {
      const newMealPlan = { ...mealPlan };
      let errorOccurred = false;

      for (let i = 0; i < numberOfDays && !errorOccurred; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = getFormattedDate(currentDate);

        if (!newMealPlan[dateString]) {
          newMealPlan[dateString] = {};
        }

        try {
          if (mealTimes.breakfast) {
            newMealPlan[dateString].breakfast = await getRandomMeal(
              "breakfast"
            );
          }
          if (mealTimes.lunch) {
            newMealPlan[dateString].lunch = await getRandomMeal("lunch");
          }
          if (mealTimes.dinner) {
            newMealPlan[dateString].dinner = await getRandomMeal("dinner");
          }
        } catch (error) {
          errorOccurred = true;
          Alert.alert(
            "Generation Error",
            `Error generating meals for ${getDisplayDate(dateString)}: ${
              error.message
            }`
          );
        }
      }

      if (!errorOccurred) {
        setMealPlan(newMealPlan);
        await syncWithFirebase(newMealPlan);
        Alert.alert("Success", "Meal plan generated successfully!");
      }
    } catch (error) {
      console.error("Error generating meal plan:", error);
      Alert.alert("Error", error.message);
    } finally {
      clearInterval(progressInterval);
      setLoadingProgress(0);
      setIsGenerating(false);
      setIsModalVisible(false);
    }
  };

  // Utility Functions
  const simulateProgress = () => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 99) {
          clearInterval(interval);
          return 99;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 300);
    return interval;
  };

  const syncWithFirebase = async (data) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await firestore.collection("mealPlans").doc(user.uid).set(data);
      }
    } catch (error) {
      console.error("Error syncing with Firebase:", error);
      throw new Error("Failed to save meal plan");
    }
  };

  // Date Handling Functions
  const getFormattedDate = (date) => {
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().split("T")[0];
  };

  const getDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${dayNames[date.getDay()]} ${date.getDate()}/${
      date.getMonth() + 1
    }`;
  };

  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      dates.push(getFormattedDate(currentDate));
    }
    return dates;
  };

  // Shopping List Functions
  const addToShoppingList = async (ingredient) => {
    try {
      const user = auth.currentUser;
      if (user) {
        if (shoppingList.some((item) => item.name === ingredient)) {
          Alert.alert(
            "Already in List",
            "This item is already in your shopping list"
          );
          return;
        }

        const newList = [...shoppingList, { name: ingredient, checked: false }];
        await firestore
          .collection("shoppingLists")
          .doc(user.uid)
          .set({ items: newList });
        setShoppingList(newList);
        Alert.alert("Success", "Item added to shopping list");
      }
    } catch (error) {
      console.error("Error adding to shopping list:", error);
      Alert.alert("Error", "Failed to add item to shopping list");
    }
  };

  const removeFromShoppingList = async (ingredient) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const newList = shoppingList.filter((item) => item.name !== ingredient);
        await firestore
          .collection("shoppingLists")
          .doc(user.uid)
          .set({ items: newList });
        setShoppingList(newList);
      }
    } catch (error) {
      console.error("Error removing from shopping list:", error);
      Alert.alert("Error", "Failed to remove item from shopping list");
    }
  };

  // Meal Copy/Paste Functions
  const handleCopyMeal = (meal, mealType) => {
    setCopiedMeal(meal);
    setCopiedMealType(mealType);
    setIsPasteModalVisible(true);
  };

  const handlePasteMeal = () => {
    if (!copiedMeal || !selectedPasteMealTime) {
      Alert.alert("Error", "Please select a meal time to paste the meal");
      return;
    }

    const updatedMealPlan = { ...mealPlan };
    const dateKey = getFormattedDate(selectedPasteDate);

    if (!updatedMealPlan[dateKey]) {
      updatedMealPlan[dateKey] = {};
    }

    updatedMealPlan[dateKey][selectedPasteMealTime] = copiedMeal;

    setMealPlan(updatedMealPlan);
    syncWithFirebase(updatedMealPlan)
      .then(() => {
        Alert.alert(
          "Success",
          `Meal copied to ${selectedPasteMealTime} on ${getDisplayDate(
            dateKey
          )}`
        );
        setIsPasteModalVisible(false);
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to save copied meal");
      });
  };

  // Render Functions
  const renderMealCard = (meal, mealType) => {
    if (!meal || !meal.ingredients) return null;

    const totalDailyCalories = userPreferences.calorieGoal;
    const isWithinCalorieRange = meal.calories <= totalDailyCalories * 0.4; // 40% of daily calories as max per meal

    return (
      <Card
        style={[styles.mealCard, !isWithinCalorieRange && styles.warningCard]}
      >
        <Card.Content>
          <View style={styles.mealHeaderContainer}>
            <Title style={styles.mealTitle}>{mealType}</Title>
            <View style={styles.calorieContainer}>
              <Text
                style={[
                  styles.calories,
                  !isWithinCalorieRange && styles.warningText,
                ]}
              >
                {meal.calories} calories
              </Text>
              {!isWithinCalorieRange && (
                <IconButton
                  icon="alert"
                  size={20}
                  color="#ff9800"
                  onPress={() =>
                    Alert.alert(
                      "High Calorie Meal",
                      "This meal exceeds 40% of your daily calorie goal"
                    )
                  }
                />
              )}
            </View>
          </View>

          {meal.image ? (
            <Image source={{ uri: meal.image }} style={styles.mealImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text>No image available</Text>
            </View>
          )}

          <View style={styles.mealDetails}>
            <Text style={styles.mealName}>{meal.name}</Text>
            {meal.totalTime > 0 && (
              <Text style={styles.cookingTime}>
                Cooking time: {meal.totalTime} minutes
              </Text>
            )}

            <View style={styles.nutritionContainer}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Protein</Text>
                <Text style={styles.nutritionValue}>{meal.protein}g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Carbs</Text>
                <Text style={styles.nutritionValue}>{meal.carbs}g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Fat</Text>
                <Text style={styles.nutritionValue}>{meal.fat}g</Text>
              </View>
            </View>
          </View>
        </Card.Content>

        <Card.Actions>
          <Button
            icon="content-copy"
            mode="outlined"
            onPress={() => handleCopyMeal(meal, mealType)}
          >
            Copy
          </Button>
          <Button
            icon="format-list-bulleted"
            mode="contained"
            onPress={() => {
              setSelectedIngredients(meal.ingredients);
              setIsIngredientsModalVisible(true);
            }}
            style={styles.viewIngredientsButton}
          >
            View Ingredients
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const renderIngredientItem = (ingredient) => {
    const inShoppingList = shoppingList.some(
      (item) => item.name === ingredient
    );
    const inStock = stock.some((item) => item.name === ingredient);

    return (
      <List.Item
        key={ingredient}
        title={ingredient}
        titleStyle={styles.ingredientTitle}
        right={() => (
          <IconButton
            icon={inShoppingList || inStock ? "cart-remove" : "cart-plus"}
            size={24}
            color="#6200ea"
            onPress={() =>
              inShoppingList || inStock
                ? removeFromShoppingList(ingredient)
                : addToShoppingList(ingredient)
            }
          />
        )}
        left={() => (
          <List.Icon
            color="#6200ea"
            icon={inStock ? "check-circle" : "circle-outline"}
          />
        )}
      />
    );
  };

  // Main Render
  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Meal Plan</Title>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysContainer}
      >
        {getDates().map((date) => (
          <TouchableOpacity
            key={date}
            style={[
              styles.dayButton,
              date === selectedDate && styles.selectedDay,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text
              style={[
                styles.dayText,
                date === selectedDate && styles.selectedDayText,
              ]}
            >
              {getDisplayDate(date)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {mealPlan[selectedDate] ? (
        <View>
          {renderMealCard(mealPlan[selectedDate].breakfast, "Breakfast")}
          {renderMealCard(mealPlan[selectedDate].lunch, "Lunch")}
          {renderMealCard(mealPlan[selectedDate].dinner, "Dinner")}
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>
              No meals planned for this day. Generate a meal plan or add meals
              manually.
            </Text>
          </Card.Content>
        </Card>
      )}

      <Button
        mode="contained"
        onPress={() => setIsModalVisible(true)}
        style={styles.generateButton}
        disabled={isGenerating}
      >
        Generate Meal Plan
      </Button>

      {/* Modals */}
      <Portal>
        {/* Generate Meal Plan Modal */}
        <Modal
          visible={isModalVisible}
          onDismiss={() => !isGenerating && setIsModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title style={styles.modalTitle}>Generate Meal Plan</Title>

              {/* Start Date Section */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Start Date</Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                  disabled={isGenerating}
                >
                  {getFormattedDate(startDate)}
                </Button>
                {showDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) {
                        const correctedDate = new Date(
                          date.getTime() - date.getTimezoneOffset() * 60000
                        );
                        setStartDate(correctedDate);
                      }
                    }}
                  />
                )}
              </View>

              {/* Number of Days Section */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Number of Days</Text>
                <View style={styles.daysInputContainer}>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      setNumberOfDays((prev) => Math.max(1, prev - 1))
                    }
                    disabled={isGenerating}
                  >
                    -
                  </Button>
                  <TextInput
                    mode="outlined"
                    keyboardType="numeric"
                    value={numberOfDays.toString()}
                    onChangeText={(value) =>
                      setNumberOfDays(
                        Math.max(1, Math.min(7, parseInt(value, 10) || 1))
                      )
                    }
                    style={styles.daysInput}
                    editable={!isGenerating}
                  />
                  <Button
                    mode="outlined"
                    onPress={() =>
                      setNumberOfDays((prev) => Math.min(7, prev + 1))
                    }
                    disabled={isGenerating}
                  >
                    +
                  </Button>
                </View>
              </View>

              {/* Meal Times Section */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Meal Periods</Text>
                <View style={styles.checkboxContainer}>
                  <Checkbox.Item
                    label="Breakfast"
                    status={mealTimes.breakfast ? "checked" : "unchecked"}
                    onPress={() =>
                      !isGenerating &&
                      setMealTimes({
                        ...mealTimes,
                        breakfast: !mealTimes.breakfast,
                      })
                    }
                    disabled={isGenerating}
                  />
                  <Checkbox.Item
                    label="Lunch"
                    status={mealTimes.lunch ? "checked" : "unchecked"}
                    onPress={() =>
                      !isGenerating &&
                      setMealTimes({ ...mealTimes, lunch: !mealTimes.lunch })
                    }
                    disabled={isGenerating}
                  />
                  <Checkbox.Item
                    label="Dinner"
                    status={mealTimes.dinner ? "checked" : "unchecked"}
                    onPress={() =>
                      !isGenerating &&
                      setMealTimes({ ...mealTimes, dinner: !mealTimes.dinner })
                    }
                    disabled={isGenerating}
                  />
                </View>
              </View>

              {/* Generation Progress */}
              {isGenerating && (
                <View style={styles.progressContainer}>
                  <ActivityIndicator size={24} color="#6200ea" />
                  <Text style={styles.progressText}>
                    Generating meal plan... {loadingProgress}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${loadingProgress}%` },
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalButtonContainer}>
                <Button
                  mode="contained"
                  onPress={handleGenerateMealPlan}
                  style={[styles.modalButton, styles.modalSubmitButton]}
                  disabled={
                    isGenerating || !Object.values(mealTimes).some(Boolean)
                  }
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setIsModalVisible(false)}
                  style={[styles.modalButton, styles.modalCancelButton]}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>

        {/* Ingredients Modal */}
        <Modal
          visible={isIngredientsModalVisible}
          onDismiss={() => setIsIngredientsModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>Ingredients</Title>
              <ScrollView style={styles.ingredientsList}>
                {selectedIngredients.map((ingredient, index) => (
                  <List.Item
                    key={index}
                    title={ingredient}
                    left={(props) => <List.Icon {...props} icon="food" />}
                    right={() => (
                      <View style={styles.ingredientActions}>
                        {shoppingList.some(
                          (item) => item.name === ingredient
                        ) ? (
                          <IconButton
                            icon="cart-remove"
                            size={24}
                            onPress={() => removeFromShoppingList(ingredient)}
                          />
                        ) : (
                          <IconButton
                            icon="cart-plus"
                            size={24}
                            onPress={() => addToShoppingList(ingredient)}
                          />
                        )}
                      </View>
                    )}
                  />
                ))}
              </ScrollView>
              <Button
                mode="contained"
                onPress={() => setIsIngredientsModalVisible(false)}
                style={styles.closeButton}
              >
                Close
              </Button>
            </Card.Content>
          </Card>
        </Modal>
        {/* Copy/Paste Meal Modal */}
        <Modal
          visible={isPasteModalVisible}
          onDismiss={() => setIsPasteModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>Copy Meal</Title>

              <Text style={styles.modalSubtitle}>
                Select date and meal time to paste
              </Text>

              {/* Date Selection */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Select Date</Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                >
                  {getFormattedDate(selectedPasteDate)}
                </Button>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedPasteDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) {
                        setSelectedPasteDate(date);
                      }
                    }}
                  />
                )}
              </View>

              {/* Meal Time Selection */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Select Meal Time</Text>
                <RadioButton.Group
                  onValueChange={(value) => setSelectedPasteMealTime(value)}
                  value={selectedPasteMealTime}
                >
                  <RadioButton.Item label="Breakfast" value="breakfast" />
                  <RadioButton.Item label="Lunch" value="lunch" />
                  <RadioButton.Item label="Dinner" value="dinner" />
                </RadioButton.Group>
              </View>

              <View style={styles.modalButtonContainer}>
                <Button
                  mode="contained"
                  onPress={handlePasteMeal}
                  style={[styles.modalButton, styles.modalSubmitButton]}
                  disabled={!selectedPasteMealTime}
                >
                  Paste Meal
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setIsPasteModalVisible(false)}
                  style={[styles.modalButton, styles.modalCancelButton]}
                >
                  Cancel
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

export default MealPlanScreen;
