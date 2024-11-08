import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Title, Card, Paragraph, Button, Modal, Portal, List, IconButton, Checkbox, TextInput, RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { searchRecipes } from '../api/edamam';
import { auth, firestore } from '../api/firebase';

const MealPlanScreen = () => {
  const [mealPlan, setMealPlan] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [isIngredientsModalVisible, setIsIngredientsModalVisible] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [stock, setStock] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mealTimes, setMealTimes] = useState({ breakfast: true, lunch: true, dinner: true });
  const [startDate, setStartDate] = useState(new Date());
  const [numberOfDays, setNumberOfDays] = useState(7);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State for copying meals and managing paste functionality
  const [copiedMeal, setCopiedMeal] = useState(null);
  const [copiedMealType, setCopiedMealType] = useState(null);
  const [isPasteModalVisible, setIsPasteModalVisible] = useState(false); // Paste modal visibility
  const [selectedPasteDate, setSelectedPasteDate] = useState(new Date()); // Date for pasting
  const [selectedPasteMealTime, setSelectedPasteMealTime] = useState(''); // Meal time for pasting

  useEffect(() => {
    loadMealPlan();
    loadShoppingList();
    loadStock();
  }, []);

  const loadMealPlan = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const doc = await firestore.collection('mealPlans').doc(user.uid).get();
        if (doc.exists) {
          const storedMealPlan = doc.data();
          setMealPlan(storedMealPlan);
          setSelectedDate(getFormattedDate(new Date()));
        }
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
    }
  };

  const loadShoppingList = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const snapshot = await firestore.collection('shoppingLists').doc(user.uid).get();
        if (snapshot.exists) {
          setShoppingList(snapshot.data().items || []);
        }
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
    }
  };

  const loadStock = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const snapshot = await firestore.collection('stocks').doc(user.uid).get();
        if (snapshot.exists) {
          setStock(snapshot.data().items || []);
        }
      }
    } catch (error) {
      console.error('Error loading stock:', error);
    }
  };

  const getFormattedDate = (date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  };

  const getDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${dayNames[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
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

  const openGenerateMealPlanModal = () => setIsModalVisible(true);

  const handleGenerateMealPlan = async () => {
    const newMealPlan = { ...mealPlan };
    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateString = getFormattedDate(currentDate);

      if (!mealPlan[dateString]) {
        newMealPlan[dateString] = {};
      }

      if (mealTimes.breakfast) {
        newMealPlan[dateString].breakfast = await getRandomMeal('breakfast');
      }
      if (mealTimes.lunch) {
        newMealPlan[dateString].lunch = await getRandomMeal('lunch');
      }
      if (mealTimes.dinner) {
        newMealPlan[dateString].dinner = await getRandomMeal('dinner');
      }
    }

    setMealPlan(newMealPlan);
    await syncWithFirebase(newMealPlan);
    setIsModalVisible(false);
  };

  const getRandomMeal = async (mealType) => {
    const queries = {
      breakfast: ['oatmeal', 'eggs', 'smoothie'],
      lunch: ['salad', 'sandwich', 'soup'],
      dinner: ['chicken', 'fish', 'vegetarian'],
    };
    const randomQuery = queries[mealType][Math.floor(Math.random() * queries[mealType].length)];
    const recipes = await searchRecipes(randomQuery, mealType);
    const selectedRecipe = recipes[Math.floor(Math.random() * recipes.length)].recipe;
    return {
      name: selectedRecipe.label,
      calories: Math.round(selectedRecipe.calories),
      protein: Math.round(selectedRecipe.totalNutrients.PROCNT.quantity),
      carbs: Math.round(selectedRecipe.totalNutrients.CHOCDF.quantity),
      fat: Math.round(selectedRecipe.totalNutrients.FAT.quantity),
      image: selectedRecipe.image,
      ingredients: selectedRecipe.ingredientLines,
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

  const addToShoppingList = async (ingredient) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const newList = [...shoppingList, { name: ingredient, checked: false }];
        await firestore.collection('shoppingLists').doc(user.uid).set({ items: newList });
        setShoppingList(newList);
      }
    } catch (error) {
      console.error('Error adding to shopping list:', error);
    }
  };

  const removeFromShoppingList = async (ingredient) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const newList = shoppingList.filter(item => item.name !== ingredient);
        await firestore.collection('shoppingLists').doc(user.uid).set({ items: newList });
        setShoppingList(newList);
      }
    } catch (error) {
      console.error('Error removing from shopping list:', error);
    }
  };

  const viewIngredients = (meal) => {
    setSelectedIngredients(meal.ingredients);
    setIsIngredientsModalVisible(true);
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
              icon="cart-plus"
              onPress={() => addToShoppingList(ingredient)}
              size={20}
              color="#FFFFFF"
            />
          ) : (
            <IconButton
              icon="cart-remove"
              onPress={() => removeFromShoppingList(ingredient)}
              size={20}
              color="#FFFFFF"
            />
          )
        )}
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
          <View style={styles.mealHeaderContainer}>
            <Title style={styles.mealTitle}>{mealType}</Title>
            <Text style={styles.calories}>{meal.calories} calories</Text>
          </View>
          
          {meal.image ? (
            <Image 
              source={{ uri: meal.image }} 
              style={styles.mealImage} 
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text>No image available</Text>
            </View>
          )}
          
          <View style={styles.mealDetails}>
            <Text style={styles.mealName}>{meal.name}</Text>
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
          {/* Copy Button */}
          <Button 
            mode="outlined"
            onPress={() => handleCopyMeal(meal, mealType)}
          >
            Copy
          </Button>
          <Button 
            icon="eye" 
            mode="contained"
            onPress={() => viewIngredients(meal)}
            style={styles.viewIngredientsButton}
          >
            View Ingredients
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const handleCopyMeal = (meal, mealType) => {
    setCopiedMeal(meal);
    setCopiedMealType(mealType);
    setIsPasteModalVisible(true); // Show paste modal
  };

  const handlePasteMeal = () => {
    if (copiedMeal && selectedPasteMealTime) {
      const updatedMealPlan = { ...mealPlan };
      const dateKey = getFormattedDate(selectedPasteDate);

      if (!updatedMealPlan[dateKey]) {
        updatedMealPlan[dateKey] = {};
      }

      // Paste the copied meal into the selected meal time
      updatedMealPlan[dateKey][selectedPasteMealTime] = copiedMeal;

      setMealPlan(updatedMealPlan);
      syncWithFirebase(updatedMealPlan);
      alert(`Pasted into ${selectedPasteMealTime} on ${getDisplayDate(dateKey)}`);

      // Close the modal
      setIsPasteModalVisible(false);
    } else {
      alert('Please copy a meal and select a meal time.');
    }
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
            <Paragraph style={date === selectedDate ? styles.selectedDayText : null}>
              {getDisplayDate(date)}
            </Paragraph>
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

      <Button 
        mode="contained" 
        onPress={openGenerateMealPlanModal} 
        style={styles.mainGenerateButton}
      >
        Generate New Meal Plan
      </Button>

      <Portal>
        <Modal 
          visible={isModalVisible} 
          onDismiss={() => setIsModalVisible(false)} 
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title style={styles.modalTitle}>Meal Plan Options</Title>

              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Start Date</Text>
                <Button 
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)} 
                  style={styles.dateButton}
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
                        const correctedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                        setStartDate(correctedDate);
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Number of Days</Text>
                <View style={styles.daysInputContainer}>
                  <Button 
                    mode="outlined" 
                    onPress={() => setNumberOfDays(prev => Math.max(1, prev - 1))}
                  >
                    -
                  </Button>
                  <TextInput
                    mode="outlined"
                    keyboardType="numeric"
                    value={numberOfDays.toString()}
                    onChangeText={(value) => setNumberOfDays(Math.max(1, Math.min(7, parseInt(value, 10) || 1)))}
                    style={styles.daysInput}
                    editable={false} 
                  />
                  <Button 
                    mode="outlined" 
                    onPress={() => setNumberOfDays(prev => Math.min(7, prev + 1))}
                  >
                    +
                  </Button>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Meal Periods</Text>
                <View style={styles.checkboxContainer}>
                  <Checkbox.Item 
                    label="Breakfast" 
                    status={mealTimes.breakfast ? 'checked' : 'unchecked'} 
                    onPress={() => setMealTimes({ ...mealTimes, breakfast: !mealTimes.breakfast })}
                  />
                  <Checkbox.Item 
                    label="Lunch" 
                    status={mealTimes.lunch ? 'checked' : 'unchecked'} 
                    onPress={() => setMealTimes({ ...mealTimes, lunch: !mealTimes.lunch })}
                  />
                  <Checkbox.Item 
                    label="Dinner" 
                    status={mealTimes.dinner ? 'checked' : 'unchecked'} 
                    onPress={() => setMealTimes({ ...mealTimes, dinner: !mealTimes.dinner })}
                  />
                </View>
              </View>

              <View style={styles.modalButtonContainer}>
                <Button 
                  mode="contained" 
                  onPress={handleGenerateMealPlan} 
                  style={styles.modalGenerateButton}
                >
                  Generate
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => setIsModalVisible(false)} 
                >
                  Cancel
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>

        {/* Paste Meal Modal */}
        <Modal 
          visible={isPasteModalVisible} 
          onDismiss={() => setIsPasteModalVisible(false)} 
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title>Copy Single Meal</Title>

              {/* Date Picker */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Select Date to Paste Meal</Text>
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
                      if (date) setSelectedPasteDate(date);
                    }}
                  />
                )}
              </View>

              {/* Meal Time Selection */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Select Meal Time</Text>
                <RadioButton.Group
                  onValueChange={(newValue) => setSelectedPasteMealTime(newValue)}
                  value={selectedPasteMealTime}
                >
                  <RadioButton.Item label="Breakfast" value="breakfast" />
                  <RadioButton.Item label="Lunch" value="lunch" />
                  <RadioButton.Item label="Dinner" value="dinner" />
                </RadioButton.Group>
              </View>

              {/* Confirm Button */}
              <Button 
                mode="contained" 
                onPress={handlePasteMeal}
              >
                Paste Meal
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => setIsPasteModalVisible(false)}
              >
                Cancel
              </Button>
            </Card.Content>
          </Card>
        </Modal>

        <Modal visible={isIngredientsModalVisible} onDismiss={() => setIsIngredientsModalVisible(false)} contentContainerStyle={styles.modalContainer}>
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
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  daysContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dayButton: {
    padding: 12,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDay: {
    backgroundColor: '#6200ea',
  },
  selectedDayText: {
    color: '#ffffff',  // Make text white when day is selected
  },
  mealCard: {
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 10,
  },
  mainGenerateButton: {
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: '#6200ea',
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#6200ea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 20,
  },
  modalCard: {
    borderRadius: 15,
    padding: 20,
    backgroundColor: '#fff',
  },
  textInput: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  listItem: {
    marginVertical: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  addIconPlus: {
    margin: 0,
    padding: 0,
    backgroundColor: '#4caf50',
    borderRadius: 20,
  },
  addIconMinus: {
    margin: 0,
    padding: 0,
    backgroundColor: '#f44336',
    borderRadius: 20,
  },
  selectedDateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  modalCard: {
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  dateButton: {
    width: '100%',
    marginVertical: 5,
  },
  daysInput: {
    backgroundColor: '#fff',
  },
  checkboxContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 5,
  },
  checkbox: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalGenerateButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#6200ea',
  },
  modalCancelButton: {
    flex: 1,
    marginLeft: 10,
    borderColor: '#6200ea',
  },
  mealCard: {
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  mealHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6200ea',
  },
  calories: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  mealDetails: {
    padding: 5,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  viewIngredientsButton: {
    marginTop: 10,
    backgroundColor: '#6200ea',
  },
  daysInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysInput: {
    width: 70,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  incrementButton: {
    paddingHorizontal: 5,
    justifyContent: 'center',
  },
  decrementButton: {
    paddingHorizontal: 5,
    justifyContent: 'center',
  },
  copyButton: {
    marginTop: 10,
    backgroundColor: '#6200ea',
  },
});

export default MealPlanScreen;

