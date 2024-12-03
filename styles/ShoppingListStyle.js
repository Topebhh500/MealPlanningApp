import { StyleSheet } from "react-native";

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

export default styles;
