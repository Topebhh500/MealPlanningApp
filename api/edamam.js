import axios from "axios";
import { EDAMAM_APP_ID, EDAMAM_API_KEY } from "@env";

const APP_ID = EDAMAM_APP_ID;
const APP_KEY = EDAMAM_API_KEY;
const BASE_URL = "https://api.edamam.com/api/recipes/v2";

export const searchRecipes = async (query, mealType) => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        type: "public",
        q: query,
        app_id: APP_ID,
        app_key: APP_KEY,
        mealType: mealType,
      },
    });
    return response.data.hits;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
};
