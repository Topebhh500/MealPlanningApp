import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addressContainer: {
    padding: 10,
    backgroundColor: "#6200ea",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  addressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  map: {
    flex: 2, // MapView takes 2/3 of the screen height
    width: Dimensions.get("window").width,
  },
  storeList: {
    flex: 1, // FlatList takes 1/3 of the screen height
    backgroundColor: "#fff",
  },
  storeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  storeName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  storeDistance: {
    color: "#555",
    marginTop: 5,
    fontSize: 14,
  },
  storeAddress: {
    color: "#777",
    marginTop: 5,
  },
});

export default styles;
