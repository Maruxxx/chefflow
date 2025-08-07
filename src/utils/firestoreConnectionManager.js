import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../../firebase';
export class FirestoreConnectionManager {
  static async checkConnection() {
    try {
      await disableNetwork(db);
      await enableNetwork(db);
      console.log('✅ Firestore connection restored');
      return true;
    } catch (error) {
      console.error('❌ Firestore connection failed:', error);
      return false;
    }
  }
  static async retryConnection(maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      console.log(`🔄 Attempting Firestore reconnection (${i + 1}/${maxRetries})`);
      const success = await this.checkConnection();
      if (success) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
    console.error('❌ Failed to restore Firestore connection after', maxRetries, 'attempts');
    return false;
  }
  static handleConnectionError(error, context = '') {
    console.warn(`⚠️ Firestore connection error ${context}:`, error);
    if (error.code === 'unavailable' || error.message.includes('transport errored')) {
      console.log('🔄 Attempting to restore connection...');
      this.retryConnection();
    }
  }
}
export const setupFirestoreErrorHandling = () => {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', () => {
      console.log('📶 Network back online, checking Firestore connection');
      FirestoreConnectionManager.checkConnection();
    });
    window.addEventListener('offline', () => {
      console.log('📵 Network offline detected');
    });
  }
};
