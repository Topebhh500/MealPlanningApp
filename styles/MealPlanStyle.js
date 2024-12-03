import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // Container and Layout
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    marginTop: 8,
  },

  // Date Navigation
  daysContainer: {
    flexDirection: "row",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  dayButton: {
    padding: 12,
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minWidth: 80,
    alignItems: "center",
  },
  selectedDay: {
    backgroundColor: "#6200ea",
  },
  dayText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedDayText: {
    color: "#fff",
  },

  // Meal Cards
  mealCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  warningCard: {
    borderColor: "#ff9800",
    borderWidth: 1,
  },
  mealHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200ea",
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  calories: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  warningText: {
    color: "#ff9800",
  },

  // Meal Images
  mealImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
  },
  placeholderImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  // Meal Details
  mealDetails: {
    padding: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  cookingTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  nutritionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  nutritionItem: {
    alignItems: "center",
    flex: 1,
  },
  nutritionLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  // Buttons and Actions
  generateButton: {
    marginVertical: 16,
    backgroundColor: "#6200ea",
    paddingVertical: 8,
    elevation: 2,
    borderRadius: 8,
  },
  viewIngredientsButton: {
    backgroundColor: "#6200ea",
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 8,
  },

  // Modals
  modalContainer: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalScrollView: {
    maxHeight: 400,
  },

  // Form Elements
  input: {
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  checkbox: {
    marginVertical: 4,
  },
  checkboxContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 5,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },

  // Loading and Progress
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#666",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginVertical: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6200ea",
    borderRadius: 2,
  },

  // Ingredients List
  ingredientsList: {
    paddingTop: 8,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  ingredientTitle: {
    fontSize: 16,
    color: "#333",
  },

  // Empty States
  emptyCard: {
    margin: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },

  // Date Picker
  datePickerButton: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  datePickerButtonText: {
    textAlign: "center",
    color: "#333",
    fontSize: 16,
  },

  // Modal Buttons
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalCancelButton: {
    backgroundColor: "#f5f5f5",
  },
  modalSubmitButton: {
    backgroundColor: "#6200ea",
  },

  daysInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  daysInput: {
    width: 70,
    textAlign: "center",
    marginHorizontal: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },

  // Error States
  errorText: {
    color: "#f44336",
    fontSize: 14,
    marginTop: 4,
  },

  // Success States
  successText: {
    color: "#4caf50",
    fontSize: 14,
    marginTop: 4,
  },

  // Responsive Design Adjustments
  tabletContainer: {
    paddingHorizontal: 24,
  },
  tabletMealCard: {
    marginHorizontal: 24,
  },
  landscapeDaysContainer: {
    marginBottom: 24,
  },

  // Accessibility
  accessibilityText: {
    fontSize: 18,
  },
  highContrastText: {
    color: "#000",
  },
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 8,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  ingredientsList: {
    maxHeight: 400,
  },
  ingredientActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  dateButton: {
    marginVertical: 8,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalSubmitButton: {
    backgroundColor: "#6200ea",
  },
  modalCancelButton: {
    borderColor: "#6200ea",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#6200ea",
  },
});

export default styles;
