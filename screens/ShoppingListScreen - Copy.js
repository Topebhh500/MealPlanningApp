import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Title, List, TextInput, Button, IconButton, Divider, Dialog, Portal } from 'react-native-paper';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { firestore, auth } from '../api/firebase';

const ShoppingListScreen = () => {
  const [shoppingList, setShoppingList] = useState([]);
  const [stock, setStock] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editedQuantity, setEditedQuantity] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'shoppingList', title: 'Items to Buy' },
    { key: 'stock', title: 'Available Stock' }
  ]);

  useEffect(() => {
    loadShoppingListFromFirebase();
    loadStockFromFirebase();
  }, []);

  const loadShoppingListFromFirebase = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const shoppingListSnapshot = await firestore.collection('shoppingLists').doc(user.uid).get();
        if (shoppingListSnapshot.exists) {
          setShoppingList(shoppingListSnapshot.data().items || []);
        }
      }
    } catch (error) {
      console.error('Error loading shopping list from Firebase:', error);
    }
  };

  const loadStockFromFirebase = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const stockSnapshot = await firestore.collection('stocks').doc(user.uid).get();
        if (stockSnapshot.exists) {
          setStock(stockSnapshot.data().items || []);
        }
      }
    } catch (error) {
      console.error('Error loading stock from Firebase:', error);
    }
  };

  const saveShoppingListToFirebase = async (shoppingList) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await firestore.collection('shoppingLists').doc(user.uid).set({
          items: shoppingList,
        });
      }
    } catch (error) {
      console.error('Error saving shopping list to Firebase:', error);
    }
  };

  const saveStockToFirebase = async (stockList) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await firestore.collection('stocks').doc(user.uid).set({
          items: stockList,
        });
      }
    } catch (error) {
      console.error('Error saving stock to Firebase:', error);
    }
  };

  const addItem = () => {
    if (newItem.trim()) {
      const updatedList = [...shoppingList, { name: newItem.trim(), checked: false }];
      setShoppingList(updatedList);
      saveShoppingListToFirebase(updatedList);
      setNewItem('');
    } else {
      Alert.alert('Invalid Input', 'Item name cannot be empty.');
    }
  };

  const toggleItem = (index) => {
    const updatedList = shoppingList.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );
    setShoppingList(updatedList);
    saveShoppingListToFirebase(updatedList);
  };

  const removeItem = (index) => {
    const updatedList = shoppingList.filter((_, i) => i !== index);
    setShoppingList(updatedList);
    saveShoppingListToFirebase(updatedList);
  };

  const moveToStock = (item) => {
    const updatedShoppingList = shoppingList.filter((listItem) => listItem.name !== item.name);
    const updatedStock = [...stock, { name: item.name, quantity: 1 }];

    setShoppingList(updatedShoppingList);
    setStock(updatedStock);

    saveShoppingListToFirebase(updatedShoppingList);
    saveStockToFirebase(updatedStock);

    Alert.alert('Item Moved', `${item.name} has been moved to Available Stocks.`);
  };

  const showEditDialog = (item) => {
    setEditedQuantity(item.quantity.toString());
    setSelectedItem(item);
    setEditDialogVisible(true);
  };

  const hideEditDialog = () => {
    setEditDialogVisible(false);
    setSelectedItem(null);
  };

  const updateStockItem = () => {
    const updatedStock = stock.map((item) =>
      item === selectedItem ? { ...item, quantity: parseInt(editedQuantity) } : item
    );
    setStock(updatedStock);
    saveStockToFirebase(updatedStock);
    hideEditDialog();
  };

  const removeStockItem = (item) => {
    const updatedStock = stock.filter((stockItem) => stockItem !== item);
    setStock(updatedStock);
    saveStockToFirebase(updatedStock);
  };

  const renderShoppingListItem = (item, index) => (
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
        <View style={styles.iconContainer}>
          <IconButton
            icon="check"
            onPress={() => {
              moveToStock(item); // Move the item to Stock
            }}
            accessibilityLabel="Move to Stock"
          />
          <IconButton
            icon="delete"
            onPress={() => {
              removeItem(index);
            }}
            accessibilityLabel="Remove"
          />
        </View>
      )}
      style={item.checked ? styles.checkedItem : {}}
    />
  );

  const renderStockItem = (item, index) => (
    <List.Item
      key={index}
      title={`${item.name} (Quantity: ${item.quantity})`}
      right={() => (
        <View style={styles.iconContainer}>
          <IconButton
            icon="pencil"
            onPress={() => {
              showEditDialog(item);
            }}
            accessibilityLabel="Edit"
          />
          <IconButton
            icon="delete"
            onPress={() => {
              removeStockItem(item);
            }}
            accessibilityLabel="Delete"
          />
        </View>
      )}
    />
  );

  const ShoppingListTab = () => (
    <ScrollView style={styles.container}>
      <Title style={styles.subtitle}>Items to Buy</Title>
      {shoppingList.map((item, index) => renderShoppingListItem(item, index))}
    </ScrollView>
  );

  const StockTab = () => (
    <ScrollView style={styles.container}>
      <Title style={styles.subtitle}>Available Stocks</Title>
      {stock.map((item, index) => renderStockItem(item, index))}
    </ScrollView>
  );

  return (
    <View style={{ flex: 1 }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap({
          shoppingList: ShoppingListTab,
          stock: StockTab,
        })}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: 'blue' }}
            style={{ backgroundColor: 'white' }}
            labelStyle={{ color: 'black' }}
          />
        )}
      />

      <View style={styles.addItemContainer}>
        <TextInput
          style={styles.input}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add new item"
        />
        <Button onPress={addItem}>Add</Button>
      </View>

      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={hideEditDialog}>
          <Dialog.Title>Edit Stock</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Quantity"
              value={editedQuantity}
              onChangeText={setEditedQuantity}
              keyboardType="numeric"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideEditDialog}>Cancel</Button>
            <Button onPress={updateStockItem}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  checkedItem: {
    opacity: 0.5,
  },
  addItemContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ShoppingListScreen;
