import axios from "axios";

const APP_ID = process.env.EDAMAM_APP_ID;
const APP_KEY = process.env.EDAMAM_API_KEY;

// Map our preferences to Edamam API parameters
const DIET_MAPPING = {
  Balanced: "balanced",
  "High-Protein": "high-protein",
  "Low-Carb": "low-carb",
};

const HEALTH_MAPPING = {
  Vegetarian: "vegetarian",
  Vegan: "vegan",
};

const ALLERGY_MAPPING = {
  Dairy: "dairy-free",
  Eggs: "egg-free",
  Nuts: "tree-nut-free",
  Shellfish: "shellfish-free",
  Wheat: "wheat-free",
  Pork: "pork-free",
};

export const searchRecipes = async (query, params = {}) => {
  try {
    //console.log("Search params:", params);

    // Build query parameters
    let queryParams = new URLSearchParams();

    // Required parameters
    queryParams.append("type", "public");
    queryParams.append("q", query);
    queryParams.append("app_id", APP_ID);
    queryParams.append("app_key", APP_KEY);

    // Add mealType if provided
    if (params.mealType) {
      queryParams.append("mealType", params.mealType);
    }

    // Add calories if provided
    if (params.calories) {
      const minCal = Math.max(0, params.calories - 150); // Allow 150 cal range
      const maxCal = params.calories + 150;
      queryParams.append("calories", `${minCal}-${maxCal}`);
    }

    // Add dietary preferences
    if (params.dietaryPreferences) {
      // Handle diet parameter (only one can be applied)
      const diets = params.dietaryPreferences.filter(
        (pref) => DIET_MAPPING[pref]
      );
      if (diets.length > 0) {
        queryParams.append("diet", DIET_MAPPING[diets[0]]);
      }

      // Handle health parameters (multiple can be applied)
      params.dietaryPreferences.forEach((pref) => {
        if (HEALTH_MAPPING[pref]) {
          queryParams.append("health", HEALTH_MAPPING[pref]);
        }
      });
    }

    // Add allergy restrictions
    if (params.allergies) {
      params.allergies.forEach((allergy) => {
        if (ALLERGY_MAPPING[allergy]) {
          queryParams.append("health", ALLERGY_MAPPING[allergy]);
        }
        // Also exclude the allergen from ingredients
        queryParams.append("excluded", allergy.toLowerCase());
      });
    }

    const url = `https://api.edamam.com/api/recipes/v2?${queryParams.toString()}`;
    //console.log("API URL:", url);

    const response = await axios.get(url);

    if (!response.data || !response.data.hits) {
      //console.log("API Response:", response.data);
      throw new Error("Invalid response format from Edamam API");
    }

    //console.log(`Found ${response.data.hits.length} recipes`);
    return response.data.hits;
  } catch (error) {
    console.error("API Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};
