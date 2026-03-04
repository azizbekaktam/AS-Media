import { auth, db } from '../../../../firebase';
import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { validateUser } from '../model/types';

export class UserAPI {
  async getUserData(uid) {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        return { uid, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  async updateUserRole(uid, role) {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async updateUserPlan(uid, plan) {
    try {
      await updateDoc(doc(db, 'users', uid), { plan });
    } catch (error) {
      console.error('Error updating user plan:', error);
      throw error;
    }
  }

  async deleteUser(uid) {
    try {
      // Note: This would require additional Firebase Admin SDK setup for full user deletion
      // For now, we'll just delete the user document
      await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  async getUserStats(uid) {
    try {
      const [historySnap, likedSnap, watchlistSnap] = await Promise.all([
        getDocs(collection(db, 'users', uid, 'history')),
        getDocs(collection(db, 'users', uid, 'liked')),
        getDocs(collection(db, 'users', uid, 'watchlist'))
      ]);

      return {
        watchedCount: historySnap.size,
        likedCount: likedSnap.size,
        watchlistCount: watchlistSnap.size
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        unsubscribe();
        if (user) {
          try {
            const userData = await this.getUserData(user.uid);
            resolve(userData);
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(null);
        }
      });
    });
  }
}

export const userAPI = new UserAPI();
