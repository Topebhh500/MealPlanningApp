import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "./api/firebase";
import { View } from "react-native";

// Import screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import MealPlanScreen from "./screens/MealPlanScreen";
import ShoppingListScreen from "./screens/ShoppingListScreen";
import NearbyStoresScreen from "./screens/NearbyStoresScreen";
import ProfileScreen from "./screens/ProfileScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator for authenticated users
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Meal Plan") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "Shop List") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Stores") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: focused ? 65 : size, // Make width bigger when focused
                height: focused ? 70 : size, // Make height larger to cover icon and label
                borderTopLeftRadius: focused ? 30 : 0, // Circular top
                borderTopRightRadius: focused ? 30 : 0, // Circular top
                backgroundColor: focused ? "#6200ea" : "transparent", // Color for active tab
                overflow: "hidden", // Ensures no overflow on the circle shape
                paddingBottom: focused ? 5 : 0, // No space at the bottom for active tab
                paddingTop: focused ? 5 : 0, // Adjust to center the icon and text
              }}
            >
              <Ionicons
                name={iconName}
                size={size}
                color={focused ? "white" : color}
              />
            </View>
          );
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
          color: "gray",
        },
        tabBarActiveTintColor: "white", // Text color when focused
        tabBarInactiveTintColor: "gray", // Text color when inactive
        tabBarStyle: {
          paddingBottom: 0, // No space at the bottom
          height: 50,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Meal Plan" component={MealPlanScreen} />
      <Tab.Screen name="Shop List" component={ShoppingListScreen} />
      <Tab.Screen name="Stores" component={NearbyStoresScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  function onAuthStateChanged(user) {
    //console.log('User state changed:', user);
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // Unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <PaperProvider>
      <NavigationContainer>
        {user ? (
          // Stack navigator for authenticated users
          <Stack.Navigator>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        ) : (
          // Stack navigator for unauthenticated users (login flow)
          <Stack.Navigator>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}
