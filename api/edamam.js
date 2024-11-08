
import axios from 'axios';

const APP_ID = '426e4515';
const APP_KEY = '8b54c6e42347dab83119322ebc44c71a';
const BASE_URL = 'https://api.edamam.com/api/recipes/v2';

export const searchRecipes = async (query, mealType) => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        type: 'public',
        q: query,
        app_id: APP_ID,
        app_key: APP_KEY,
        mealType: mealType,
      },
    });
    return response.data.hits;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};
