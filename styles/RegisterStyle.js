import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#6200ea",
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    elevation: 5,
  },
  headerTitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 20,
  },
  appTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  registerButton: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#6200ea",
    padding: 5,
    borderRadius: 10,
  },
  loginButton: {
    marginTop: 10,
  },
  loginButtonText: {
    color: "#6200ea",
  },
  snackbar: {
    backgroundColor: "#323232",
  },
});

export default styles;
