import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Surface,
  TextInput,
  Button,
  IconButton,
  Dialog,
  Portal,
  Text,
} from "react-native-paper";
import { TabView, SceneMap } from "react-native-tab-view";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { firestore, auth } from "../api/firebase";

const ShoppingListTab = ({
  shoppingList,
  onToggleItem,
  onMoveToStock,
  onRemoveItem,
}) => (
  <ScrollView style={styles.container}>
    {shoppingList.length === 0 ? (
      <View style={styles.emptyState}>
        <Icon name="cart-outline" size={48} color="#6200ea" />
        <Text style={styles.emptyStateText}>Your shopping list is empty</Text>
        <Text style={styles.emptyStateSubText}>Add items to get started</Text>
      </View>
    ) : (
      shoppingList.map((item, index) => (
        <Surface key={index} style={styles.listItem}>
          <View style={styles.itemContainer}>
            <IconButton
              icon={item.checked ? "checkbox-marked" : "checkbox-blank-outline"}
              color="#6200ea"
              onPress={() => onToggleItem(index)}
            />
            <Text
              style={[styles.itemText, item.checked && styles.checkedItemText]}
            >
              {item.name}
            </Text>
            <View style={styles.iconContainer}>
              <IconButton
                icon="check"
                color="#4CAF50"
                onPress={() => onMoveToStock(item)}
              />
              <IconButton
                icon="delete"
                color="#F44336"
                onPress={() => onRemoveItem(index)}
              />
            </View>
          </View>
        </Surface>
      ))
    )}
  </ScrollView>
);

const StockTab = ({ stock, onEditItem, onRemoveItem }) => (
  <ScrollView style={styles.container}>
    {stock.length === 0 ? (
      <View style={styles.emptyState}>
        <Icon name="package-variant" size={48} color="#6200ea" />
        <Text style={styles.emptyStateText}>No items in stock</Text>
        <Text style={styles.emptyStateSubText}>
          Move items here from your shopping list
        </Text>
      </View>
    ) : (
      stock.map((item, index) => (
        <Surface key={index} style={styles.listItem}>
          <View style={styles.itemContainer}>
            <Icon
              name="package-variant"
              size={24}
              color="#6200ea"
              style={styles.stockIcon}
            />
            <View style={styles.stockItemTextContainer}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemDescription}>
                Quantity: {item.quantity}
              </Text>
            </View>
            <View style={styles.iconContainer}>
              <IconButton
                icon="pencil"
                color="#6200ea"
                onPress={() => onEditItem(item)}
              />
              <IconButton
                icon="delete"
                color="#F44336"
                onPress={() => onRemoveItem(item)}
              />
            </View>
          </View>
        </Surface>
      ))
    )}
  </ScrollView>
);

