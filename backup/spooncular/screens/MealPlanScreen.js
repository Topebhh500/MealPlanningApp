import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Title, Card, Paragraph, Button, Modal, Portal, List, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchRecipes, getRecipeInformation } from '../api/spoonacular';
import { auth, firestore } from '../api/firebase';

const MealPlanScreen = () => {
  const [mealPlan, setMealPlan] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [isIngredientsModalVisible, setIsIngredientsModalVisible] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [stock, setStock] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    diet: '',
    intolerances: [],
  });

  useEffect(() => {
    loadMealPlan();
    loadShoppingList();
    loadStock();
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection('users').doc(user.uid).get();
        if (doc.exists) {
          const userData = doc.data();
          setUserPreferences({
            diet: userData.dietaryPreferences[0] || '',
            intolerances: userData.allergies || [],
          });
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const loadMealPlan = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection('mealPlans').doc(user.uid).get();
        if (doc.exists) {
          const storedMealPlan = doc.data();
          setMealPlan(storedMealPlan);
          setSelectedDate(getFormattedDate(new Date()));
        } else {
          await generateMealPlan();
        }
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
    }
  };

  const loadShoppingList = async () => {
    try {
      const storedList = await AsyncStorage.getItem('shoppingList');
      if (storedList) {
        setShoppingList(JSON.parse(storedList));
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
    }
  };

  const loadStock = async () => {
    try {
      const storedStock = await AsyncStorage.getItem('stock');
      if (storedStock) {
        setStock(JSON.parse(storedStock));
      }
    } catch (error) {
      console.error('Error loading stock:', error);
    }
  };

  const generateMealPlan = async () => {
    const newMealPlan = {};
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dateString = getFormattedDate(currentDate);
      newMealPlan[dateString] = {
        breakfast: await getRandomMeal('breakfast'),
        lunch: await getRandomMeal('lunch'),
        dinner: await getRandomMeal('dinner'),
      };
    }
    setMealPlan(newMealPlan);
    setSelectedDate(getFormattedDate(today));
    await syncWithFirebase(newMealPlan);
  };

  const getRandomMeal = async (mealType) => {
    const queries = {
      breakfast: ['oatmeal', 'eggs', 'smoothie'],
      lunch: ['salad', 'sandwich', 'soup'],
      dinner: ['chicken', 'fish', 'vegetarian'],
    };
    const randomQuery = queries[mealType][Math.floor(Math.random() * queries[mealType].length)];
    const recipes = await searchRecipes(randomQuery, mealType, userPreferences.diet, userPreferences.intolerances.join(','));
    const selectedRecipe = recipes[Math.floor(Math.random() * recipes.length)];
    const fullRecipe = await getRecipeInformation(selectedRecipe.id);
    
    return {
      id: fullRecipe.id,
      name: fullRecipe.title,
      calories: Math.round(fullRecipe.nutrition.nutrients.find(n => n.name === "Calories").amount),
      protein: Math.round(fullRecipe.nutrition.nutrients.find(n => n.name === "Protein").amount),
      carbs: Math.round(fullRecipe.nutrition.nutrients.find(n => n.name === "Carbohydrates").amount),
      fat: Math.round(fullRecipe.nutrition.nutrients.find(n => n.name === "Fat").amount),
      image: fullRecipe.image,
      ingredients: fullRecipe.extendedIngredients.map(ing => ing.original),
    };
  };

  const syncWithFirebase = async (data) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await firestore.collection('mealPlans').doc(user.uid).set(data);
      }
    } catch (error) {
      console.error('Error syncing meal plan with Firebase:', error);
    }
  };

  const getFormattedDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = dayNames[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    return `${day} ${dayOfMonth}/${month}`;
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

  const viewIngredients = (meal) => {
    setSelectedIngredients(meal.ingredients);
    setIsIngredientsModalVisible(true);
  };

  const addToShoppingList = async (ingredient) => {
    if (!shoppingList.some(item => item.name === ingredient) && !stock.some(item => item.name === ingredient)) {
      const updatedList = [...shoppingList, { name: ingredient, checked: false }];
      setShoppingList(updatedList);
      await AsyncStorage.setItem('shoppingList', JSON.stringify(updatedList));
    }
  };

  const removeFromShoppingList = async (ingredient) => {
    const updatedList = shoppingList.filter(item => item.name !== ingredient);
    setShoppingList(updatedList);
    await AsyncStorage.setItem('shoppingList', JSON.stringify(updatedList));
  };

  const renderIngredientItem = (ingredient) => {
    const inShoppingList = shoppingList.some(item => item.name === ingredient);
    const inStock = stock.some(item => item.name === ingredient);

    return (
      <List.Item
        key={ingredient}
        title={ingredient}
        right={() => (
          !inShoppingList && !inStock ? (
            <IconButton 
              style={styles.addIconPlus}
              icon="cart-plus"
              onPress={() => addToShoppingList(ingredient)}
              accessibilityLabel="Add to Shopping List"
              size={20}
              color="#ABECB9"
            />
          ) : (
            <IconButton
              style={styles.addIconMinus}
              icon="cart-remove"
              onPress={() => removeFromShoppingList(ingredient)}
              accessibilityLabel="Remove from Shopping List"
              size={20}
              color="#EDBBBB"
            />
          )
        )}
        style={styles.listItem}
      />
    );
  };

  const renderMealCard = (meal, mealType) => {
    if (!meal || !meal.ingredients) {
      return null;
    }

    return (
      <Card style={styles.mealCard}>
        <Card.Content>
          <Title>{mealType}</Title>
          {meal.image ? (
            <Image 
              source={{ uri: meal.image }} 
              style={styles.mealImage} 
            />
          ) : (
            <Text>No image available</Text>
          )}
          <Text>{meal.name}</Text>
          <Text>{meal.calories} calories</Text>
          <Text>Protein: {meal.protein}g 
          Carbs: {meal.carbs}g 
          Fat: {meal.fat}g</Text>
        </Card.Content>
        <Card.Actions>
          <IconButton
            icon="eye"
            onPress={() => viewIngredients(meal)}
            accessibilityLabel="View Ingredients"
          />
        </Card.Actions>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Meal Plan</Title>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysContainer}>
        {getDates().map((date) => (
          <TouchableOpacity
            key={date}
            style={[styles.dayButton, date === selectedDate && styles.selectedDay]}
            onPress={() => setSelectedDate(date)}
          >
            <Paragraph>{getDisplayDate(date)}</Paragraph>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {mealPlan[selectedDate] && (
        <View>
          {renderMealCard(mealPlan[selectedDate].breakfast, 'Breakfast')}
          {renderMealCard(mealPlan[selectedDate].lunch, 'Lunch')}
          {renderMealCard(mealPlan[selectedDate].dinner, 'Dinner')}
        </View>
      )}
      <Button mode="contained" onPress={generateMealPlan} style={styles.generateButton}>
        Generate New Meal Plan
      </Button>
      <Portal>
        <Modal visible={isIngredientsModalVisible} onDismiss={() => setIsIngredientsModalVisible(false)}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title>Ingredients</Title>
              <ScrollView>
                {selectedIngredients.map((ingredient) => renderIngredientItem(ingredient))}
              </ScrollView>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setIsIngredientsModalVisible(false)}>Close</Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
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
  daysContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dayButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedDay: {
    backgroundColor: '#6200ee',
  },
  mealCard: {
    marginBottom: 15,
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  generateButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  modalCard: {
    width: '90%',
    marginVertical: '10%',
    alignSelf: 'center',
  },
  listItem: {
    marginVertical: 0,
  },
  addIconPlus: {
    margin: 0,
    padding: 0,
    backgroundColor: 'green',
  },
  addIconMinus: {
    margin: 0,
    padding: 0,
    backgroundColor: 'red',
    color: 'white',
  },
});

export default MealPlanScreen;