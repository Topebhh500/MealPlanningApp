import axios from 'axios';

const SPOONACULAR_API_KEY = '43a5ea2a667846bf814d06758b5c388c';
const BASE_URL = 'https://api.spoonacular.com';

export const searchRecipes = async (query, mealType, diet = '', intolerances = '') => {
  try {
    const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        query: query,
        type: mealType,
        diet: diet,
        intolerances: intolerances,
        addRecipeInformation: true,
        fillIngredients: true,
        number: 10, // Limit to 10 results
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};

export const getRecipeInformation = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/recipes/${id}/information`, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        includeNutrition: true,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recipe information:', error);
    throw error;
  }
};