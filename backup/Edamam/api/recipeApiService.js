import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EDAMAM_APP_ID = '426e4515';
const EDAMAM_APP_KEY = '8b54c6e42347dab83119322ebc44c71a';
const SPOONACULAR_API_KEY = '43a5ea2a667846bf814d06758b5c388c';

const getApiPreference = async () => {
  try {
    const apiPreference = await AsyncStorage.getItem('apiPreference');
    return apiPreference || 'edamam'; // Default to Edamam if not set
  } catch (error) {
    console.error('Error getting API preference:', error);
    return 'edamam'; // Default to Edamam in case of error
  }
};

const setApiPreference = async (preference) => {
  try {
    await AsyncStorage.setItem('apiPreference', preference);
  } catch (error) {
    console.error('Error setting API preference:', error);
  }
};

const searchRecipesEdamam = async (query, mealType) => {
  try {
    const response = await axios.get(`https://api.edamam.com/search`, {
      params: {
        q: query,
        app_id: EDAMAM_APP_ID,
        app_key: EDAMAM_APP_KEY,
        mealType: mealType,
      },
    });
    return response.data.hits.map(hit => ({
      id: hit.recipe.uri,
      name: hit.recipe.label,
      image: hit.recipe.image,
      calories: Math.round(hit.recipe.calories),
      protein: Math.round(hit.recipe.totalNutrients.PROCNT.quantity),
      carbs: Math.round(hit.recipe.totalNutrients.CHOCDF.quantity),
      fat: Math.round(hit.recipe.totalNutrients.FAT.quantity),
      ingredients: hit.recipe.ingredientLines,
    }));
  } catch (error) {
    console.error('Error searching recipes with Edamam:', error);
    return [];
  }
};

const searchRecipesSpoonacular = async (query, mealType) => {
  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        query: query,
        type: mealType,
        addRecipeNutrition: true,
        number: 10, // Limit results to 10
      },
    });
    return response.data.results.map(recipe => ({
      id: recipe.id.toString(),
      name: recipe.title,
      image: recipe.image,
      calories: Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Calories').amount),
      protein: Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Protein').amount),
      carbs: Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Carbohydrates').amount),
      fat: Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Fat').amount),
      ingredients: recipe.nutrition.ingredients.map(i => i.name),
    }));
  } catch (error) {
    console.error('Error searching recipes with Spoonacular:', error);
    return [];
  }
};

const searchRecipes = async (query, mealType) => {
  const apiPreference = await getApiPreference();
  return apiPreference === 'edamam' 
    ? searchRecipesEdamam(query, mealType)
    : searchRecipesSpoonacular(query, mealType);
};

export { searchRecipes, getApiPreference, setApiPreference };