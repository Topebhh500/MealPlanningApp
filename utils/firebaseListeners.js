import { firestore, auth } from '../api/firebase';

class FirebaseListeners {
  constructor() {
    this.unsubscribers = {};
  }

  // Shopping List Listener
  subscribeToShoppingList(callback) {
    const user = auth.currentUser;
    if (!user) return null;

    // Unsubscribe from existing listener if any
    if (this.unsubscribers.shoppingList) {
      this.unsubscribers.shoppingList();
    }

    // Create new listener
    this.unsubscribers.shoppingList = firestore
      .collection('shoppingLists')
      .doc(user.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          callback(doc.data().items || []);
        } else {
          callback([]);
        }
      }, (error) => {
        console.error('Error in shopping list listener:', error);
      });

    return () => {
      if (this.unsubscribers.shoppingList) {
        this.unsubscribers.shoppingList();
      }
    };
  }

  // Stock Listener
  subscribeToStock(callback) {
    const user = auth.currentUser;
    if (!user) return null;

    if (this.unsubscribers.stock) {
      this.unsubscribers.stock();
    }

    this.unsubscribers.stock = firestore
      .collection('stocks')
      .doc(user.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          callback(doc.data().items || []);
        } else {
          callback([]);
        }
      }, (error) => {
        console.error('Error in stock listener:', error);
      });

    return () => {
      if (this.unsubscribers.stock) {
        this.unsubscribers.stock();
      }
    };
  }

  // Meal Plan Listener
  subscribeToMealPlan(callback) {
    const user = auth.currentUser;
    if (!user) return null;

    if (this.unsubscribers.mealPlan) {
      this.unsubscribers.mealPlan();
    }

    this.unsubscribers.mealPlan = firestore
      .collection('mealPlans')
      .doc(user.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          callback(doc.data());
        } else {
          callback({});
        }
      }, (error) => {
        console.error('Error in meal plan listener:', error);
      });

    return () => {
      if (this.unsubscribers.mealPlan) {
        this.unsubscribers.mealPlan();
      }
    };
  }

  // Clean up all listeners
  cleanup() {
    Object.values(this.unsubscribers).forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.unsubscribers = {};
  }
}

export const firebaseListeners = new FirebaseListeners();