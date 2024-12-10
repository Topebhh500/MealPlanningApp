import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#6200ea",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    marginLeft: 15,
  },
  welcomeText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  avatar: {
    borderWidth: 3,
    borderColor: "#fff",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    marginTop: -30,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    elevation: 4,
    borderRadius: 15,
    backgroundColor: "#ffffff",
  },
  statContent: {
    alignItems: "center",
    padding: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200ea",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  profileCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  preferencesContainer: {
    borderRadius: 10,
    elevation: 2,
    backgroundColor: "#fff",
    padding: 15,
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  preferenceText: {
    marginLeft: 10,
    color: "#333",
    flex: 1,
  },
  mealsCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200ea",
  },
  mealCard: {
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: "#fff",
  },
  mealCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  mealImagePlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  mealIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  mealTextContainer: {
    flex: 1,
  },
  mealHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  timeText: {
    fontSize: 12,
    color: "#6200ea",
    fontWeight: "bold",
  },
  mealName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  nutritionContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  nutritionText: {
    fontSize: 12,
    color: "#666",
  },
  nutritionDot: {
    marginHorizontal: 5,
    color: "#6200ea",
  },
  updateButton: {
    backgroundColor: "#6200ea",
  },
  viewAllButton: {
    backgroundColor: "#6200ea",
  },
  shoppingButton: {
    margin: 20,
    marginTop: 0,
    marginBottom: 30,
    backgroundColor: "#6200ea",
    borderRadius: 10,
  },
  buttonLabel: {
    fontSize: 14,
    color: "#fff",
  },
  mealEmptyText: {
    color: "#999",
    fontStyle: "italic",
    marginBottom: 8,
  },
  addMealButton: {
    backgroundColor: "#6200ea",
    marginTop: 8,
    borderRadius: 8,
  },
});

export default styles;