const ShoppingListScreen = () => {
  const [shoppingList, setShoppingList] = useState([]);
  const [stock, setStock] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editedQuantity, setEditedQuantity] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "shoppingList", title: "Items to Buy" },
    { key: "stock", title: "Available Stock" },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const [shoppingListDoc, stockDoc] = await Promise.all([
          firestore.collection("shoppingLists").doc(user.uid).get(),
          firestore.collection("stocks").doc(user.uid).get(),
        ]);

        setShoppingList(
          shoppingListDoc.exists ? shoppingListDoc.data().items || [] : []
        );
        setStock(stockDoc.exists ? stockDoc.data().items || [] : []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load data");
    }
  };

  const saveToFirebase = async (collection, items) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await firestore.collection(collection).doc(user.uid).set({ items });
      }
    } catch (error) {
      throw new Error(`Error saving to ${collection}: ${error.message}`);
    }
  };

  const addItem = async () => {
    if (newItem.trim()) {
      try {
        const updatedList = [
          ...shoppingList,
          { name: newItem.trim(), checked: false },
        ];
        await saveToFirebase("shoppingLists", updatedList);
        setShoppingList(updatedList);
        setNewItem("");
      } catch (error) {
        Alert.alert("Error", "Failed to add item");
      }
    }
  };

  const toggleItem = async (index) => {
    try {
      const updatedList = shoppingList.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      );
      await saveToFirebase("shoppingLists", updatedList);
      setShoppingList(updatedList);
    } catch (error) {
      Alert.alert("Error", "Failed to update item");
    }
  };

  const removeShoppingItem = async (index) => {
    try {
      const updatedList = shoppingList.filter((_, i) => i !== index);
      await saveToFirebase("shoppingLists", updatedList);
      setShoppingList(updatedList);
    } catch (error) {
      Alert.alert("Error", "Failed to remove item");
    }
  };

  const moveToStock = async (item) => {
    try {
      const updatedShoppingList = shoppingList.filter(
        (listItem) => listItem.name !== item.name
      );
      const updatedStock = [...stock, { name: item.name, quantity: 1 }];

      await Promise.all([
        saveToFirebase("shoppingLists", updatedShoppingList),
        saveToFirebase("stocks", updatedStock),
      ]);

      setShoppingList(updatedShoppingList);
      setStock(updatedStock);
    } catch (error) {
      Alert.alert("Error", "Failed to move item to stock");
    }
  };

  const showEditDialog = (item) => {
    setSelectedItem(item);
    setEditedQuantity(item.quantity.toString());
    setEditDialogVisible(true);
  };

  const updateStockItem = async () => {
    const quantity = parseInt(editedQuantity);
    if (!quantity || quantity < 1) {
      Alert.alert("Invalid Input", "Please enter a valid quantity");
      return;
    }

    try {
      const updatedStock = stock.map((item) =>
        item === selectedItem ? { ...item, quantity } : item
      );
      await saveToFirebase("stocks", updatedStock);
      setStock(updatedStock);
      setEditDialogVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update quantity");
    }
  };

  const removeStockItem = async (item) => {
    try {
      const updatedStock = stock.filter((stockItem) => stockItem !== item);
      await saveToFirebase("stocks", updatedStock);
      setStock(updatedStock);
    } catch (error) {
      Alert.alert("Error", "Failed to remove item");
    }
  };

  const renderTabBar = (props) => (
    <View style={styles.tabBarContainer}>
      {props.navigationState.routes.map((route, i) => (
        <TouchableOpacity
          key={route.key}
          style={[
            styles.tabItem,
            { borderBottomColor: index === i ? "#6200ea" : "transparent" },
          ]}
          onPress={() => setIndex(i)}
        >
          <Text
            style={[
              styles.tabLabel,
              { color: index === i ? "#6200ea" : "#666" },
            ]}
          >
            {route.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderScene = SceneMap({
    shoppingList: () => (
      <ShoppingListTab
        shoppingList={shoppingList}
        onToggleItem={toggleItem}
        onMoveToStock={moveToStock}
        onRemoveItem={removeShoppingItem}
      />
    ),
    stock: () => (
      <StockTab
        stock={stock}
        onEditItem={showEditDialog}
        onRemoveItem={removeStockItem}
      />
    ),
  });

  return (
    <View style={styles.mainContainer}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get("window").width }}
        renderTabBar={renderTabBar}
      />

      <Surface style={styles.addItemContainer}>
        <TextInput
          style={styles.input}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add new item"
          mode="outlined"
          outlineColor="#6200ea"
          activeOutlineColor="#6200ea"
          right={
            <TextInput.Icon icon="plus" color="#6200ea" onPress={addItem} />
          }
          onSubmitEditing={addItem}
        />
      </Surface>

      <Portal>
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => setEditDialogVisible(false)}
        >
          <Dialog.Title>Edit Stock Quantity</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Quantity"
              value={editedQuantity}
              onChangeText={setEditedQuantity}
              keyboardType="numeric"
              mode="outlined"
              outlineColor="#6200ea"
              activeOutlineColor="#6200ea"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setEditDialogVisible(false)}
              textColor="#666"
            >
              Cancel
            </Button>
            <Button onPress={updateStockItem} textColor="#6200ea">
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  listItem: {
    backgroundColor: "#fff",
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  checkedItemText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  stockItemTextContainer: {
    flex: 1,
  },
  itemDescription: {
    color: "#666",
    fontSize: 14,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addItemContainer: {
    padding: 16,
    backgroundColor: "#fff",
    elevation: 4,
  },
  input: {
    backgroundColor: "#fff",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#333",
    marginTop: 16,
    fontWeight: "bold",
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  stockIcon: {
    marginHorizontal: 16,
  },
});

export default ShoppingListScreen;
