// screens/ShoppingListScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, List, TextInput, Button, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShoppingListScreen = () => {
  const [shoppingList, setShoppingList] = useState([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    loadShoppingList();
  }, []);

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

  const saveShoppingList = async (list) => {
    try {
      await AsyncStorage.setItem('shoppingList', JSON.stringify(list));
    } catch (error) {
      console.error('Error saving shopping list:', error);
    }
  };

  const addItem = () => {
    if (newItem.trim()) {
      const updatedList = [...shoppingList, { name: newItem.trim(), checked: false }];
      setShoppingList(updatedList);
      saveShoppingList(updatedList);
      setNewItem('');
    }
  };

  const toggleItem = (index) => {
    const updatedList = shoppingList.map((item, i) => 
      i === index ? { ...item, checked: !item.checked } : item
    );
    setShoppingList(updatedList);
    saveShoppingList(updatedList);
  };

  const removeItem = (index) => {
    const updatedList = shoppingList.filter((_, i) => i !== index);
    setShoppingList(updatedList);
    saveShoppingList(updatedList);
  };

  const generateListFromMealPlan = async () => {
    try {
      const mealPlan = await AsyncStorage.getItem('mealPlan');
      if (mealPlan) {
        const meals = JSON.parse(mealPlan);
        const ingredients = meals.flatMap(meal => meal.ingredients);
        const uniqueIngredients = [...new Set(ingredients)];
        const newList = uniqueIngredients.map(ingredient => ({ name: ingredient, checked: false }));
        setShoppingList(newList);
        saveShoppingList(newList);
      }
    } catch (error) {
      console.error('Error generating shopping list from meal plan:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Shopping List</Title>

      <Button mode="contained" onPress={generateListFromMealPlan} style={styles.button}>
        Generate from Meal Plan
      </Button>

      <View style={styles.addItemContainer}>
        <TextInput
          label="Add Item"
          value={newItem}
          onChangeText={setNewItem}
          style={styles.input}
        />
        <Button onPress={addItem}>Add</Button>
      </View>

      {shoppingList.map((item, index) => (
        <List.Item
          key={index}
          title={item.name}
          left={() => (
            <IconButton
              icon={item.checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
              onPress={() => toggleItem(index)}
            />
          )}
          right={() => (
            <IconButton
              icon="delete"
              onPress={() => removeItem(index)}
            />
          )}
          style={item.checked ? styles.checkedItem : {}}
        />
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
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  checkedItem: {
    opacity: 0.5,
  },
});

export default ShoppingListScreen;